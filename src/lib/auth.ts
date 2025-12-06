// src/lib/auth.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
 alert("telegramLogin STARTED");
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function telegramLogin() {
  const tg = (window as any).Telegram?.WebApp;

  if (!tg?.initData) {
    console.error("No Telegram initData found.");
    return null;
  }

  // Send Telegram initData to backend
  const response = await fetch("/api/auth/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData: tg.initData }),
  });

  const data = await response.json();

  if (!data.ok) {
    console.error("Telegram login failed:", data);
    return null;
  }

  const access_token = data.session.access_token;

  // Store session in Supabase client
  await supabase.auth.setSession({
    access_token,
    refresh_token: "",
  });

  return data.user;
}
