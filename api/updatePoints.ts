// api/updatePoints.ts
import { createClient } from "@supabase/supabase-js";

console.log("🔥 UPDATE POINTS API CALLED");

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Only POST allowed" });
  }

  try {
    const { tg_id, newPoints } = req.body;

    if (!tg_id || newPoints === undefined) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    // 1️⃣ Load user with UUID
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("*")
      .eq("tg_id", tg_id)
      .single();

    if (userErr || !user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    const updatedPoints = user.zero_points + newPoints;

    // 2️⃣ Update using UUID (correct!)
    const { data: updated, error: updateErr } = await supabase
      .from("users")
      .update({ zero_points: updatedPoints })
      .eq("id", user.id) // ✔ FIXED
      .select("*")
      .single();

    if (updateErr) {
      console.error("Update points error:", updateErr);
      return res.status(500).json({ ok: false, error: updateErr.message });
    }

    return res.json({ ok: true, user: updated });
  } catch (err: any) {
    console.error("Update points handler error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
