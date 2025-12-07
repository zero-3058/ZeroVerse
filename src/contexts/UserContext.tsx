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

  /** ---------------------------------------------------
   *   READ REAL TELEGRAM USER (NO DEMO/FALLBACK)
   * ---------------------------------------------------*/
  const initializeTelegram = useCallback(() => {
    const tg = WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
      setIsTelegramApp(true);

      const tUser = tg.initDataUnsafe?.user;
      if (tUser) {
        const fullName = [tUser.first_name, tUser.last_name].filter(Boolean).join(' ');

        const cleanTelegramUser = {
          id: tUser.id,
          name: fullName,
          username: tUser.username
        };

        setTelegramUser(cleanTelegramUser);

        return {
          tg_id: String(tUser.id),
          tg_name: fullName,
          tg_username: tUser.username,
          start_param: tg.initDataUnsafe?.start_param
        };
      }
    }
    return null;
  }, []);

  /** ---------------------------------------------------
   *   LOGIN / REGISTER / UPDATE USER IN SUPABASE
   * ---------------------------------------------------*/
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const tgData = initializeTelegram();

      if (!tgData) {
        setError("Please open inside Telegram Mini App.");
        return;
      }

      /** Look for existing user */
      let { data: existingUser, error: fetchErr } = await supabase
        .from("users")
        .select("*")
        .eq("tg_id", tgData.tg_id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      if (!existingUser) {
        /** Create new user */
        const { data: newUser, error: insertErr } = await supabase
          .from("users")
          .insert({
            tg_id: tgData.tg_id,
            tg_name: tgData.tg_name,
            tg_username: tgData.tg_username,
            zero_points: 0,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertErr) throw insertErr;
        existingUser = newUser;
      } else {
        /** Update name/username every login */
        const { data: updatedUser, error: updateErr } = await supabase
          .from("users")
          .update({
            tg_name: tgData.tg_name,
            tg_username: tgData.tg_username,
            updated_at: new Date().toISOString(),
          })
          .eq("tg_id", tgData.tg_id)
          .select()
          .single();

        if (updateErr) throw updateErr;
        existingUser = updatedUser;
      }

      setUser(existingUser);

      /** Load user's transactions */
      const { data: tx, error: txErr } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", existingUser.id)
        .order("created_at", { ascending: false });

      if (txErr) throw txErr;

      setTransactions(tx || []);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user");
    } finally {
      setIsLoading(false);
    }
  }, [initializeTelegram]);

  /** -----------------------------------------------
   *   UPDATE POINTS LOCALLY
   * -----------------------------------------------*/
  const updateUserPoints = useCallback((newPoints: number) => {
    setUser(prev => prev ? { ...prev, zero_points: newPoints } : null);
  }, []);

  /** Append transaction locally */
  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  }, []);

  /** Update TON wallet */
  const setWalletAddress = useCallback((address: string) => {
    setUser(prev => prev ? { ...prev, ton_wallet_address: address } : null);
  }, []);

  /** Auto-run login on app load */
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
