// api/convertToZrc.ts
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  console.log("🔥 /api/convertToZrc called");

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Only POST allowed" });
  }

  try {
    const { tg_id, pointsToConvert } = req.body;

    console.log("📩 Incoming Body:", req.body);

    if (!tg_id || !pointsToConvert) {
      console.log("❌ Missing fields");
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    // Load user
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("*")
      .eq("tg_id", tg_id)
      .single();

    console.log("👤 Loaded user:", user);

    if (userErr || !user) {
      console.log("❌ User not found");
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    // Check for enough points
    if (user.zero_points < pointsToConvert) {
      console.log("❌ Not enough points");
      return res.status(400).json({
        ok: false,
        error: "Not enough points to convert",
      });
    }

    const zrcToAdd = pointsToConvert / 200;
    const updatedPoints = user.zero_points - pointsToConvert;
    const updatedZRC = user.zrc_balance + zrcToAdd;

    console.log("🔢 Conversion:", {
      zrcToAdd,
      updatedPoints,
      updatedZRC,
    });

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
      console.log("❌ User update failed:", updateErr);
      return res.status(500).json({ ok: false, error: updateErr.message });
    }

    console.log("✅ User updated");

    // ⭐ INSERT TRANSACTION LOG
    console.log("🧾 Attempting to insert transaction...");

    const { error: insertErr } = await supabase.from("transactions").insert([
      {
        id: crypto.randomUUID(),
        user_id: user.id,
        type: "zrc_conversion",
        description: `Converted ${pointsToConvert} points → ${zrcToAdd.toFixed(
          2
        )} ZRC`,
        amount: zrcToAdd,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertErr) {
      console.log("❌ TRANSACTION INSERT ERROR:", insertErr);
    } else {
      console.log("✅ Transaction inserted successfully!");
    }

    return res.json({
      ok: true,
      message: "Conversion successful",
      user: updatedUser,
      addedZRC: zrcToAdd,
    });
  } catch (err: any) {
    console.log("❌ Server Error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
