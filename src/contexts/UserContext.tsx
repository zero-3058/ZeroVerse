// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Transaction } from "@/types/user";
import WebApp from "@twa-dev/sdk";
import { supabase } from "@/supabase";

interface UserContextType {
  user: User | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  telegramUser: { id: number; name: string; username?: string; photo_url?: string | null } | null;
  isTelegramApp: boolean;
  refreshUser: () => Promise<void>;
  updateUserPoints: (newPoints: number) => Promise<void>;
  addTransaction: (transaction: Transaction) => void;
  setWalletAddress: (address: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [isTelegramApp, setIsTelegramApp] = useState(false);

  /** ---------------------------------------------
   * Initialize Telegram WebApp + load basic info
   * --------------------------------------------- */
  const initializeTelegram = useCallback(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    tg.expand();
    setIsTelegramApp(true);

    const u = tg.initDataUnsafe?.user;
    if (u) {
      const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ");
      setTelegramUser({
        id: u.id,
        name: fullName,
        username: u.username,
        photo_url: u.photo_url ?? null, // ⭐ ADDED PHOTO URL
      });
    }
  }, []);

  /** ---------------------------------------------
   * Authenticate user via backend + load profile
   * --------------------------------------------- */
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      initializeTelegram();

      const tg = (window as any).Telegram?.WebApp;
      if (!tg || !tg.initData) {
        setError("Open inside Telegram Mini App.");
        return;
      }

      // Authenticate with backend
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData }),
      });

      const data = await response.json();
      if (!data.ok) {
        setError(data.error || "Auth failed");
        return;
      }

      // ⭐ Backend now includes photo_url — keep it
      setUser(data.appUser);

      // Load user's transactions
      const { data: tx } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", data.appUser.id)
        .order("created_at", { ascending: false });

      setTransactions(tx || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [initializeTelegram]);

  /** ---------------------------------------------
   * Update user points (persistent)
   * --------------------------------------------- */
  const updateUserPoints = useCallback(
    async (newPoints: number) => {
      if (!user) return;

      const response = await fetch("/api/updatePoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tg_id: user.tg_id, newPoints }),
      });

      const data = await response.json();
      if (data.ok) {
        setUser(data.user); // Update local state with saved version
      }
    },
    [user]
  );

  /** Add new transaction locally */
  const addTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
  };

  /** Update wallet address locally */
  const setWalletAddress = (address: string) => {
    setUser((u) => (u ? { ...u, ton_wallet_address: address } : u));
  };

  /** Load user on app start */
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        transactions,
        isLoading,
        error,
        telegramUser,
        isTelegramApp,
        refreshUser,
        updateUserPoints,
        addTransaction,
        setWalletAddress,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
