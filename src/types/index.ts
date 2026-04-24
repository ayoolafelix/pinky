export interface LPPosition {
  poolAddress: string;
  poolName: string;
  tokenX: string;
  tokenY: string;
  amountX: number;
  amountY: number;
  lpTokens: number;
  apr: number;
  feesEarned: number;
  pnl: number;
  pnlPercent: number;
  lastUpdated: number;
}

export interface PoolInfo {
  address: string;
  name: string;
  tokenX: string;
  tokenY: string;
  tvl: number;
  volume24h: number;
  apr: number;
  poolType: 'DLMM' | 'DAMM_V1' | 'DAMM_V2';
}

export interface Portfolio {
  positions: LPPosition[];
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  yield24h: number;
  yieldAPY: number;
}

export interface OptimizationRecommendation {
  poolAddress: string;
  currentAllocation: number;
  recommendedAllocation: number;
  expectedYieldChange: number;
  reason: string;
  action: 'zap_in' | 'zap_out' | 'hold';
}

export interface ExecutionPlan {
  id: string;
  recommendations: OptimizationRecommendation[];
  totalValueBefore: number;
  totalValueAfter: number;
  expectedYieldBefore: number;
  expectedYieldAfter: number;
  steps: ExecutionStep[];
}

export interface ExecutionStep {
  id: string;
  type: 'cloak_shield' | 'cloak_send' | 'cloak_swap' | 'zap_in' | 'zap_out';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  poolAddress?: string;
  amount?: number;
  fromToken?: string;
  toToken?: string;
  txHash?: string;
  error?: string;
}

export interface CloakTransaction {
  requestId: string;
  type: 'deposit' | 'withdraw' | 'swap' | 'transfer';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  timestamp: number;
}

export interface ZapTransaction {
  poolAddress: string;
  type: 'zap_in' | 'zap_out';
  amountIn: number;
  amountOut: number;
  txHash?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: number;
}

export interface ExecutionHistory {
  id: string;
  timestamp: number;
  type: 'optimization' | 'manual';
  valueBefore: number;
  valueAfter: number;
  yieldBefore: number;
  yieldAfter: number;
  steps: ExecutionStep[];
  txHashes: string[];
}