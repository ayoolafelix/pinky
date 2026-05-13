'use client';

import { useState, useMemo } from 'react';
import { Portfolio } from '@/types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface AnalyticsPanelProps {
  portfolio: Portfolio | null;
}

const generateMockData = (days: number, baseValue: number, volatility: number) => {
  const data = [];
  let currentValue = baseValue;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const change = (Math.random() - 0.5) * volatility;
    currentValue = currentValue * (1 + change / 100);
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(currentValue * 100) / 100,
      fees: Math.round((Math.random() * 50 + 10) * 100) / 100,
      il: Math.round((Math.random() * 2 - 0.5) * 100) / 100,
    });
  }
  
  return data;
};

export default function AnalyticsPanel({ portfolio }: AnalyticsPanelProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  const days = useMemo(() => {
    switch (timeRange) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  }, [timeRange]);

  const portfolioValue = portfolio?.totalValue || 10000;
  
  const aprData = useMemo(() => generateMockData(days, 8, 2), [days]);
  const feesData = useMemo(() => generateMockData(days, 100, 30), [days]);
  const ilData = useMemo(() => generateMockData(days, 0.5, 0.8), [days]);
  const valueData = useMemo(() => generateMockData(days, portfolioValue, 3), [days, portfolioValue]);

  const totalFeesGenerated = feesData.reduce((sum, d) => sum + d.fees, 0);
  const avgIL = ilData.reduce((sum, d) => sum + d.il, 0) / ilData.length;
  const totalReturn = valueData.length > 0 
    ? ((valueData[valueData.length - 1].value - valueData[0].value) / valueData[0].value) * 100 
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const poolAllocation = portfolio?.positions.map(p => ({
    name: p.poolName,
    value: p.amountX + p.amountY,
    percent: ((p.amountX + p.amountY) / (portfolio?.totalValue || 1)) * 100,
    apr: p.apr,
  })) || [];

  const renderTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '12px',
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ 
              margin: '4px 0 0', 
              fontSize: '14px',
              fontWeight: 600,
              color: entry.color 
            }}>
              {entry.name}: {entry.name.includes('%') ? `${entry.value.toFixed(2)}%` : formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
            Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track your LP performance and yield metrics
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['7d', '30d', '90d', '1y'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`btn ${timeRange === range ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={16} style={{ color: 'var(--accent-primary)' }} />
            <div className="stat-label">Total Return</div>
          </div>
          <div className="stat-value" style={{ color: totalReturn >= 0 ? 'var(--success)' : 'var(--error)' }}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Over {timeRange}
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} style={{ color: 'var(--accent-primary)' }} />
            <div className="stat-label">Fees Generated</div>
          </div>
          <div className="stat-value">
            {formatCurrency(totalFeesGenerated)}
          </div>
          <div className="stat-change positive">
            +{(totalFeesGenerated / (portfolio?.totalValue || 1) * 100).toFixed(2)}% of TVL
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingDown size={16} style={{ color: 'var(--error)' }} />
            <div className="stat-label">Impermanent Loss</div>
          </div>
          <div className="stat-value" style={{ color: avgIL >= 0 ? 'var(--error)' : 'var(--success)' }}>
            {avgIL >= 0 ? '-' : '+'}{Math.abs(avgIL).toFixed(3)}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Average
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={16} style={{ color: 'var(--accent-primary)' }} />
            <div className="stat-label">Positions</div>
          </div>
          <div className="stat-value">
            {portfolio?.positions?.length || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Active pools
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '24px' }}>
        <div style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '12px',
          padding: '20px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            Portfolio Value
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={valueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={renderTooltip} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  name="Value"
                  stroke="var(--accent-primary)" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '12px',
          padding: '20px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            Fee Generation
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={renderTooltip} />
                <Bar dataKey="fees" name="Fees" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '12px',
          padding: '20px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            APR Trend
          </h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aprData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={renderTooltip} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name="APR"
                  stroke="var(--accent-primary)" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '12px',
          padding: '20px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            Pool Allocation
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {poolAllocation.length > 0 ? (
              poolAllocation.map((pool, index) => (
                <div key={index}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '6px',
                    fontSize: '13px',
                  }}>
                    <span style={{ fontWeight: 500 }}>{pool.name}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {formatCurrency(pool.value)} ({pool.percent.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ 
                    height: '6px', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${pool.percent}%`,
                      background: 'var(--accent-primary)',
                      borderRadius: '3px',
                    }} />
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: 'var(--success)',
                    marginTop: '4px',
                  }}>
                    {pool.apr.toFixed(1)}% APR
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: 'var(--text-muted)',
              }}>
                No positions to display
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ 
        marginTop: '24px',
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '12px',
        padding: '20px',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          Yield Forecast
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px',
        }}>
          <div style={{ 
            padding: '16px', 
            background: 'var(--bg-tertiary)', 
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              7 Day Expected
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-primary)' }}>
              +{(totalFeesGenerated * 0.23).toFixed(2)}%
            </div>
          </div>
          <div style={{ 
            padding: '16px', 
            background: 'var(--bg-tertiary)', 
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              30 Day Expected
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-primary)' }}>
              +{(totalFeesGenerated).toFixed(2)}%
            </div>
          </div>
          <div style={{ 
            padding: '16px', 
            background: 'var(--bg-tertiary)', 
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              90 Day Projected
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-primary)' }}>
              +{(totalFeesGenerated * 3.1).toFixed(2)}%
            </div>
          </div>
          <div style={{ 
            padding: '16px', 
            background: 'var(--bg-tertiary)', 
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              APY
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>
              {portfolio?.yieldAPY?.toFixed(1) || '0'}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}