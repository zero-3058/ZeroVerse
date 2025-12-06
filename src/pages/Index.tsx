import React, { useState } from 'react';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Loading } from '@/components/ui/Loading';
import { HomeScreen } from '@/screens/HomeScreen';
import { WalletScreen } from '@/screens/WalletScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';

function AppContent() {
  const { isLoading, error, isTelegramApp } = useUser();
  const [activeTab, setActiveTab] = useState<'home' | 'wallet' | 'profile'>('home');

  if (isLoading) {
    return <Loading />;
  }

  // Show error if not in Telegram (in production)
  // For development, we show the app with mock data
  if (error && isTelegramApp) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold font-display mb-2">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-4 py-4">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'wallet' && <WalletScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

const Index = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default Index;
