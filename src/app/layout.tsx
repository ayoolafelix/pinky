import type { Metadata } from 'next';
import '@/styles/globals.css';
import { WalletProvider } from '@/components/providers/WalletProvider';

export const metadata: Metadata = {
  title: 'Pinky | Private LP Treasury OS',
  description: 'Private LP Treasury OS for Meteora Liquidity Providers - Track, optimize, and rebalance LP positions with privacy',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}