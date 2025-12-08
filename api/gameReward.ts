// api/gameReward.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
console.log("🎮 GAME REWARD API CALLED");

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Only POST allowed" });
  }

  try {
    const { tg_id, points } = req.body;

    if (!tg_id || !points) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    // Get current user
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("*")
      .eq("tg_id", tg_id)
      .single();

    if (userErr || !user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    const newPoints = user.zero_points + points;

    // Update user points
    const { data: updated, error: updateErr } = await supabase
      .from("users")
      .update({ zero_points: newPoints })
      .eq("tg_id", tg_id)
      .select()
      .single();

    if (updateErr) {
      return res.status(500).json({ ok: false, error: updateErr.message });
    }

    // Create transaction
    await supabase.from("transactions").insert({
      id: crypto.randomUUID(),
      user_id: tg_id,
      type: "game",
      description: `Game reward: +${points}`,
      amount: points,
      created_at: new Date().toISOString(),
    });

    return res.json({ ok: true, user: updated });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
