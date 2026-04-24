import { useNetFlowStore } from '@/lib/store';

interface HeaderProps {
  onDemoMode: boolean;
}

export default function Header({ onDemoMode }: HeaderProps) {
  const { walletAddress, reset } = useNetFlowStore();

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '72px',
      background: 'rgba(10, 10, 15, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-color)',
      zIndex: 100,
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-primary), #006644)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 700,
            color: '#000',
          }}>
            N
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700 }}>NetFlow</h1>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Private LP Treasury OS</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onDemoMode && (
            <span className="badge badge-success">
              <span style={{ marginRight: '6px' }}>●</span>
              Demo Mode
            </span>
          )}
          
          {walletAddress && (
            <button 
              className="btn btn-ghost"
              onClick={reset}
              style={{ fontSize: '13px', color: 'var(--text-secondary)' }}
            >
              Disconnect
            </button>
          )}

          <div style={{
            padding: '8px 16px',
            background: 'var(--bg-tertiary)',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'monospace',
            color: 'var(--text-secondary)',
          }}>
            {walletAddress 
              ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
              : 'Not connected'}
          </div>
        </div>
      </div>
    </header>
  );
}