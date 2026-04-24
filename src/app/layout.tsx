import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Pinky | Private LP Treasury OS',
  description: 'Private LP Treasury OS for Meteora Liquidity Providers - Track, optimize, and rebalance LP positions with privacy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}