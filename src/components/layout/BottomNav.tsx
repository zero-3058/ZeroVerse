import React from 'react';
import { Home, User } from 'lucide-react';
import { WalletIcon } from '@/components/icons/GameIcons';

interface BottomNavProps {
  activeTab: 'home' | 'wallet' | 'profile';
  onTabChange: (tab: 'home' | 'wallet' | 'profile') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'wallet' as const, label: 'Wallet', icon: () => <WalletIcon className="w-5 h-5" /> },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/30">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`tab-item ${isActive ? 'active' : 'text-muted-foreground'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
