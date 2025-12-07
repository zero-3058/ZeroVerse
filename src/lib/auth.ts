// src/lib/auth.ts
import { createClient } from "@supabase/supabase-js";

// Load Supabase keys from Vite env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Global Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function telegramLogin() {
  const tg = (window as any).Telegram?.WebApp;

  // Ensure Telegram WebApp is available
  if (!tg) {
    console.error("Telegram WebApp not available.");
    return null;
  }

  // Make sure initData exists
  if (!tg.initData) {
    console.error("Telegram initData missing.");
    return null;
  }

  const initData = tg.initData;

  // Send initData to backend for validation + session creation
  const response = await fetch("/api/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData }),
  });

  const data = await response.json();
  console.log("BACKEND RESPONSE:", data);

  // Backend error → stop
  if (!data.ok) {
    console.error("Telegram auth failed:", data);
    return null;
  }

  // Extract session token returned by backend
  const access_token = data.session?.access_token;

  if (!access_token) {
    console.error("No access token returned from backend.");
    return null;
  }

  // Apply session to Supabase
  const { error: sessionErr } = await supabase.auth.setSession({
    access_token,
    refresh_token: "",
  });

  if (sessionErr) {
    console.error("Supabase session error:", sessionErr);
    return null;
  }

  // Verify logged-in user
  const { data: userData } = await supabase.auth.getUser();
  console.log("LOGGED-IN USER:", userData);

  return userData?.user ?? null;
}
