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
  binIds?: number[];
  protocol?: 'DLMM' | 'DAMM_V1' | 'DAMM_V2';
  tvl?: number;
  volume24h?: number;
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
  binStep?: number;
  minBinId?: number;
  maxBinId?: number;
  activeBin?: number;
  creator?: string;
}

export interface Portfolio {
  positions: LPPosition[];
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  yield24h: number;
  yieldAPY: number;
  treasury?: TreasuryInfo;
}

export interface TreasuryInfo {
  totalBalance: number;
  shieldedBalance: number;
  publicBalance: number;
  pendingOperations: number;
  lastUpdated: number;
}

export interface OptimizationRecommendation {
  poolAddress: string;
  currentAllocation: number;
  recommendedAllocation: number;
  expectedYieldChange: number;
  reason: string;
  action: 'zap_in' | 'zap_out' | 'hold';
  priority: 'high' | 'medium' | 'low';
  riskScore: number;
  confidence: number;
}

export interface ExecutionPlan {
  id: string;
  recommendations: OptimizationRecommendation[];
  totalValueBefore: number;
  totalValueAfter: number;
  expectedYieldBefore: number;
  expectedYieldAfter: number;
  riskScoreBefore: number;
  riskScoreAfter: number;
  steps: ExecutionStep[];
  estimatedGas?: number;
  estimatedTime?: number;
}

export interface ExecutionStep {
  id: string;
  type: 'cloak_shield' | 'cloak_send' | 'cloak_swap' | 'cloak_pay' | 'zap_in' | 'zap_out';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  poolAddress?: string;
  amount?: number;
  fromToken?: string;
  toToken?: string;
  txHash?: string;
  error?: string;
  estimatedTime?: number;
}

export interface CloakTransaction {
  requestId: string;
  type: 'deposit' | 'withdraw' | 'swap' | 'transfer' | 'pay';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  timestamp: number;
  recipient?: string;
  memo?: string;
}

export interface ZapTransaction {
  poolAddress: string;
  type: 'zap_in' | 'zap_out';
  amountIn: number;
  amountOut: number;
  txHash?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: number;
  binRange?: {
    fromBinId: number;
    toBinId: number;
  };
}

export interface ExecutionHistory {
  id: string;
  timestamp: number;
  type: 'optimization' | 'manual' | 'cloak';
  valueBefore: number;
  valueAfter: number;
  yieldBefore: number;
  yieldAfter: number;
  steps: ExecutionStep[];
  txHashes: string[];
}

export interface ShieldedBalance {
  total: number;
  available: number;
  locked: number;
  pending: number;
}

export interface PrivacyTransaction {
  id: string;
  type: 'shield' | 'unshield' | 'transfer' | 'swap';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: number;
  memo?: string;
}

export interface ViewingKey {
  id: string;
  label: string;
  createdAt: number;
  permissions: string[];
  expiresAt?: number;
}

export interface AuditReport {
  id: string;
  generatedAt: number;
  transactions: PrivacyTransaction[];
  summary: {
    totalVolume: number;
    shieldVolume: number;
    unshieldVolume: number;
    transferVolume: number;
  };
}

export interface Analytics {
  historicalApr: { date: string; value: number }[];
  feeGeneration: { date: string; fees: number }[];
  impermanentLoss: { date: string; il: number }[];
  yieldForecast: { date: string; expected: number }[];
}

export interface WhaleMirror {
  address: string;
  totalValue: number;
  positions: { pool: string; allocation: number }[];
  strategy: string;
  lastUpdated: number;
}

export interface ComplianceReport {
  id: string;
  generatedAt: number;
  period: { start: number; end: number };
  transactions: PrivacyTransaction[];
  exportFormat: 'pdf' | 'csv' | 'json';
}