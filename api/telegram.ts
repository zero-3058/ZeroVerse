// api/telegram.ts
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Backend Supabase admin client (service role)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validate Telegram initData signature
function validateTelegram(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);
  const items: string[] = [];

  params.forEach((value, key) => {
    if (key !== "hash") items.push(`${key}=${value}`);
  });

  items.sort();
  const dataString = items.join("\n");

  const secret = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const calculated = crypto
    .createHmac("sha256", secret)
    .update(dataString)
    .digest("hex");

  return calculated === params.get("hash");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Only POST allowed" });
  }

  try {
    const botToken = process.env.BOT_TOKEN!;
    const { initData } = req.body as { initData?: string };

    if (!initData) {
      return res.status(400).json({ ok: false, error: "Missing initData" });
    }

    // 1) Telegram signature validation
    if (!validateTelegram(initData, botToken)) {
      return res.status(401).json({ ok: false, error: "Invalid signature" });
    }

    // 2) Extract Telegram user from initData
    const params = new URLSearchParams(initData);
    const userRaw = params.get("user");

    if (!userRaw) {
      return res.status(400).json({ ok: false, error: "Missing user data" });
    }

    const user = JSON.parse(userRaw);

    const tg_id = String(user.id);
    const tg_name = user.first_name
      ? user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.first_name
      : null;
    const tg_username = user.username ?? null;

    // 3) UPSERT into your existing `users` table
    const { data: appUser, error: upsertErr } = await supabase
      .from("users")
      .upsert(
        {
          tg_id,
          tg_name,
          tg_username,
          // zero_points uses default if new row
        },
        {
          onConflict: "tg_id",
        }
      )
      .select()
      .single();

    if (upsertErr) {
      console.error("Supabase users upsert error:", upsertErr);
      return res
        .status(500)
        .json({ ok: false, error: "Failed to upsert app user" });
    }

    // 4) SUCCESS
    return res.json({
      ok: true,
      user,    // raw Telegram user object
      appUser, // row from your `users` table
    });
  } catch (err: any) {
    console.error("Telegram handler error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
