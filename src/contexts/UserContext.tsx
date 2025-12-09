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

  const [referralProcessed, setReferralProcessed] = useState(() => {
    return localStorage.getItem("referralProcessed") === "1";
  });

  useEffect(() => {
    if (referralProcessed) {
      localStorage.setItem("referralProcessed", "1");
    }
  }, [referralProcessed]);

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
        photo_url: u.photo_url ?? null,
      });
    }
  };

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

      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tg.initData }),
      });

      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Auth failed");
        return;
      }

      const appUser = data.appUser;
      const startParam = data.startParam;

      // -------------------------
      // ⭐ DAILY STREAK LOGIC ⭐
      // -------------------------
      const today = new Date().toISOString().split("T")[0];
      const last = appUser.last_login;

      let current = appUser.current_streak ?? 0;
      let best = appUser.best_streak ?? 0;

      let shouldUpdateStreak = false;

      // First login ever
      if (!last) {
        current = 1;
        best = 1;
        shouldUpdateStreak = true;
      }
      // Already logged in today → no change
      else if (last === today) {
        // nothing
      }
      else {
        const diffDays =
          (new Date(today).getTime() - new Date(last).getTime()) /
          (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          current += 1; // consecutive day
        } else {
          current = 1; // reset streak
        }

        if (current > best) best = current;
        shouldUpdateStreak = true;
      }

      if (shouldUpdateStreak) {
        await supabase
          .from("users")
          .update({
            current_streak: current,
            best_streak: best,
            last_login: today,
          })
          .eq("id", appUser.id);

        appUser.current_streak = current;
        appUser.best_streak = best;
        appUser.last_login = today;
      }

      // Set user after streak update
      setUser(appUser);

      // -------------------------
      // REFERRAL REWARD LOGIC
      // -------------------------
      if (
        startParam &&
        !appUser.referrer_id &&
        !referralProcessed &&
        appUser.tg_id !== startParam
      ) {
        setReferralProcessed(true);

        await fetch("/api/referralReward", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newUserTgId: appUser.tg_id,
            referrerTgId: startParam,
          }),
        });

        const { data: updatedUser } = await supabase
          .from("users")
          .select("*")
          .eq("tg_id", appUser.tg_id)
          .single();

        if (updatedUser) {
          setUser(updatedUser);
        }
      }

      // -------------------------
      // LOAD TRANSACTIONS
      // -------------------------
      const { data: tx } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", appUser.id)
        .order("created_at", { ascending: false });

      setTransactions(tx || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [referralProcessed]);

  const updateUserPoints = useCallback(
    async (extraPoints) => {
      if (!user) return;

      const res = await fetch("/api/updatePoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tg_id: user.tg_id, newPoints: extraPoints }),
      });

      const data = await res.json();
      if (data.ok) {
        setUser(data.user);
      }
    },
    [user]
  );

  const addTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
  };

  const setWalletAddress = (address: string) => {
    setUser((u) => (u ? { ...u, ton_wallet_address: address } : u));
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
