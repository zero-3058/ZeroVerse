// api/referralReward.ts
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Only POST allowed" });
  }

  try {
    const { newUserTgId, referrerTgId } = req.body;

    if (!newUserTgId || !referrerTgId) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    // Prevent self referral
    if (newUserTgId === referrerTgId) {
      return res.status(400).json({ ok: false, error: "Self referral blocked" });
    }

    // Load new user
    const { data: newUser, error: newUserErr } = await supabase
      .from("users")
      .select("*")
      .eq("tg_id", newUserTgId)
      .maybeSingle();

    if (!newUser || newUserErr) {
      return res.status(404).json({ ok: false, error: "New user not found" });
    }

    // If user already has a referrer, prevent duplicate reward
    if (newUser.referrer_id) {
      return res.json({ ok: true, message: "Referral already rewarded" });
    }

    // Load referrer
    const { data: referrer, error: refErr } = await supabase
      .from("users")
      .select("*")
      .eq("tg_id", referrerTgId)
      .maybeSingle();

    if (!referrer || refErr) {
      return res.status(404).json({ ok: false, error: "Referrer not found" });
    }

    // ⭐ Give New User +200
    const updatedNewUserPoints = newUser.zero_points + 200;

    await supabase
      .from("users")
      .update({
        zero_points: updatedNewUserPoints,
        referrer_id: referrer.id, // link referrer
      })
      .eq("id", newUser.id);

    // Transaction for new user
    await supabase.from("transactions").insert({
      id: crypto.randomUUID(),
      user_id: newUserTgId,
      type: "referral",
      description: "Referral bonus for joining",
      amount: 200,
      created_at: new Date().toISOString(),
    });

    // ⭐ Give Referrer +200
    const updatedRefPoints = referrer.zero_points + 200;

    await supabase
      .from("users")
      .update({
        zero_points: updatedRefPoints,
        referral_count: referrer.referral_count + 1,
        referral_points_earned: referrer.referral_points_earned + 200
      })
      .eq("id", referrer.id);

    // Transaction for referrer
    await supabase.from("transactions").insert({
      id: crypto.randomUUID(),
      user_id: referrerTgId,
      type: "referral",
      description: `Referral reward for inviting ${newUserTgId}`,
      amount: 200,
      created_at: new Date().toISOString(),
    });

    return res.json({
      ok: true,
      message: "Referral reward applied",
    });
  } catch (err: any) {
    console.error("Referral error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
