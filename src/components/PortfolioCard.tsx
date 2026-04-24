import { Portfolio } from '@/types';

interface PortfolioCardProps {
  portfolio: Portfolio;
  isLoading: boolean;
}

export default function PortfolioCard({ portfolio, isLoading }: PortfolioCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div className="grid grid-4">
      <div className="stat-card">
        <div className="stat-label">Total Value</div>
        <div className="stat-value">
          {isLoading ? <div className="skeleton" style={{ width: '120px', height: '32px' }} /> : formatCurrency(portfolio.totalValue)}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Total P&L</div>
        <div className="stat-value">
          {isLoading ? <div className="skeleton" style={{ width: '100px', height: '32px' }} /> : formatCurrency(portfolio.totalPnL)}
        </div>
        <div className={`stat-change ${portfolio.totalPnLPercent >= 0 ? 'positive' : 'negative'}`}>
          {isLoading ? <div className="skeleton" style={{ width: '60px', height: '16px' }} /> : formatPercent(portfolio.totalPnLPercent)}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">24h Yield</div>
        <div className="stat-value">
          {isLoading ? <div className="skeleton" style={{ width: '80px', height: '32px' }} /> : formatCurrency(portfolio.yield24h)}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">APY</div>
        <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>
          {isLoading ? <div className="skeleton" style={{ width: '60px', height: '32px' }} /> : `${portfolio.yieldAPY.toFixed(2)}%`}
        </div>
      </div>
    </div>
  );
}