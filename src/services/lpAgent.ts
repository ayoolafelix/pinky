import { PoolInfo, LPPosition, Portfolio } from '../types';

const LP_AGENT_API_BASE = process.env.NEXT_PUBLIC_LP_AGENT_API || 'https://api.lpagent.io/v1';
const LP_AGENT_API_KEY = process.env.LP_AGENT_API_KEY;

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
      throw new Error(`LP Agent API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
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

    const data = await this.request<{ data: PoolInfo[] }>(`/pools/discover?${queryParams}`);
    return data.data;
  }

  async getPoolInfo(poolAddress: string): Promise<PoolInfo> {
    const data = await this.request<{ data: PoolInfo }>(`/pools/${poolAddress}/info`);
    return data.data;
  }

  async getUserPositions(ownerAddress: string): Promise<LPPosition[]> {
    const data = await this.request<{ data: LPPosition[] }>(`/positions/${ownerAddress}`);
    return data.data;
  }

  async calculatePnL(ownerAddress: string): Promise<Portfolio> {
    const positions = await this.getUserPositions(ownerAddress);
    
    const totalValue = positions.reduce((sum, p) => sum + (p.amountX + p.amountY), 0);
    const totalPnL = positions.reduce((sum, p) => sum + p.pnl, 0);
    const totalPnLPercent = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0;
    const yield24h = positions.reduce((sum, p) => sum + (p.feesEarned || 0), 0);
    const yieldAPY = positions.reduce((sum, p) => sum + (p.apr || 0) * p.lpTokens, 0) / positions.length || 0;

    return {
      positions,
      totalValue,
      totalPnL,
      totalPnLPercent,
      yield24h,
      yieldAPY,
    };
  }

  async generateZapInTx(poolAddress: string, params: {
    inputToken: string;
    inputAmount: number;
    fromBinId: number;
    toBinId: number;
    owner: string;
    slippageBps?: number;
  }): Promise<{ transactions: string[] }> {
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
  }

  async generateZapOutTx(poolAddress: string, params: {
    lpTokenAmount: number;
    owner: string;
    slippageBps?: number;
  }): Promise<{ transactions: string[] }> {
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
  }

  async submitTransaction(transactions: string[]): Promise<{ txHashes: string[] }> {
    const data = await this.request<{ data: { txHashes: string[] } }>('/pools/landing-add-tx', {
      method: 'POST',
      body: JSON.stringify({ transactions }),
    });
    return data.data;
  }
}

export const lpAgent = new LPAgentService();
export default LPAgentService;