// api/telegram.ts
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validate Telegram data...
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
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ ok: false, error: "Missing initData" });
    }

    if (!validateTelegram(initData, botToken)) {
      return res.status(401).json({ ok: false, error: "Invalid signature" });
    }

    const params = new URLSearchParams(initData);
    const userRaw = params.get("user");
    const startParam = params.get("start_param") || null;

    if (!userRaw) {
      return res.status(400).json({ ok: false, error: "Missing user data" });
    }

    const tgUser = JSON.parse(userRaw);

    const tg_id = String(tgUser.id);
    const tg_name = `${tgUser.first_name || ""} ${tgUser.last_name || ""}`.trim();
    const tg_username = tgUser.username ?? null;
    const photo_url = tgUser.photo_url ?? null;

    // 1️⃣ Fetch existing user to preserve ALL fields (ZRC, streaks, etc.)
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("tg_id", tg_id)
      .single();

    // 2️⃣ Build safe upsert payload that DOES NOT overwrite fields
    const payload: any = {
      tg_id,
      tg_name,
      tg_username,
      photo_url,
      updated_at: new Date().toISOString(),
    };

    if (!existingUser) {
      // First time user login → initialize all fields
      payload.zero_points = 0;
      payload.zrc_balance = 0;
      payload.current_streak = 0;
      payload.best_streak = 0;
      payload.last_login = null;
      payload.referrer_id = null;
      payload.referral_count = 0;
      payload.referral_points_earned = 0;
      payload.ton_wallet_address = null;
    }

    // 3️⃣ Perform UPSERT and return FULL RECORD
    const { data: userRecord, error: userErr } = await supabase
      .from("users")
      .upsert(payload, { onConflict: "tg_id" })
      .select("*")
      .single();

    if (userErr || !userRecord) {
      return res.status(500).json({ ok: false, error: userErr?.message });
    }

    return res.json({
      ok: true,
      appUser: userRecord, // NOW includes zrc_balance, streak, wallet, etc.
      startParam,
    });

  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
