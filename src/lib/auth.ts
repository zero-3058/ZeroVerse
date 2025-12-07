// src/lib/auth.ts
import { createClient } from "@supabase/supabase-js";

// Load Supabase keys
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Global Supabase client (not used for auth anymore, but kept for DB operations later)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function telegramLogin() {
  try {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg || !tg.initData) {
      console.warn("Telegram WebApp initData missing");
      return null;
    }

    const initData = tg.initData;

    // Send initData to backend for verification
    const response = await fetch("/api/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    });

    const data = await response.json();
    console.log("BACKEND RESPONSE:", data);

    if (!data.ok) {
      console.error("Backend auth failed:", data.error);
      return null;
    }

    // Save your DB user in localStorage
    if (data.appUser) {
      localStorage.setItem("appUser", JSON.stringify(data.appUser));
      return data.appUser;
    }

    return null;
  } catch (err) {
    console.error("telegramLogin ERROR:", err);
    return null;
  }
}
