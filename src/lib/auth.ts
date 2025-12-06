// src/lib/auth.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function telegramLogin() {

  // Debug alert (INSIDE the function)
  alert("telegramLogin STARTED");

  const tg = (window as any).Telegram?.WebApp;

  const init = tg?.initData ?? "(no initData)";
  alert("STEP: initData = " + init);
  console.log("INITDATA SENT:", init);

  if (!tg?.initData) {
    console.error("No Telegram initData found.");
    return null;
  }

  // Send Telegram initData to backend
  const response = await fetch("/api/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData: tg.initData }),
  });

  const data = await response.json();

  if (!data.ok) {
    console.error("Telegram login failed:", data);
    alert("Login failed: " + JSON.stringify(data));
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

