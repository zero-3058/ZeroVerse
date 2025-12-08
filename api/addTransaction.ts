// /api/addTransaction.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Only POST allowed" });
  }

  try {
    const { id, tg_id, type, description, amount, created_at } = req.body;

    if (!tg_id || !type || !amount) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: tg_id, type, amount",
      });
    }

    // 1️⃣ GET USER UUID FROM TG_ID
    const { data: userRecord, error: userErr } = await supabase
      .from("users")
      .select("id")
      .eq("tg_id", tg_id)
      .single();

    if (userErr || !userRecord) {
      return res.status(404).json({ ok: false, error: "User not found for tg_id" });
    }

    const userUUID = userRecord.id; // ✔ correct UUID

    // 2️⃣ INSERT TRANSACTION USING UUID
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        id,
        user_id: userUUID, // ✔ FIXED UUID
        type,
        description,
        amount,
        created_at,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ ok: true, transaction: data });
  } catch (err: any) {
    console.error("addTransaction API error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
