// src/lib/auth.ts
import { createClient } from "@supabase/supabase-js";

// Load Supabase keys
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Global Supabase client (still available if you use DB later)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function telegramLogin() {
  const tg = (window as any).Telegram?.WebApp;

  // ⭐ ALERT 1
  alert("telegramLogin STARTED");

  if (!tg) {
    alert("Telegram WebApp NOT available");
    return null;
  }

  if (!tg.initData) {
    alert("No initData found!");
    return null;
  }

  const initData = tg.initData;

  // ⭐ ALERT 2
  alert("STEP: initData = " + initData);

  // Send initData to backend for verification and login
  const response = await fetch("/api/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData }),
  });

  const data = await response.json();
  console.log("BACKEND RESPONSE:", data);

  if (!data.ok) {
    alert("Backend auth failed: " + JSON.stringify(data));
    return null;
  }

  // ⭐ SUCCESS → Backend verified Telegram user
  const telegramUser = data.user;

  // ⭐ ALERT 3
  alert("LOGGED-IN USER: " + JSON.stringify(telegramUser));

  return telegramUser;
}
