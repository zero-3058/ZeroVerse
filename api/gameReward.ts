// api/gameReward.ts
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

console.log("🎮 GAME REWARD API LOADED");

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Only POST allowed" });
  }

  try {
    const { tg_id, points } = req.body;

    if (!tg_id || points === undefined) {
      return res.status(400).json({ ok: false, error: "Missing tg_id or points" });
    }

    // 1️⃣ Load user by Telegram ID
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("*")
      .eq("tg_id", tg_id)
      .single();

    if (userErr || !user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    const newPoints = user.zero_points + points;

    // 2️⃣ Update points
    const { data: updated, error: updateErr } = await supabase
      .from("users")
      .update({ zero_points: newPoints })
      .eq("id", user.id) // use UUID not tg_id
      .select()
      .single();

    if (updateErr) {
      return res.status(500).json({ ok: false, error: updateErr.message });
    }

    // 3️⃣ Insert transaction using UUID
    const { error: txErr } = await supabase.from("transactions").insert({
      id: crypto.randomUUID(),
      user_id: user.id, // FIXED: use UUID (correct)
      type: "game",
      description: `Game reward: +${points}`,
      amount: points,
      created_at: new Date().toISOString(),
    });

    if (txErr) {
      console.error("Transaction insert error:", txErr);
      return res.status(500).json({ ok: false, error: txErr.message });
    }

    return res.json({ ok: true, user: updated });
  } catch (err: any) {
    console.error("Game reward error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
