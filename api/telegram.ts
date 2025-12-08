// api/telegram.ts
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

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

    console.log("🔹 Telegram Login:", { tg_id, startParam });

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("tg_id", tg_id)
      .maybeSingle();

    let userRecord = existingUser;

    // CREATE NEW USER (NO REWARDS HERE)
    if (!existingUser) {
      console.log("🆕 Creating new user:", tg_id);

      const { data: newUser, error: insertErr } = await supabase
        .from("users")
        .insert({
          tg_id,
          tg_name,
          tg_username,
          photo_url,
          zero_points: 0, // IMPORTANT: No default rewards
          referral_count: 0,
          referral_points_earned: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertErr) {
        console.error("Insert error:", insertErr);
        return res.status(500).json({ ok: false, error: insertErr.message });
      }

      userRecord = newUser;
    }

    // UPDATE EXISTING USER PROFILE
    else {
      const { data: updatedUser, error: updateErr } = await supabase
        .from("users")
        .update({
          tg_name,
          tg_username,
          photo_url,
          updated_at: new Date().toISOString(),
        })
        .eq("tg_id", tg_id)
        .select()
        .single();

      if (updateErr) {
        console.error("Update error:", updateErr);
        return res.status(500).json({ ok: false, error: updateErr.message });
      }

      userRecord = updatedUser;
    }

    // NO REWARD LOGIC HERE — only return start_param
    console.log("➡️ Returning user + start_param to frontend");

    return res.json({
      ok: true,
      appUser: userRecord,
      startParam, // Frontend calls /api/referralReward
    });
  } catch (err: any) {
    console.error("telegram auth error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
