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

  // Persist referral flag across reloads
  const [referralProcessed, setReferralProcessed] = useState<boolean>(() => {
    return localStorage.getItem("referralProcessed") === "1";
  });

  // Save referral state to localStorage
  useEffect(() => {
    if (referralProcessed) {
      localStorage.setItem("referralProcessed", "1");
    }
  }, [referralProcessed]);

  /** Initialize Telegram WebApp */
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

  /** MAIN USER LOADING FUNCTION */
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

      // TEMP REFERRAL TEST MODE — capture ref from URL
      const urlParams = new URLSearchParams(window.location.search);
      const forcedRef = urlParams.get("ref") || null;

      // Authenticate user
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
      const startParam = data.startParam; // Referral TG ID

      setUser(appUser);
      console.log("Loaded user:", appUser);

      /**
       * --------------------------------------------------------
       * REFERRAL LOGIC (WITH TEMPORARY FORCE MODE)
       * Will use:
       * - startParam (from Telegram)
       * - forcedRef   (from URL ?ref=12345)
       * --------------------------------------------------------
       */

      const finalRef = startParam || forcedRef;

      if (
        finalRef &&                    // A valid referral ID exists
        !appUser.referrer_id &&        // User wasn't referred before
        !referralProcessed &&          // Prevent double-referral
        appUser.tg_id !== finalRef     // Prevent self-referral
      ) {
        console.log("🔥 Referral triggered:", {
          newUser: appUser.tg_id,
          referrer: finalRef,
        });

        // Prevent running twice
        setReferralProcessed(true);

        // Call backend referral API
        await fetch("/api/referralReward", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            newUserTgId: appUser.tg_id,
            referrerTgId: finalRef,
          }),
        });

        // Reload updated user (with points + referrer_id)
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
  const updateUserPoints = useCallback(
    async (extraPoints: number) => {
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
