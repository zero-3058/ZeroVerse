// src/lib/auth.ts
import { createClient } from "@supabase/supabase-js";

// Load Supabase keys
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Global Supabase client
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

  // Send initData to backend
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

  const access_token = data.session?.access_token;

  if (!access_token) {
    alert("No access token returned!");
    return null;
  }

  // Set Supabase session
  const { error: sessionErr } = await supabase.auth.setSession({
    access_token,
    refresh_token: "",
  });

  if (sessionErr) {
    alert("Supabase session error: " + sessionErr.message);
    return null;
  }

  // Get logged-in user
  const { data: userData } = await supabase.auth.getUser();

  // ⭐ ALERT 3 (The one you are missing!)
  alert("LOGGED-IN USER: " + JSON.stringify(userData));

  return userData?.user ?? null;
}
