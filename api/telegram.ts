// api/telegram.ts
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Supabase Admin Client (service role key)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validate Telegram initData
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

    // Extract telegram user
    const params = new URLSearchParams(initData);
    const userRaw = params.get("user");
    const startParam = params.get("start_param") || null;

    if (!userRaw) {
      return res.status(400).json({ ok: false, error: "Missing user data" });
    }

    const tgUser = JSON.parse(userRaw);

    const tg_id = String(tgUser.id);
    const tg_name = tgUser.first_name
      ? `${tgUser.first_name} ${tgUser.last_name || ""}`.trim()
      : null;
    const tg_username = tgUser.username ?? null;

    // Check if existing user
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("tg_id", tg_id)
      .maybeSingle();

    let isNewUser = false;

    // ----------------------
    // CREATE NEW USER
    // ----------------------
    if (!existingUser) {
      isNewUser = true;

      const { error: insertErr } = await supabase
        .from("users")
        .insert({
          tg_id,
          tg_name,
          tg_username,
          zero_points: 200, // NEW USER BONUS
          referral_count: 0,
          referral_points_earned: 0,
          created_at: new Date().toISOString(),
        });

      if (insertErr) {
        console.error(insertErr);
        return res.status(500).json({ ok: false, error: insertErr.message });
      }
    } else {
      // ----------------------
      // UPDATE EXISTING USER INFORMATION
      // ----------------------
      const { error: updateErr } = await supabase
        .from("users")
        .update({
          tg_name,
          tg_username,
          updated_at: new Date().toISOString(),
        })
        .eq("tg_id", tg_id);

      if (updateErr) {
        console.error(updateErr);
        return res.status(500).json({ ok: false, error: updateErr.message });
      }
    }

    // ----------------------
    // REFERRAL HANDLING
    // ONLY FOR NEW USERS
    // ----------------------
    if (isNewUser && startParam) {
      const referrerTgId = startParam;

      // Prevent self-referrals
      if (referrerTgId !== tg_id) {
        const { data: referrer } = await supabase
          .from("users")
          .select("*")
          .eq("tg_id", referrerTgId)
          .maybeSingle();

        if (referrer) {
          // Set the referrer_id on new user
          await supabase
            .from("users")
            .update({
              referrer_id: referrer.id,
            })
            .eq("tg_id", tg_id);

          // Reward the referrer
          await supabase
            .from("users")
            .update({
              zero_points: (referrer.zero_points || 0) + 200,
              referral_count: (referrer.referral_count || 0) + 1,
              referral_points_earned:
                (referrer.referral_points_earned || 0) + 200,
            })
            .eq("id", referrer.id);
        }
      }
    }

    // ----------------------------------------------------
    // 🔥 FINAL FIX: RETURN *LATEST* USER FROM DATABASE
    // This ensures points NEVER reset after earning.
    // ----------------------------------------------------
    const { data: freshUser, error: freshErr } = await supabase
      .from("users")
      .select("*")
      .eq("tg_id", tg_id)
      .single();

    if (freshErr) {
      console.error("Failed to fetch updated user:", freshErr);
      return res.status(500).json({ ok: false, error: freshErr.message });
    }

    return res.json({
      ok: true,
      appUser: freshUser,
      startParam: startParam || null,
    });
  } catch (err: any) {
    console.error("telegram auth error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
