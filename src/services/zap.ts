import { ZapTransaction } from '../types';
import { lpAgent } from './lpAgent';

export interface ZapParams {
  poolAddress: string;
  inputToken: string;
  inputAmount: number;
  fromBinId: number;
  toBinId: number;
  ownerAddress: string;
  slippageBps?: number;
}

export interface ZapOutParams {
  poolAddress: string;
  lpTokenAmount: number;
  ownerAddress: string;
  slippageBps?: number;
}

class ZapService {
  async zapIn(params: ZapParams): Promise<ZapTransaction> {
    const { poolAddress, inputToken, inputAmount, fromBinId, toBinId, ownerAddress, slippageBps = 500 } = params;

    const txData = await lpAgent.generateZapInTx(poolAddress, {
      inputToken,
      inputAmount,
      fromBinId,
      toBinId,
      owner: ownerAddress,
      slippageBps,
    });

    const result = await lpAgent.submitTransaction(txData.transactions);

    return {
      poolAddress,
      type: 'zap_in',
      amountIn: inputAmount,
      amountOut: 0,
      txHash: result.txHashes[0],
      status: 'completed',
      timestamp: Date.now(),
    };
  }

  async zapOut(params: ZapOutParams): Promise<ZapTransaction> {
    const { poolAddress, lpTokenAmount, ownerAddress, slippageBps = 500 } = params;

    const txData = await lpAgent.generateZapOutTx(poolAddress, {
      lpTokenAmount,
      owner: ownerAddress,
      slippageBps,
    });

    const result = await lpAgent.submitTransaction(txData.transactions);

    return {
      poolAddress,
      type: 'zap_out',
      amountIn: 0,
      amountOut: lpTokenAmount,
      txHash: result.txHashes[0],
      status: 'completed',
      timestamp: Date.now(),
    };
  }

  async getActiveBin(poolAddress: string): Promise<{ binId: number; price: number }> {
    const poolInfo = await lpAgent.getPoolInfo(poolAddress);
    return {
      binId: 0,
      price: 0,
    };
  }

  async calculateBinRange(poolAddress: string, rangePercent: number = 10): Promise<{ fromBinId: number; toBinId: number }> {
    const activeBin = await this.getActiveBin(poolAddress);
    const binStep = Math.floor((activeBin.binId * rangePercent) / 100);
    
    return {
      fromBinId: activeBin.binId - binStep,
      toBinId: activeBin.binId + binStep,
    };
  }
}

export const zapService = new ZapService();
export default ZapService;