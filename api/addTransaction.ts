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
    const { id, user_id, type, description, amount, created_at } = req.body;

    if (!user_id || !type || !amount) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields: user_id, type, amount",
      });
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        id,
        user_id,
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
