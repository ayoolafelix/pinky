import { LPPosition, PoolInfo, OptimizationRecommendation, ExecutionPlan, ExecutionStep } from '../types';

export interface OptimizationParams {
  portfolio: LPPosition[];
  riskTolerance: number;
  minYieldThreshold: number;
  targetYield: number;
}

export interface YieldScore {
  poolAddress: string;
  yield: number;
  tvl: number;
  volume: number;
  score: number;
  recommendation: 'zap_in' | 'zap_out' | 'hold';
}

class OptimizerEngine {
  private riskWeights = {
    tvl: 0.3,
    volume: 0.2,
    yield: 0.4,
    concentration: 0.1,
  };

  calculateYieldScore(position: LPPosition, poolData?: PoolInfo): number {
    let score = position.apr * 100;
    
    if (poolData) {
      const tvlScore = Math.log10(poolData.tvl + 1) / 15;
      const volumeScore = Math.log10(poolData.volume24h + 1) / 12;
      score += tvlScore * this.riskWeights.tvl * 100;
      score += volumeScore * this.riskWeights.volume * 100;
    }

    if (position.pnlPercent < 0) {
      score -= Math.abs(position.pnlPercent) * 0.5;
    }

    return score;
  }

  analyzePositions(positions: LPPosition[]): YieldScore[] {
    return positions.map(pos => {
      const score = this.calculateYieldScore(pos);
      let recommendation: 'zap_in' | 'zap_out' | 'hold' = 'hold';
      
      if (score < 0) {
        recommendation = 'zap_out';
      } else if (score > 15) {
        recommendation = 'zap_in';
      }

      return {
        poolAddress: pos.poolAddress,
        yield: pos.apr,
        tvl: pos.amountX + pos.amountY,
        volume: pos.feesEarned * 100,
        score,
        recommendation,
      };
    });
  }

  generateRecommendations(
    positions: LPPosition[],
    params: Partial<OptimizationParams> = {}
  ): OptimizationRecommendation[] {
    const { riskTolerance = 50, minYieldThreshold = 5, targetYield = 12 } = params;
    const totalValue = positions.reduce((sum, p) => sum + p.amountX + p.amountY, 0);
    const scores = this.analyzePositions(positions);
    
    const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length || 0;
    const topScore = Math.max(...scores.map(s => s.score));
    const bottomScore = Math.min(...scores.map(s => s.score));

    return positions.map((pos, index) => {
      const score = scores[index];
      const normalizedScore = topScore === bottomScore ? 0.5 : (score.score - bottomScore) / (topScore - bottomScore);
      const currentAllocation = totalValue > 0 ? ((pos.amountX + pos.amountY) / totalValue) * 100 : 0;
      
      let recommendedAllocation = currentAllocation;
      let action: 'zap_in' | 'zap_out' | 'hold' = 'hold';
      let reason = '';
      let expectedYieldChange = 0;

      if (score.score < avgScore - 5 && currentAllocation > 10) {
        recommendedAllocation = currentAllocation * 0.7;
        action = 'zap_out';
        reason = 'Underperforming pool - reallocate to higher yield opportunities';
        expectedYieldChange = (score.score - avgScore) * 0.1;
      } else if (score.score > avgScore + 10 && normalizedScore > 0.7) {
        recommendedAllocation = currentAllocation * 1.3;
        action = 'zap_in';
        reason = 'Highperforming pool - increase exposure';
        expectedYieldChange = (score.score - avgScore) * 0.15;
      } else if (pos.apr < minYieldThreshold) {
        action = 'zap_out';
        reason = `APR (${pos.apr.toFixed(2)}%) below minimum threshold`;
        recommendedAllocation = currentAllocation * 0.5;
        expectedYieldChange = pos.apr * 0.2;
      } else {
        reason = 'Optimal allocation maintained';
      }

      return {
        poolAddress: pos.poolAddress,
        currentAllocation,
        recommendedAllocation: Math.min(recommendedAllocation, currentAllocation * 1.5),
        expectedYieldChange,
        reason,
        action,
      };
    });
  }

  createExecutionPlan(
    portfolio: {
      positions: LPPosition[];
      totalValue: number;
      yieldAPY: number;
    },
    params: Partial<OptimizationParams> = {}
  ): ExecutionPlan {
    const recommendations = this.generateRecommendations(portfolio.positions, params);
    
    const valueBefore = portfolio.totalValue;
    let valueAfter = valueBefore;
    let yieldBefore = portfolio.yieldAPY;
    let yieldAfter = yieldBefore;

    const steps: ExecutionStep[] = [];
    let stepIndex = 0;

    recommendations.forEach((rec, index) => {
      if (rec.action === 'zap_out' && rec.currentAllocation > rec.recommendedAllocation) {
        const exitAmount = (rec.currentAllocation - rec.recommendedAllocation) / 100 * valueBefore;
        
        steps.push({
          id: `step_${stepIndex++}`,
          type: 'zap_out',
          status: 'pending',
          poolAddress: rec.poolAddress,
          amount: exitAmount,
        });

        valueAfter -= exitAmount;
        yieldAfter += rec.expectedYieldChange;
      }
    });

    recommendations.forEach((rec) => {
      if (rec.action === 'zap_in' && rec.currentAllocation < rec.recommendedAllocation) {
        const entryAmount = (rec.recommendedAllocation - rec.currentAllocation) / 100 * valueAfter;
        
        steps.push({
          id: `step_${stepIndex++}`,
          type: 'zap_in',
          status: 'pending',
          poolAddress: rec.poolAddress,
          amount: entryAmount,
        });

        valueAfter += entryAmount;
        yieldAfter += rec.expectedYieldChange;
      }
    });

    return {
      id: `plan_${Date.now()}`,
      recommendations,
      totalValueBefore: valueBefore,
      totalValueAfter: valueAfter,
      expectedYieldBefore: yieldBefore,
      expectedYieldAfter: yieldAfter,
      steps,
    };
  }
}

export const optimizerEngine = new OptimizerEngine();
export default OptimizerEngine;