import { NextRequest, NextResponse } from 'next/server';
import { optimizerEngine } from '@/services/optimizer';
import { LPPosition } from '@/types';

export async function GET() {
  return NextResponse.json({
    description: 'NetFlow Optimization API - Generate execution plans from LP positions',
    endpoints: {
      POST: {
        description: 'Generate execution plan from positions',
        body: {
          positions: 'LPPosition[] (required)',
          totalValue: 'number (optional)',
          yieldAPY: 'number (optional)',
          riskTolerance: 'number (default: 50)',
          minYieldThreshold: 'number (default: 5)',
          targetYield: 'number (default: 12)'
        }
      }
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { positions, totalValue, yieldAPY, riskTolerance, minYieldThreshold, targetYield } = body;

    if (!positions || !Array.isArray(positions)) {
      return NextResponse.json(
        { error: 'Positions array required' },
        { status: 400 }
      );
    }

    const portfolio = {
      positions,
      totalValue: totalValue || 0,
      yieldAPY: yieldAPY || 0,
    };

    const executionPlan = optimizerEngine.createExecutionPlan(portfolio, {
      riskTolerance: riskTolerance || 50,
      minYieldThreshold: minYieldThreshold || 5,
      targetYield: targetYield || 12,
    });

    return NextResponse.json({ data: executionPlan });
  } catch (error) {
    console.error('Optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to generate optimization plan' },
      { status: 500 }
    );
  }
}