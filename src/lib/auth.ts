// src/lib/auth.ts
import { createClient } from "@supabase/supabase-js";

// Load Supabase keys
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Global Supabase client (for future DB usage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

type LoginSuccess = { ok: true; user: any };
type LoginFail = { ok: false; error: string };
export type LoginResult = LoginSuccess | LoginFail;

export async function telegramLogin(): Promise<LoginResult> {
  try {
    const tg = (window as any).Telegram?.WebApp;
    console.log("Telegram WebApp object:", tg);

    if (!tg) {
      const msg = "Telegram WebApp object not available (not running inside Telegram?)";
      console.warn(msg);
      return { ok: false, error: msg };
    }

    const initData: string | undefined = tg.initData;
    console.log("initData string length:", initData ? initData.length : 0);

    if (!initData) {
      const msg = "Telegram initData is empty or missing";
      console.warn(msg);
      return { ok: false, error: msg };
    }

    // Send initData to backend for verification
    const response = await fetch("/api/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    });

    const data = await response.json();
    console.log("BACKEND RESPONSE:", data);

    if (!data.ok) {
      const msg = `Backend auth failed: ${data.error || "Unknown backend error"}`;
      console.error(msg);
      return { ok: false, error: msg };
    }

    if (!data.appUser) {
      const msg = "Backend responded ok but appUser is missing in response";
      console.error(msg);
      return { ok: false, error: msg };
    }

    // Save your DB user in localStorage
    localStorage.setItem("appUser", JSON.stringify(data.appUser));

    return { ok: true, user: data.appUser };
  } catch (err: any) {
    const msg = `telegramLogin threw error: ${err?.message || String(err)}`;
    console.error(msg);
    return { ok: false, error: msg };
  }
}
