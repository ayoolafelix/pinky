import { LPPosition } from '@/types';

interface PositionsTableProps {
  positions: LPPosition[];
}

export default function PositionsTable({ positions }: PositionsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getPnLClass = (pnl: number) => {
    if (pnl > 0) return 'positive';
    if (pnl < 0) return 'negative';
    return '';
  };

  const getAPRClass = (apr: number) => {
    if (apr >= 10) return 'high';
    if (apr >= 5) return 'medium';
    return 'low';
  };

  return (
    <div style={{ 
      background: 'var(--bg-card)', 
      border: '1px solid var(--border-color)', 
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}>
          <thead>
            <tr style={{ 
              background: 'var(--bg-tertiary)',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 500 }}>Pool</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 500 }}>Value</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 500 }}>APR</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 500 }}>P&L</th>
              <th style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 500 }}>24h Fees</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position, index) => (
              <tr 
                key={position.poolAddress}
                style={{ 
                  borderBottom: index < positions.length - 1 ? '1px solid var(--border-color)' : 'none',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 600 }}>{position.poolName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {position.tokenX}/{position.tokenY}
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'monospace' }}>
                  {formatCurrency(position.amountX + position.amountY)}
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <span className={`badge badge-${getAPRClass(position.apr)}`}>
                    {position.apr.toFixed(1)}%
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <span className={getPnLClass(position.pnl)} style={{ fontFamily: 'monospace' }}>
                    {formatCurrency(position.pnl)}
                  </span>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {formatPercent(position.pnlPercent)}
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                  +{position.feesEarned.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}