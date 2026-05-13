'use client';

import { usePinkyStore } from '@/lib/store';
import WalletButton from '@/components/ui/WalletButton';
import { LayoutDashboard, Shield, BarChart3, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onDemoMode: boolean;
}

export default function Header({ onDemoMode }: HeaderProps) {
  const { walletAddress, demoMode, viewMode, setViewMode, reset } = usePinkyStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'treasury', label: 'Treasury', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">P</div>
            <div className="logo-text">
              <span className="logo-title">Pinky</span>
              <span className="logo-subtitle">Private LP Treasury OS</span>
            </div>
          </div>

          <nav className="nav-desktop">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-item ${viewMode === item.id ? 'active' : ''}`}
                onClick={() => setViewMode(item.id)}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="header-right">
          {onDemoMode && (
            <div className="demo-badge">
              <span className="demo-indicator">●</span>
              Demo Mode
            </div>
          )}

          <WalletButton />

          {walletAddress && (
            <button 
              className="btn btn-ghost btn-sm"
              onClick={reset}
            >
              Disconnect
            </button>
          )}

          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`mobile-nav-item ${viewMode === item.id ? 'active' : ''}`}
              onClick={() => {
                setViewMode(item.id);
                setMobileMenuOpen(false);
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}