// api/telegram.ts
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role allows UPSERT + UPDATE
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

    // UPSERT user and RETURN ALL FIELDS including streaks
    const { data: userRecord, error: userErr } = await supabase
      .from("users")
      .upsert(
        {
          tg_id,
          tg_name,
          tg_username,
          photo_url,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "tg_id" }
      )
      .select("*")   // <-- IMPORTANT: returns streak columns
      .single();

    if (userErr || !userRecord) {
      return res.status(500).json({ ok: false, error: userErr?.message });
    }

    return res.json({
      ok: true,
      appUser: userRecord,
      startParam
    });

  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
