// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Transaction } from "@/types/user";
import { supabase } from "@/supabase";

interface UserContextType {
  user: User | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  telegramUser: any;
  isTelegramApp: boolean;
  refreshUser: () => Promise<void>;
  updateUserPoints: (extraPoints: number) => Promise<void>;
  addTransaction: (tx: Transaction) => void;
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

  const [referralProcessed, setReferralProcessed] = useState(false); 
  // ⚠️ Prevents double referral calls

  /** INIT TELEGRAM */
  const initializeTelegram = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    tg.expand();
    setIsTelegramApp(true);

    const u = tg.initDataUnsafe?.user;
    if (u) {
      setTelegramUser({
        id: u.id,
        name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
        username: u.username ?? null,
        photo_url: u.photo_url ?? null
      });
    }
  };

  /** MAIN USER LOADER */
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

      /** Authenticate user */
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData })
      });

      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Auth failed");
        return;
      }

      const appUser = data.appUser;
      const startParam = data.startParam; // The referrer TG ID
      setUser(appUser);

      console.log("Loaded user:", appUser);

      /** --------------------------------------------
       * OPTION 3 REFERRAL LOGIC (FRONTEND SIDE)
       * - Only call referralReward once
       * - Only for NEW users with no referrer set
       * -------------------------------------------- */
      if (
        startParam &&                 // Link contains a referral ID
        !appUser.referrer_id &&       // Not rewarded previously
        !referralProcessed &&         // Avoid calling twice
        appUser.tg_id !== startParam  // Avoid self-refer
      ) {
        console.log("🔗 Calling referralReward:", { 
          newUser: appUser.tg_id, 
          referrer: startParam 
        });

        setReferralProcessed(true);

        await fetch("/api/referralReward", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newUserTgId: appUser.tg_id,
            referrerTgId: startParam
          })
        });

        // Reload updated user data (points + referrer_id)
        const { data: updatedUser } = await supabase
          .from("users")
          .select("*")
          .eq("tg_id", appUser.tg_id)
          .single();

        if (updatedUser) {
          console.log("Updated user after referral:", updatedUser);
          setUser(updatedUser);
        }
      }

      /** Load transactions */
      const { data: tx } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", appUser.id)
        .order("created_at", { ascending: false });

      setTransactions(tx || []);

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [referralProcessed]);

  /** SAFE POINT UPDATE */
  const updateUserPoints = useCallback(async (extraPoints: number) => {
    if (!user) return;

    const res = await fetch("/api/updatePoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tg_id: user.tg_id, newPoints: extraPoints })
    });

    const data = await res.json();
    if (data.ok) {
      setUser(data.user);
    }
  }, [user]);

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
  };

  const setWalletAddress = (address: string) => {
    setUser(u => u ? { ...u, ton_wallet_address: address } : u);
  };

  useEffect(() => {
    refreshUser();
  }, []);

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
        setWalletAddress
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
