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

    if (newUserTgId === referrerTgId) {
      return res.status(400).json({ ok: false, error: "Self referral blocked" });
    }

    // Load new user
    const { data: newUser } = await supabase
      .from("users")
      .select("*")
      .eq("tg_id", newUserTgId)
      .single();

    if (!newUser) {
      return res.status(404).json({ ok: false, error: "New user not found" });
    }

    // Prevent double reward
    if (newUser.referrer_id) {
      return res.json({ ok: true, message: "Referral already rewarded" });
    }

    // Load referrer
    const { data: referrer } = await supabase
      .from("users")
      .select("*")
      .eq("tg_id", referrerTgId)
      .single();

    if (!referrer) {
      return res.status(404).json({ ok: false, error: "Referrer not found" });
    }

    // ⭐ NEW USER REWARD (100)
    const updatedNewPoints = newUser.zero_points + 100;

    const { error: updateNewErr } = await supabase
      .from("users")
      .update({
        zero_points: updatedNewPoints,
        referrer_id: referrer.id
      })
      .eq("id", newUser.id)
      .is("referrer_id", null);

    if (updateNewErr) {
      return res.json({ ok: true, message: "Referral already rewarded" });
    }

    // NEW USER TRANSACTION
    await supabase.from("transactions").insert({
      id: crypto.randomUUID(),
      user_id: newUser.id,
      type: "referral",
      description: "Referral bonus for joining",
      amount: 100,
      created_at: new Date().toISOString(),
    });

    // ⭐ REFERRER REWARD (200)
    await supabase
      .from("users")
      .update({
        zero_points: referrer.zero_points + 200,
        referral_count: referrer.referral_count + 1,
        referral_points_earned: referrer.referral_points_earned + 200,
      })
      .eq("id", referrer.id);

    // REFERRER TRANSACTION
    await supabase.from("transactions").insert({
      id: crypto.randomUUID(),
      user_id: referrer.id,
      type: "referral",
      description: `Referral reward for inviting user ${newUserTgId}`,
      amount: 200,
      created_at: new Date().toISOString(),
    });

    return res.json({ ok: true, message: "Referral reward applied" });

  } catch (err: any) {
    // Only REAL errors printed
    console.error("Referral error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
