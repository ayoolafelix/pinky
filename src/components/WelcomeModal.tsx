'use client';

import { useState } from 'react';
import { Wallet, Zap, Shield, BarChart3 } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDemo: () => void;
}

export default function WelcomeModal({ isOpen, onClose, onDemo }: WelcomeModalProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const features = [
    {
      icon: <Wallet size={32} />,
      title: 'Connect Wallet',
      description: 'Import your existing Solana wallet or use demo mode to explore the platform.',
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'View Portfolio',
      description: 'See all your Meteora LP positions with real-time yield data and P&L tracking.',
    },
    {
      icon: <Zap size={32} />,
      title: 'AI Optimization',
      description: 'Our engine analyzes your positions and recommends optimal rebalancing strategies.',
    },
    {
      icon: <Shield size={32} />,
      title: 'Private Execution',
      description: 'All rebalancing flows through Cloak SDK - your strategies stay hidden.',
    },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '480px',
        width: '90%',
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, var(--accent-primary), #006644)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '28px',
          fontWeight: 700,
          color: '#000',
        }}>
          N
        </div>

        <h2 style={{
          fontSize: '24px',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '8px',
        }}>
          NetFlow
        </h2>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          Private LP Treasury OS for Meteora LPs
        </p>

        {step < features.length ? (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
              color: 'var(--accent-primary)',
            }}>
              {features[step].icon}
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
                {features[step].title}
              </h3>
            </div>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              lineHeight: 1.6,
            }}>
              {features[step].description}
            </p>

            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              marginBottom: '24px',
            }}>
              {features.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: idx === step ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: idx === step ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {step > 0 && (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setStep(step - 1)}
                  style={{ flex: 1 }}
                >
                  Back
                </button>
              )}
              <button 
                className="btn btn-primary" 
                onClick={() => setStep(step + 1)}
                style={{ flex: 1 }}
              >
                {step === features.length - 1 ? 'Get Started' : 'Next'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              marginBottom: '24px',
            }}>
              Choose how you want to continue:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="btn btn-primary" 
                onClick={onDemo}
                style={{ width: '100%', padding: '16px' }}
              >
                <Zap size={18} />
                Try Demo Mode
              </button>
              
              <button 
                className="btn btn-secondary" 
                onClick={onClose}
                style={{ width: '100%', padding: '16px' }}
              >
                <Wallet size={18} />
                Connect Wallet
              </button>
            </div>

            <button 
              onClick={onClose}
              style={{
                display: 'block',
                width: '100%',
                marginTop: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Skip for now
            </button>
          </>
        )}
      </div>
    </div>
  );
}