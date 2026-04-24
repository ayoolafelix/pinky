import { NextRequest, NextResponse } from 'next/server';
import { lpAgent } from '@/services/lpAgent';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Wallet address required' },
      { status: 400 }
    );
  }

  try {
    const portfolio = await lpAgent.calculatePnL(address);
    return NextResponse.json({ data: portfolio });
  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}