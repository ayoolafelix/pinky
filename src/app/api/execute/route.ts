import { NextRequest, NextResponse } from 'next/server';
import { optimizerEngine } from '@/services/optimizer';
import { cloakService } from '@/services/cloak';
import { zapService } from '@/services/zap';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, recommendations, walletAddress, rpcUrl, cloakKeypair } = body;

    if (!planId || !recommendations) {
      return NextResponse.json(
        { error: 'Plan ID and recommendations required' },
        { status: 400 }
      );
    }

    if (rpcUrl && cloakKeypair) {
      await cloakService.initialize(rpcUrl, Buffer.from(cloakKeypair, 'base64'));
    }

    const results: Array<{
      stepId: string;
      type: string;
      status: string;
      txHash?: string;
      error?: string;
    }> = [];

    for (const rec of recommendations) {
      if (rec.action === 'zap_out') {
        try {
          const binRange = await zapService.calculateBinRange(rec.poolAddress);
          
          const currentPosition = 0;
          const exitAmount = ((rec.currentAllocation - rec.recommendedAllocation) / 100) * currentPosition;

          if (exitAmount > 0) {
            const zapResult = await zapService.zapOut({
              poolAddress: rec.poolAddress,
              lpTokenAmount: exitAmount,
              ownerAddress: walletAddress,
            });

            results.push({
              stepId: `zap_out_${rec.poolAddress.slice(0, 8)}`,
              type: 'zap_out',
              status: 'completed',
              txHash: zapResult.txHash,
            });
          }
        } catch (err) {
          results.push({
            stepId: `zap_out_${rec.poolAddress.slice(0, 8)}`,
            type: 'zap_out',
            status: 'failed',
            error: err instanceof Error ? err.message : 'Zap out failed',
          });
        }
      } else if (rec.action === 'zap_in') {
        try {
          const binRange = await zapService.calculateBinRange(rec.poolAddress);
          
          const entryAmount = ((rec.recommendedAllocation - rec.currentAllocation) / 100) * 1000;

          if (entryAmount > 10) {
            const zapResult = await zapService.zapIn({
              poolAddress: rec.poolAddress,
              inputToken: 'SOL',
              inputAmount: entryAmount,
              fromBinId: binRange.fromBinId,
              toBinId: binRange.toBinId,
              ownerAddress: walletAddress,
            });

            results.push({
              stepId: `zap_in_${rec.poolAddress.slice(0, 8)}`,
              type: 'zap_in',
              status: 'completed',
              txHash: zapResult.txHash,
            });
          }
        } catch (err) {
          results.push({
            stepId: `zap_in_${rec.poolAddress.slice(0, 8)}`,
            type: 'zap_in',
            status: 'failed',
            error: err instanceof Error ? err.message : 'Zap in failed',
          });
        }
      }
    }

    return NextResponse.json({ data: { planId, results } });
  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json(
      { error: 'Execution failed' },
      { status: 500 }
    );
  }
}