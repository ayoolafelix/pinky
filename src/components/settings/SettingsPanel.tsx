'use client';

import { useState } from 'react';
import { usePinkyStore } from '@/lib/store';
import { 
  Settings as SettingsIcon,
  Bell,
  Shield,
  Key,
  Globe,
  Moon,
  Sun,
  Database,
  RefreshCw,
  ExternalLink,
  Check,
  Copy,
  AlertTriangle,
} from 'lucide-react';

export default function SettingsPanel() {
  const { walletAddress, demoMode, reset } = usePinkyStore();
  const [activeTab, setActiveTab] = useState<'general' | 'privacy' | 'api' | 'about'>('general');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'about', label: 'About', icon: Globe },
  ] as const;

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your preferences and configurations
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '24px',
      }}>
        <div style={{ 
          width: '220px',
          flexShrink: 0,
        }}>
          <nav style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '4px',
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                style={{ 
                  justifyContent: 'flex-start',
                  width: '100%',
                }}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div style={{ 
          flex: 1,
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '12px',
          padding: '24px',
        }}>
          {activeTab === 'general' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
                General Settings
              </h3>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Theme
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-primary" style={{ flex: 1 }}>
                    <Sun size={16} />
                    Light
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1 }}>
                    <Moon size={16} />
                    Dark
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Notifications
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    cursor: 'pointer',
                  }}>
                    <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                    <span>Yield alerts</span>
                  </label>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    cursor: 'pointer',
                  }}>
                    <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                    <span>Position changes</span>
                  </label>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    cursor: 'pointer',
                  }}>
                    <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                    <span>Execution updates</span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  RPC Endpoint
                </label>
                <select className="input" defaultValue="mainnet">
                  <option value="mainnet">Solana Mainnet</option>
                  <option value="devnet">Devnet</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <button className="btn btn-secondary" style={{ width: '100%' }}>
                <RefreshCw size={16} />
                Reset to Defaults
              </button>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
                Privacy Settings
              </h3>

              <div style={{ 
                padding: '16px',
                background: 'rgba(255, 170, 0, 0.1)',
                border: '1px solid var(--warning)',
                borderRadius: '8px',
                marginBottom: '24px',
                display: 'flex',
                gap: '12px',
              }}>
                <AlertTriangle size={20} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                    Privacy Notice
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    All Cloak operations are processed privately. Your transaction history and wallet activity are never exposed on-chain.
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Default Privacy Level
                </label>
                <select className="input">
                  <option value="maximum">Maximum Privacy</option>
                  <option value="standard">Standard Privacy</option>
                  <option value="minimum">Minimum Privacy</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Transaction Privacy
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    cursor: 'pointer',
                  }}>
                    <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                    <span>Auto-shield all LP operations</span>
                  </label>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    cursor: 'pointer',
                  }}>
                    <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
                    <span>Hide portfolio from public view</span>
                  </label>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    cursor: 'pointer',
                  }}>
                    <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                    <span>Allow audit access</span>
                  </label>
                </div>
              </div>

              <button className="btn btn-secondary" style={{ width: '100%' }}>
                <Database size={16} />
                Clear Local Data
              </button>
            </div>
          )}

          {activeTab === 'api' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
                API Configuration
              </h3>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  LP Agent API Key
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="password" 
                    className="input" 
                    value="lpagent_bb8e0d2344cd765ba1ec596aff6988f6"
                    readOnly
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-secondary">
                    <Key size={16} />
                    Update
                  </button>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: 'var(--text-muted)', 
                  marginTop: '6px' 
                }}>
                  Used for portfolio tracking and optimization
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Cloak SDK Configuration
                </label>
                <div style={{ 
                  padding: '16px', 
                  background: 'var(--bg-tertiary)', 
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>RELAY_URL:</span> api.cloak.ag
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>PROGRAM_ID:</span> zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Wallet Connection
                </label>
                <div style={{ 
                  padding: '16px', 
                  background: 'var(--bg-tertiary)', 
                  borderRadius: '8px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                      Connected
                    </span>
                  </div>
                  {walletAddress && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontSize: '12px',
                        color: 'var(--text-muted)' 
                      }}>
                        {walletAddress}
                      </span>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={handleCopyAddress}
                        style={{ padding: '4px 8px' }}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                  {demoMode && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--warning)',
                      marginTop: '8px',
                    }}>
                      Demo mode active - no real transactions
                    </div>
                  )}
                </div>
              </div>

              <button className="btn btn-ghost" style={{ width: '100%', color: 'var(--error)' }}>
                Disconnect Wallet
              </button>
            </div>
          )}

          {activeTab === 'about' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
                About Pinky
              </h3>

              <div style={{ 
                textAlign: 'center',
                padding: '32px 0',
                marginBottom: '24px',
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, var(--accent-primary), #006644)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#000',
                }}>
                  P
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
                  Pinky
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Private LP Treasury OS for Meteora
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Version 1.0.0
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '12px',
                }}>
                  <div style={{ 
                    padding: '16px', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      LP Agent
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      v1.0.0
                    </div>
                  </div>
                  <div style={{ 
                    padding: '16px', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      Cloak SDK
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      v0.1.0
                    </div>
                  </div>
                  <div style={{ 
                    padding: '16px', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      Meteora
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      DLMM SDK
                    </div>
                  </div>
                  <div style={{ 
                    padding: '16px', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      Solana
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Web3.js
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px',
              }}>
                <a 
                  href="https://github.com/ayoolafelix/pinky" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  <ExternalLink size={16} />
                  GitHub
                </a>
                <a 
                  href="https://meteora.ag" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  <ExternalLink size={16} />
                  Meteora
                </a>
                <a 
                  href="https://cloak.ag" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  <ExternalLink size={16} />
                  Cloak
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}