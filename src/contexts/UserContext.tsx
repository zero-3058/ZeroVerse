import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Transaction } from '@/types/user';

interface UserContextType {
  user: User | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  telegramUser: {
    id: number;
    name: string;
    username?: string;
  } | null;
  isTelegramApp: boolean;
  refreshUser: () => Promise<void>;
  updateUserPoints: (newPoints: number) => void;
  addTransaction: (transaction: Transaction) => void;
  setWalletAddress: (address: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user for development outside Telegram
const MOCK_USER: User = {
  id: 'mock-uuid',
  tg_id: '123456789',
  tg_name: 'Demo User',
  tg_username: 'demouser',
  zero_points: 15420,
  ton_wallet_address: undefined,
  referrer_id: undefined,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    user_id: 'mock-uuid',
    type: 'game',
    description: 'Snake Game Reward',
    amount: 500,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    user_id: 'mock-uuid',
    type: 'task',
    description: 'Joined Telegram Channel',
    amount: 150,
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '3',
    user_id: 'mock-uuid',
    type: 'referral',
    description: 'Friend joined via your link',
    amount: 200,
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [telegramUser, setTelegramUser] = useState<{ id: number; name: string; username?: string } | null>(null);
  const [isTelegramApp, setIsTelegramApp] = useState(false);

  const initializeTelegram = useCallback(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      tg.expand();
      setIsTelegramApp(true);
      
      const user = tg.initDataUnsafe.user;
      if (user) {
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
        setTelegramUser({
          id: user.id,
          name: fullName,
          username: user.username
        });
        return {
          tg_id: String(user.id),
          tg_name: fullName,
          tg_username: user.username,
          start_param: tg.initDataUnsafe.start_param
        };
      }
    }
    return null;
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const tgData = initializeTelegram();
      
      if (tgData) {
        // In production, call your Next.js API here
        // const response = await fetch('/api/login', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(tgData)
        // });
        // const data = await response.json();
        // setUser(data.user);
        // setTransactions(data.transactions || []);
        
        // For now, use mock data with Telegram name
        setUser({
          ...MOCK_USER,
          tg_id: tgData.tg_id,
          tg_name: tgData.tg_name,
          tg_username: tgData.tg_username
        });
        setTransactions(MOCK_TRANSACTIONS);
      } else {
        // Development mode - use mock data
        setUser(MOCK_USER);
        setTransactions(MOCK_TRANSACTIONS);
        setTelegramUser({
          id: 123456789,
          name: 'Demo User',
          username: 'demouser'
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  }, [initializeTelegram]);

  const updateUserPoints = useCallback((newPoints: number) => {
    setUser(prev => prev ? { ...prev, zero_points: newPoints } : null);
  }, []);

  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  }, []);

  const setWalletAddress = useCallback((address: string) => {
    setUser(prev => prev ? { ...prev, ton_wallet_address: address } : null);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{
      user,
      transactions,
      isLoading,
      error,
      telegramUser,
      isTelegramApp,
      refreshUser,
      updateUserPoints,
      addTransaction,
      setWalletAddress
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
