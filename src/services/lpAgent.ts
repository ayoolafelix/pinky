import { PoolInfo, LPPosition, Portfolio } from '../types';

const LP_AGENT_API_BASE = process.env.NEXT_PUBLIC_LP_AGENT_API || 'https://api.lpagent.io/v1';
const LP_AGENT_API_KEY = process.env.LP_AGENT_API_KEY;

export interface LPAgentPosition {
  pool_address: string;
  pool_name: string;
  token_x: string;
  token_y: string;
  amount_x: number;
  amount_y: number;
  lp_tokens: number;
  apr: number;
  fees_earned_24h: number;
  pnl: number;
  pnl_percent: number;
  last_updated: number;
}

export interface LPAgentPoolInfo {
  address: string;
  name: string;
  token_x: string;
  token_y: string;
  tvl: number;
  volume_24h: number;
  apr: number;
  pool_type: string;
}

export interface LPAgentPortfolio {
  positions: LPAgentPosition[];
  total_value: number;
  total_pnl: number;
  total_pnl_percent: number;
  yield_24h: number;
  yield_apy: number;
}

class LPAgentService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || LP_AGENT_API_KEY || '';
    this.baseUrl = LP_AGENT_API_BASE;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('LP Agent API key not configured');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LP Agent API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async getPortfolio(ownerAddress: string): Promise<Portfolio> {
    try {
      const data = await this.request<{ data: LPAgentPortfolio }>(`/portfolio/${ownerAddress}`);
      
      return {
        positions: data.data.positions.map(p => ({
          poolAddress: p.pool_address,
          poolName: p.pool_name,
          tokenX: p.token_x,
          tokenY: p.token_y,
          amountX: p.amount_x,
          amountY: p.amount_y,
          lpTokens: p.lp_tokens,
          apr: p.apr,
          feesEarned: p.fees_earned_24h,
          pnl: p.pnl,
          pnlPercent: p.pnl_percent,
          lastUpdated: p.last_updated,
        })),
        totalValue: data.data.total_value,
        totalPnL: data.data.total_pnl,
        totalPnLPercent: data.data.total_pnl_percent,
        yield24h: data.data.yield_24h,
        yieldAPY: data.data.yield_apy,
      };
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      throw error;
    }
  }

  async discoverPools(params: {
    tokenX?: string;
    tokenY?: string;
    minTvl?: number;
    protocol?: 'DLMM' | 'DAMM_V2';
  }): Promise<PoolInfo[]> {
    const queryParams = new URLSearchParams();
    if (params.tokenX) queryParams.set('tokenX', params.tokenX);
    if (params.tokenY) queryParams.set('tokenY', params.tokenY);
    if (params.minTvl) queryParams.set('minTvl', params.minTvl.toString());
    if (params.protocol) queryParams.set('protocol', params.protocol);

    try {
      const data = await this.request<{ data: LPAgentPoolInfo[] }>(`/pools/discover?${queryParams}`);
      return data.data.map(p => ({
        address: p.address,
        name: p.name,
        tokenX: p.token_x,
        tokenY: p.token_y,
        tvl: p.tvl,
        volume24h: p.volume_24h,
        apr: p.apr,
        poolType: p.pool_type as 'DLMM' | 'DAMM_V1' | 'DAMM_V2',
      }));
    } catch (error) {
      console.error('Failed to discover pools:', error);
      throw error;
    }
  }

  async getPoolInfo(poolAddress: string): Promise<PoolInfo> {
    try {
      const data = await this.request<{ data: LPAgentPoolInfo }>(`/pools/${poolAddress}/info`);
      return {
        address: data.data.address,
        name: data.data.name,
        tokenX: data.data.token_x,
        tokenY: data.data.token_y,
        tvl: data.data.tvl,
        volume24h: data.data.volume_24h,
        apr: data.data.apr,
        poolType: data.data.pool_type as 'DLMM' | 'DAMM_V1' | 'DAMM_V2',
      };
    } catch (error) {
      console.error('Failed to get pool info:', error);
      throw error;
    }
  }

  async getUserPositions(ownerAddress: string): Promise<LPPosition[]> {
    try {
      const data = await this.request<{ data: LPAgentPosition[] }>(`/positions/${ownerAddress}`);
      return data.data.map(p => ({
        poolAddress: p.pool_address,
        poolName: p.pool_name,
        tokenX: p.token_x,
        tokenY: p.token_y,
        amountX: p.amount_x,
        amountY: p.amount_y,
        lpTokens: p.lp_tokens,
        apr: p.apr,
        feesEarned: p.fees_earned_24h,
        pnl: p.pnl,
        pnlPercent: p.pnl_percent,
        lastUpdated: p.last_updated,
      }));
    } catch (error) {
      console.error('Failed to get user positions:', error);
      throw error;
    }
  }

  async calculatePnL(ownerAddress: string): Promise<Portfolio> {
    return this.getPortfolio(ownerAddress);
  }

  async generateZapInTx(poolAddress: string, params: {
    inputToken: string;
    inputAmount: number;
    fromBinId: number;
    toBinId: number;
    owner: string;
    slippageBps?: number;
  }): Promise<{ transactions: string[] }> {
    try {
      const data = await this.request<{ data: { transactions: string[] } }>(`/pools/${poolAddress}/add-tx`, {
        method: 'POST',
        body: JSON.stringify({
          strategy: 'Spot',
          inputToken: params.inputToken,
          inputAmount: params.inputAmount,
          percentX: 0.5,
          fromBinId: params.fromBinId,
          toBinId: params.toBinId,
          owner: params.owner,
          slippage_bps: params.slippageBps || 500,
          mode: 'zap-in',
        }),
      });
      return data.data;
    } catch (error) {
      console.error('Failed to generate zap in tx:', error);
      throw error;
    }
  }

  async generateZapOutTx(poolAddress: string, params: {
    lpTokenAmount: number;
    owner: string;
    slippageBps?: number;
  }): Promise<{ transactions: string[] }> {
    try {
      const data = await this.request<{ data: { transactions: string[] } }>(`/pools/${poolAddress}/remove-tx`, {
        method: 'POST',
        body: JSON.stringify({
          lpTokenAmount: params.lpTokenAmount,
          owner: params.owner,
          slippage_bps: params.slippageBps || 500,
          mode: 'zap-out',
        }),
      });
      return data.data;
    } catch (error) {
      console.error('Failed to generate zap out tx:', error);
      throw error;
    }
  }

  async submitTransaction(transactions: string[]): Promise<{ txHashes: string[] }> {
    try {
      const data = await this.request<{ data: { txHashes: string[] } }>('/pools/landing-add-tx', {
        method: 'POST',
        body: JSON.stringify({ transactions }),
      });
      return data.data;
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      throw error;
    }
  }

  async analyzePortfolio(ownerAddress: string): Promise<{
    score: number;
    riskLevel: string;
    suggestions: string[];
    topPools: PoolInfo[];
  }> {
    try {
      const data = await this.request<{
        data: {
          score: number;
          risk_level: string;
          suggestions: string[];
          top_pools: LPAgentPoolInfo[];
        };
      }>(`/portfolio/${ownerAddress}/analyze`);

      return {
        score: data.data.score,
        riskLevel: data.data.risk_level,
        suggestions: data.data.suggestions,
        topPools: data.data.top_pools.map(p => ({
          address: p.address,
          name: p.name,
          tokenX: p.token_x,
          tokenY: p.token_y,
          tvl: p.tvl,
          volume24h: p.volume_24h,
          apr: p.apr,
          poolType: p.pool_type as 'DLMM' | 'DAMM_V1' | 'DAMM_V2',
        })),
      };
    } catch (error) {
      console.error('Failed to analyze portfolio:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }
}

export const lpAgent = new LPAgentService();
export default LPAgentService;