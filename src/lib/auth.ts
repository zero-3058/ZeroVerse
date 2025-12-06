// src/lib/auth.ts
import { createClient } from "@supabase/supabase-js";

// Load Supabase keys from Vite env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Global supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function telegramLogin() {
  const tg = (window as any).Telegram?.WebApp;

  alert("telegramLogin STARTED");

  if (!tg?.initData) {
    alert("No initData found");
    return null;
  }

  const init = tg.initData;
  alert("STEP: initData = " + init);

  // Send initData to backend
  const response = await fetch("/api/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData: init }),
  });

  const data = await response.json();

  if (!data.ok) {
    alert("Telegram login failed: " + JSON.stringify(data));
    return null;
  }

  const access_token = data.session.access_token;

  // ⭐ Set Supabase session
  const { error: sessionErr } = await supabase.auth.setSession({
    access_token,
    refresh_token: "",
  });

  if (sessionErr) {
    alert("Supabase session error: " + sessionErr.message);
    console.error(sessionErr);
    return null;
  }

  // ⭐ Verify logged in user
  const { data: userData } = await supabase.auth.getUser();
  console.log("LOGGED-IN USER:", userData);
  alert("LOGGED-IN USER: " + JSON.stringify(userData));

  return userData;
}
