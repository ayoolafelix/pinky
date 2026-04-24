'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePinkyStore } from '@/lib/store';
import Header from '@/components/Header';
import PortfolioCard from '@/components/PortfolioCard';
import PositionsTable from '@/components/PositionsTable';
import OptimizeButton from '@/components/OptimizeButton';
import ExecutionFeed from '@/components/ExecutionFeed';
import WelcomeModal from '@/components/WelcomeModal';

const DEMO_POSITIONS = [
  {
    poolAddress: 'ARwi1S4DaiTG5DX7S4M4ZsrXqpMD1MrTmbu9ue2tpmEq',
    poolName: 'USDC/SOL',
    tokenX: 'USDC',
    tokenY: 'SOL',
    amountX: 4500,
    amountY: 25,
    lpTokens: 5000,
    apr: 8.5,
    feesEarned: 2.8,
    pnl: 320,
    pnlPercent: 6.8,
    lastUpdated: Date.now(),
  },
  {
    poolAddress: 'Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB',
    poolName: 'USDT/USDC',
    tokenX: 'USDT',
    tokenY: 'USDC',
    amountX: 8000,
    amountY: 7950,
    lpTokens: 7800,
    apr: 4.2,
    feesEarned: 1.2,
    pnl: -150,
    pnlPercent: -0.95,
    lastUpdated: Date.now(),
  },
  {
    poolAddress: 'Dn4A8FxKb3U1ysV4Qd1GFL4KG3eospE9xzLz35Ef4sL',
    poolName: 'SOL/RAY',
    tokenX: 'SOL',
    tokenY: 'RAY',
    amountX: 1200,
    amountY: 15000,
    lpTokens: 2800,
    apr: 15.2,
    feesEarned: 5.5,
    pnl: 890,
    pnlPercent: 12.4,
    lastUpdated: Date.now(),
  },
  {
    poolAddress: '2a7Jd8FxKB3U1ysV4Qd1GFL4KG3eospE9xzLz35Ef5M',
    poolName: 'mSOL/SOL',
    tokenX: 'mSOL',
    tokenY: 'SOL',
    amountX: 3200,
    amountY: 3100,
    lpTokens: 3400,
    apr: 6.8,
    feesEarned: 1.8,
    pnl: 45,
    pnlPercent: 0.7,
    lastUpdated: Date.now(),
  },
];

export default function Home() {
  const { walletConnected, walletAddress, portfolio, isLoading, setPortfolio, setLoading, setError } = usePinkyStore();
  const [showWelcome, setShowWelcome] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  const loadPortfolio = useCallback(async () => {
    if (!walletAddress && !demoMode) return;
    
    setLoading(true);
    setError(null);

    try {
      const positions = DEMO_POSITIONS;
      const totalValue = positions.reduce((sum, p) => sum + p.amountX + p.amountY, 0);
      const totalPnL = positions.reduce((sum, p) => sum + p.pnl, 0);
      
      const portfolioData = {
        positions,
        totalValue,
        totalPnL,
        totalPnLPercent: (totalPnL / totalValue) * 100,
        yield24h: positions.reduce((sum, p) => sum + p.feesEarned, 0),
        yieldAPY: positions.reduce((sum, p) => sum + p.apr * (p.amountX + p.amountY), 0) / totalValue,
      };

      setPortfolio(portfolioData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [walletAddress, demoMode, setPortfolio, setLoading, setError]);

  useEffect(() => {
    if (walletConnected || demoMode) {
      loadPortfolio();
    }
  }, [walletConnected, demoMode, loadPortfolio]);

  const handleConnectDemo = () => {
    setDemoMode(true);
    setShowWelcome(false);
  };

  return (
    <main>
      <Header onDemoMode={demoMode} />
      
      <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
        {portfolio ? (
          <>
            <PortfolioCard portfolio={portfolio} isLoading={isLoading} />
            
            <div className="grid grid-2" style={{ marginTop: '24px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                  LP Positions
                </h2>
                <PositionsTable positions={portfolio.positions} />
              </div>
              
              <div>
                <OptimizeButton 
                  portfolio={portfolio} 
                  onOptimize={loadPortfolio}
                  demoMode={demoMode}
                />
                
                <div style={{ marginTop: '24px' }}>
                  <ExecutionFeed />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '60vh',
            textAlign: 'center',
          }}>
            {isLoading ? (
              <>
                <div className="skeleton" style={{ width: '200px', height: '200px', borderRadius: '50%', margin: '0 auto 24px' }} />
                <div className="skeleton" style={{ width: '300px', height: '24px', marginBottom: '12px' }} />
                <div className="skeleton" style={{ width: '200px', height: '16px' }} />
              </>
            ) : (
              <>
                <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px' }}>
                  No Portfolio Connected
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px' }}>
                  Connect your wallet or use demo mode to see how Pinky optimizes your LP positions with privacy.
                </p>
                <button className="btn btn-primary" onClick={handleConnectDemo}>
                  Try Demo Mode
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <WelcomeModal 
        isOpen={showWelcome} 
        onClose={() => setShowWelcome(false)}
        onDemo={handleConnectDemo}
      />
    </main>
  );
}