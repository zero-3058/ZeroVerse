// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Transaction } from '@/types/user';
import WebApp from "@twa-dev/sdk";
import { supabase } from "@/supabase";

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

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [telegramUser, setTelegramUser] = useState<{ id: number; name: string; username?: string } | null>(null);
  const [isTelegramApp, setIsTelegramApp] = useState(false);

  /** ------------------------------------------
   * INIT TELEGRAM WEBAPP + BASIC USER INFO
   * ------------------------------------------*/
  const initializeTelegram = useCallback(() => {
    const tg = WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
      setIsTelegramApp(true);

      const tUser = tg.initDataUnsafe?.user;
      if (tUser) {
        const fullName = [tUser.first_name, tUser.last_name].filter(Boolean).join(" ");

        setTelegramUser({
          id: tUser.id,
          name: fullName,
          username: tUser.username,
        });
      }
    }
  }, []);

  /** ------------------------------------------
   *  FETCH USER FROM BACKEND (service-role)
   * ------------------------------------------*/
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      initializeTelegram();

      const tg = WebApp;

      if (!tg || !tg.initData) {
        setError("Please open inside Telegram Mini App.");
        return;
      }

      // 1) Authenticate + sync user using backend
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData }),
      });

      const data = await response.json();

      if (!data.ok || !data.appUser) {
        setError(data.error || "Failed to load user");
        return;
      }

      const appUser = data.appUser;
      setUser(appUser);

      // 2) Load this user's transactions (reads allowed with anon)
      const { data: tx, error: txErr } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", appUser.id)
        .order("created_at", { ascending: false });

      if (txErr) throw txErr;

      setTransactions(tx || []);

    } catch (err: any) {
      setError(err.message || "Failed to load user");
    } finally {
      setIsLoading(false);
    }
  }, [initializeTelegram]);

  /** Update points locally */
  const updateUserPoints = useCallback((newPoints: number) => {
    setUser(prev => prev ? { ...prev, zero_points: newPoints } : null);
  }, []);

  /** Add transaction locally */
  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  }, []);

  /** Update TON wallet locally */
  const setWalletAddress = useCallback((address: string) => {
    setUser(prev => prev ? { ...prev, ton_wallet_address: address } : null);
  }, []);

  /** Auto-run on app load */
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
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
