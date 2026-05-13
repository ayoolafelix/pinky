'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePinkyStore } from '@/lib/store';
import { useWallet } from '@solana/wallet-adapter-react';
import Header from '@/components/Header';
import PortfolioCard from '@/components/PortfolioCard';
import PositionsTable from '@/components/PositionsTable';
import OptimizeButton from '@/components/OptimizeButton';
import ExecutionFeed from '@/components/ExecutionFeed';
import WelcomeModal from '@/components/WelcomeModal';
import TreasuryPanel from '@/components/treasury/TreasuryPanel';
import AnalyticsPanel from '@/components/analytics/AnalyticsPanel';
import SettingsPanel from '@/components/settings/SettingsPanel';
import { lpAgent } from '@/services/lpAgent';
import { Wallet, TrendingUp, Shield, Activity } from 'lucide-react';

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
  const { 
    walletConnected, 
    walletAddress, 
    portfolio, 
    isLoading, 
    demoMode, 
    viewMode,
    setPortfolio, 
    setLoading, 
    setError,
    setDemoMode,
  } = usePinkyStore();
  
  const { connected } = useWallet();
  const [showWelcome, setShowWelcome] = useState(true);
  const [portfolioScore, setPortfolioScore] = useState<{
    score: number;
    riskLevel: string;
    suggestions: string[];
  } | null>(null);

  const loadPortfolio = useCallback(async () => {
    if (!walletAddress && !demoMode) return;
    
    setLoading(true);
    setError(null);

    try {
      let positions = DEMO_POSITIONS;
      
      if (walletAddress && lpAgent.isConfigured()) {
        try {
          const portfolioData = await lpAgent.getPortfolio(walletAddress);
          positions = portfolioData.positions;
          setPortfolio(portfolioData);
          
          const analysis = await lpAgent.analyzePortfolio(walletAddress);
          setPortfolioScore({
            score: analysis.score,
            riskLevel: analysis.riskLevel,
            suggestions: analysis.suggestions,
          });
        } catch (apiError) {
          console.warn('LP Agent API unavailable, using demo data:', apiError);
          positions = DEMO_POSITIONS;
        }
      }
      
      const totalValue = positions.reduce((sum, p) => sum + p.amountX + p.amountY, 0);
      const totalPnL = positions.reduce((sum, p) => sum + p.pnl, 0);
      
      const portfolioData = {
        positions,
        totalValue,
        totalPnL,
        totalPnLPercent: (totalPnL / totalValue) * 100,
        yield24h: positions.reduce((sum, p) => sum + p.feesEarned, 0),
        yieldAPY: positions.reduce((sum, p) => sum + p.apr * (p.amountX + p.amountY), 0) / totalValue,
        treasury: {
          totalBalance: totalValue,
          shieldedBalance: totalValue * 0.3,
          publicBalance: totalValue * 0.7,
          pendingOperations: 0,
          lastUpdated: Date.now(),
        },
      };

      setPortfolio(portfolioData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [walletAddress, demoMode, setPortfolio, setLoading, setError]);

  useEffect(() => {
    if (connected && !demoMode) {
      loadPortfolio();
    } else if (demoMode) {
      loadPortfolio();
    }
  }, [connected, demoMode, loadPortfolio]);

  useEffect(() => {
    if (walletConnected || demoMode) {
      loadPortfolio();
    }
  }, [walletConnected, demoMode, loadPortfolio]);

  const handleConnectDemo = () => {
    setDemoMode(true);
    setShowWelcome(false);
  };

  const handleConnectWallet = () => {
    setShowWelcome(false);
  };

  const formatScore = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'var(--success)' };
    if (score >= 60) return { label: 'Good', color: 'var(--accent-primary)' };
    if (score >= 40) return { label: 'Fair', color: 'var(--warning)' };
    return { label: 'Needs Attention', color: 'var(--error)' };
  };

  const scoreInfo = portfolioScore ? formatScore(portfolioScore.score) : null;

  const renderDashboard = () => (
    <>
      <div className="grid grid-4">
        <div className="stat-card">
          <div className="stat-label">Portfolio Score</div>
          <div className="stat-value" style={{ color: scoreInfo?.color || 'var(--text-primary)' }}>
            {portfolioScore ? portfolioScore.score : '--'}
          </div>
          {scoreInfo && (
            <div style={{ 
              fontSize: '13px', 
              marginTop: '8px',
              color: scoreInfo.color 
            }}>
              {scoreInfo.label}
            </div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-label">Risk Level</div>
          <div className="stat-value">
            {portfolioScore?.riskLevel || '--'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            {portfolioScore?.suggestions?.length || 0} suggestions
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pool Exposure</div>
          <div className="stat-value">
            {portfolio?.positions?.length || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Active positions
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Capital Efficiency</div>
          <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>
            {portfolio?.totalValue && portfolio.yieldAPY 
              ? (portfolio.yieldAPY / 12).toFixed(1) + '%'
              : '--'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Monthly avg
          </div>
        </div>
      </div>

      <PortfolioCard portfolio={portfolio!} isLoading={isLoading} />
      
      <div className="grid grid-2" style={{ marginTop: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
            LP Positions
          </h2>
          <PositionsTable positions={portfolio?.positions || []} />
        </div>
        
        <div>
          <OptimizeButton 
            portfolio={portfolio!} 
            onOptimize={loadPortfolio}
            demoMode={demoMode}
          />
          
          <div style={{ marginTop: '24px' }}>
            <ExecutionFeed />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <main>
      <Header onDemoMode={demoMode || connected} />
      
      <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
        {viewMode === 'dashboard' && (
          <>
            {portfolio ? (
              renderDashboard()
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
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, var(--accent-primary), #006644)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                    }}>
                      <Shield size={36} color="#000" />
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px' }}>
                      Private LP Treasury OS
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px' }}>
                      Connect your wallet or use demo mode to see how Pinky optimizes your LP positions with privacy.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="btn btn-primary" onClick={handleConnectDemo}>
                        <Wallet size={16} />
                        Try Demo Mode
                      </button>
                      <button className="btn btn-secondary" onClick={handleConnectWallet}>
                        <Activity size={16} />
                        Connect Wallet
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {viewMode === 'treasury' && (
          <TreasuryPanel portfolio={portfolio} />
        )}

        {viewMode === 'analytics' && (
          <AnalyticsPanel portfolio={portfolio} />
        )}

        {viewMode === 'settings' && (
          <SettingsPanel />
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