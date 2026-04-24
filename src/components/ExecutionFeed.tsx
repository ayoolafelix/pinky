'use client';

import { usePinkyStore } from '@/lib/store';

export default function ExecutionFeed() {
  const { executionPlan, executionHistory } = usePinkyStore();

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} style={{ color: 'var(--success)' }} />;
      case 'failed':
        return <XCircle size={14} style={{ color: 'var(--error)' }} />;
      case 'processing':
        return <Loader size={14} style={{ color: 'var(--warning)' }} className="animate-spin" />;
      default:
        return <Activity size={14} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  const getStepLabel = (type: string) => {
    switch (type) {
      case 'zap_in':
        return 'Zap In →';
      case 'zap_out':
        return 'Zap Out ←';
      case 'cloak_shield':
        return 'Shield';
      case 'cloak_send':
        return 'Private Send';
      case 'cloak_swap':
        return 'Private Swap';
      default:
        return type;
    }
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '20px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
      }}>
        <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Execution Feed</h3>
      </div>

      {(!executionPlan || executionPlan.steps.length === 0) && executionHistory.length === 0 ? (
        <p style={{ 
          fontSize: '13px', 
          color: 'var(--text-muted)', 
          textAlign: 'center',
          padding: '24px',
        }}>
          No executions yet. Optimize your portfolio to see activity.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {executionPlan?.steps
            .filter(step => step.status !== 'pending')
            .map(step => (
              <div 
                key={step.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
              >
                {getStatusIcon(step.status)}
                <span style={{ flex: 1, color: 'var(--text-secondary)' }}>
                  {getStepLabel(step.type)}
                </span>
                {step.poolAddress && (
                  <span style={{ 
                    fontFamily: 'monospace', 
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                  }}>
                    {step.poolAddress.slice(0, 6)}...{step.poolAddress.slice(-4)}
                  </span>
                )}
              </div>
            ))}

          {executionHistory.slice(0, 5).map(history => (
            <div 
              key={history.id}
              style={{
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '4px',
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Optimization #{history.id.slice(-6)}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                  {formatTime(history.timestamp)}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '12px',
              }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {history.valueBefore.toFixed(0)} → {history.valueAfter.toFixed(0)}
                </span>
                <span style={{ color: 'var(--accent-primary)' }}>
                  +{(history.yieldAfter - history.yieldBefore).toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}