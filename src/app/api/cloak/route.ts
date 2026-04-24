import { NextRequest, NextResponse } from 'next/server';
import { cloakService } from '@/services/cloak';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, recipientAddress, rpcUrl, cloakKeypair } = body;

    if (!action || !amount) {
      return NextResponse.json(
        { error: 'Action and amount required' },
        { status: 400 }
      );
    }

    if (rpcUrl && cloakKeypair) {
      await cloakService.initialize(rpcUrl, Buffer.from(cloakKeypair, 'base64'));
    }

    const amountLamports = BigInt(Math.floor(amount * 1e9));
    let result;

    switch (action) {
      case 'shield':
        result = await cloakService.shieldFunds(amountLamports);
        break;
      case 'send':
        if (!recipientAddress) {
          return NextResponse.json(
            { error: 'Recipient address required for send action' },
            { status: 400 }
          );
        }
        result = await cloakService.sendPrivate(recipientAddress, amountLamports);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: shield, send, swap, withdraw' },
          { status: 400 }
        );
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Cloak operation error:', error);
    return NextResponse.json(
      { error: 'Cloak operation failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    description: 'NetFlow Cloak API - Private execution layer',
    endpoints: {
      POST: {
        shield: 'Deposit funds into Cloak UTXO system',
        send: 'Private transfer to recipient',
        withdraw: 'Withdraw from Cloak to public address',
      },
    },
  });
}