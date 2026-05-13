'use client';

import { useState } from 'react';
import { Portfolio, TreasuryInfo } from '@/types';
import { cloakService } from '@/services/cloak';
import { usePinkyStore } from '@/lib/store';
import { 
  Shield, 
  Send, 
  RefreshCw, 
  Download, 
  Eye, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Unlock,
  FileText,
  Check,
  Loader,
  X,
} from 'lucide-react';

interface TreasuryPanelProps {
  portfolio: Portfolio | null;
}

export default function TreasuryPanel({ portfolio }: TreasuryPanelProps) {
  const { walletAddress, demoMode, addExecutionHistory } = usePinkyStore();
  const [shieldAmount, setShieldAmount] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [activeTab, setActiveTab] = useState<'shield' | 'send' | 'swap' | 'viewing-keys' | 'audit'>('shield');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<{
    type: string;
    status: 'success' | 'failed';
    message: string;
  } | null>(null);

  const treasury = portfolio?.treasury || {
    totalBalance: portfolio?.totalValue || 0,
    shieldedBalance: (portfolio?.totalValue || 0) * 0.3,
    publicBalance: (portfolio?.totalValue || 0) * 0.7,
    pendingOperations: 0,
    lastUpdated: Date.now(),
  };

  const handleShield = async () => {
    if (!shieldAmount || Number(shieldAmount) <= 0) return;
    
    setIsProcessing(true);
    setLastTransaction(null);
    
    try {
      const result = await cloakService.shield({
        amount: Number(shieldAmount),
        sender: walletAddress || 'demo',
      });
      
      setLastTransaction({
        type: 'Shield',
        status: 'success',
        message: `Shielded ${shieldAmount} SOL privately`,
      });
      
      if (!demoMode) {
        addExecutionHistory({
          id: result.requestId,
          timestamp: Date.now(),
          type: 'cloak',
          valueBefore: treasury.totalBalance,
          valueAfter: treasury.totalBalance,
          yieldBefore: 0,
          yieldAfter: 0,
          steps: [{
            id: result.requestId,
            type: 'cloak_shield',
            status: 'completed',
            amount: Number(shieldAmount),
            txHash: result.txHash,
          }],
          txHashes: [result.txHash || ''],
        });
      }
    } catch (error) {
      setLastTransaction({
        type: 'Shield',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Shield failed',
      });
    } finally {
      setIsProcessing(false);
      setShieldAmount('');
    }
  };

  const handleSend = async () => {
    if (!sendAmount || !recipient || Number(sendAmount) <= 0) return;
    
    setIsProcessing(true);
    setLastTransaction(null);
    
    try {
      const result = await cloakService.send({
        amount: Number(sendAmount),
        recipient,
        sender: walletAddress || 'demo',
        memo: 'Pinky private transfer',
      });
      
      setLastTransaction({
        type: 'Private Send',
        status: 'success',
        message: `Sent ${sendAmount} SOL privately to ${recipient.slice(0, 8)}...`,
      });
      
      if (!demoMode) {
        addExecutionHistory({
          id: result.requestId,
          timestamp: Date.now(),
          type: 'cloak',
          valueBefore: treasury.totalBalance,
          valueAfter: treasury.totalBalance,
          yieldBefore: 0,
          yieldAfter: 0,
          steps: [{
            id: result.requestId,
            type: 'cloak_send',
            status: 'completed',
            amount: Number(sendAmount),
            txHash: result.txHash,
          }],
          txHashes: [result.txHash || ''],
        });
      }
    } catch (error) {
      setLastTransaction({
        type: 'Private Send',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Send failed',
      });
    } finally {
      setIsProcessing(false);
      setSendAmount('');
      setRecipient('');
    }
  };

  const handleSwap = async () => {
    setIsProcessing(true);
    
    try {
      const result = await cloakService.swap({
        amount: 1,
        outputMint: 'So11111111111111111111111111111111111111112',
        sender: walletAddress || 'demo',
      });
      
      setLastTransaction({
        type: 'Private Swap',
        status: 'success',
        message: 'Swapped 1 SOL privately',
      });
    } catch (error) {
      setLastTransaction({
        type: 'Private Swap',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Swap failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const tabs = [
    { id: 'shield', label: 'Shield', icon: Shield },
    { id: 'send', label: 'Send', icon: Send },
    { id: 'swap', label: 'Swap', icon: RefreshCw },
    { id: 'viewing-keys', label: 'Viewing Keys', icon: Eye },
    { id: 'audit', label: 'Audit', icon: FileText },
  ] as const;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          Treasury
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your private treasury with shielded operations
        </p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-label">Total Balance</div>
          <div className="stat-value">{formatCurrency(treasury.totalBalance)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Last updated: {new Date(treasury.lastUpdated).toLocaleTimeString()}
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} style={{ color: 'var(--accent-primary)' }} />
            <div className="stat-label">Shielded</div>
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-primary)' }}>
            {formatCurrency(treasury.shieldedBalance)}
          </div>
          <div className="stat-change positive">
            {((treasury.shieldedBalance / treasury.totalBalance) * 100).toFixed(1)}% of total
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Unlock size={16} style={{ color: 'var(--text-secondary)' }} />
            <div className="stat-label">Public</div>
          </div>
          <div className="stat-value">
            {formatCurrency(treasury.publicBalance)}
          </div>
          <div className="stat-change">
            {((treasury.publicBalance / treasury.totalBalance) * 100).toFixed(1)}% of total
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Loader size={16} style={{ color: 'var(--warning)' }} />
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {treasury.pendingOperations}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Operations
          </div>
        </div>
      </div>

      <div style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--border-color)',
          overflow: 'auto',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 24px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px' }}>
          {activeTab === 'shield' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                Shield Funds
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
                Move funds into the shielded pool for private operations. Shielded funds are invisible on-chain.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="number"
                  className="input"
                  placeholder="Amount (SOL)"
                  value={shieldAmount}
                  onChange={(e) => setShieldAmount(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button 
                  className="btn btn-primary"
                  onClick={handleShield}
                  disabled={isProcessing || !shieldAmount}
                >
                  {isProcessing ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Shielding...
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
                      Shield
                    </>
                  )}
                </button>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                marginTop: '16px',
                fontSize: '12px',
                color: 'var(--text-muted)',
              }}>
                <Lock size={12} />
                <span>Funds will be converted to private UTXOs</span>
              </div>
            </div>
          )}

          {activeTab === 'send' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                Private Send
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
                Send funds privately to any Solana address. Recipient won't be able to trace the sender.
              </p>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                  Recipient Address
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Solana address (e.g., 7n8...)"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="number"
                  className="input"
                  placeholder="Amount (SOL)"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button 
                  className="btn btn-primary"
                  onClick={handleSend}
                  disabled={isProcessing || !sendAmount || !recipient}
                >
                  {isProcessing ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Privately
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'swap' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                Private Swap
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
                Swap tokens privately without revealing your positions or trading strategy.
              </p>
              
              <div style={{ 
                padding: '20px', 
                background: 'var(--bg-tertiary)', 
                borderRadius: '8px',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>From</span>
                  <span style={{ fontWeight: 600 }}>SOL</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 600 }}>
                  1.00
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '16px',
              }}>
                <ArrowDownRight size={20} style={{ color: 'var(--text-muted)' }} />
              </div>
              
              <div style={{ 
                padding: '20px', 
                background: 'var(--bg-tertiary)', 
                borderRadius: '8px',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>To</span>
                  <span style={{ fontWeight: 600 }}>USDC</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                  ~158.42
                </div>
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={handleSwap}
                disabled={isProcessing}
                style={{ width: '100%' }}
              >
                {isProcessing ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Swapping...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Execute Private Swap
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'viewing-keys' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                Viewing Keys
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
                Create scoped viewing keys to allow auditors or compliance officers to verify your transactions without revealing your full balance.
              </p>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
                marginBottom: '12px',
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Compliance Auditor</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    View transactions only • Expires in 30 days
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm">
                  <Eye size={14} />
                  View
                </button>
              </div>
              
              <button className="btn btn-secondary" style={{ width: '100%' }}>
                <Plus size={16} />
                Create New Viewing Key
              </button>
            </div>
          )}

          {activeTab === 'audit' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                Audit Export
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
                Generate compliance reports and audit exports for regulatory requirements.
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '12px',
                marginBottom: '20px',
              }}>
                <button className="btn btn-secondary">
                  <FileText size={16} />
                  PDF Report
                </button>
                <button className="btn btn-secondary">
                  <Download size={16} />
                  CSV Export
                </button>
                <button className="btn btn-secondary">
                  <FileText size={16} />
                  JSON Export
                </button>
              </div>
              
              <div style={{ 
                padding: '16px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Last Audit</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Total volume: {formatCurrency(treasury.totalBalance)} • 
                  Shield: {formatCurrency(treasury.shieldedBalance)} • 
                  Transfers: {treasury.pendingOperations}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {lastTransaction && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: lastTransaction.status === 'success' 
            ? 'rgba(0, 212, 170, 0.1)' 
            : 'rgba(255, 68, 102, 0.1)',
          border: `1px solid ${lastTransaction.status === 'success' ? 'var(--success)' : 'var(--error)'}`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          {lastTransaction.status === 'success' ? (
            <Check size={20} style={{ color: 'var(--success)' }} />
          ) : (
            <X size={20} style={{ color: 'var(--error)' }} />
          )}
          <div>
            <div style={{ fontWeight: 600 }}>{lastTransaction.type}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {lastTransaction.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}