import { useState } from "react";

export function useTelegramAuth() {
  const [loading, setLoading] = useState(false);
  const [appUser, setAppUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function loginWithTelegram() {
    try {
      setLoading(true);
      setError(null);

      // Telegram gives you initDataUnsafe
      const initData = window.Telegram?.WebApp?.initData || "";

      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error || "Auth failed");
        return;
      }

      // Save your app user (from DB)
      setAppUser(data.appUser);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { loginWithTelegram, appUser, loading, error };
}
