// api/convertToZrc.ts
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
    const { tg_id, pointsToConvert } = req.body;

    if (!tg_id || !pointsToConvert) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    // Load user
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("*")
      .eq("tg_id", tg_id)
      .single();

    if (userErr || !user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    // Check for enough points
    if (user.zero_points < pointsToConvert) {
      return res.status(400).json({
        ok: false,
        error: "Not enough points to convert",
      });
    }

    // Conversion: 200 pts = 1 ZRC
    const zrcToAdd = pointsToConvert / 200;
    const updatedPoints = user.zero_points - pointsToConvert;
    const updatedZRC = user.zrc_balance + zrcToAdd;

    // Update user
    const { data: updatedUser, error: updateErr } = await supabase
      .from("users")
      .update({
        zero_points: updatedPoints,
        zrc_balance: updatedZRC,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateErr) {
      return res.status(500).json({ ok: false, error: updateErr.message });
    }

    // ⭐ Add Transaction Log (simple)
    await supabase.from("transactions").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      type: "zrc_conversion",
      description: `Converted points → ${zrcToAdd.toFixed(2)} ZRC`,
      amount: zrcToAdd,
      created_at: new Date().toISOString(),
    });

    return res.json({
      ok: true,
      message: "Conversion successful",
      user: updatedUser,
      addedZRC: zrcToAdd,
    });

  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
