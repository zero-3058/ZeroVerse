// api/addTransaction.ts
import { createClient } from "@supabase/supabase-js";

// Supabase Admin Client (service role)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ ok: false, error: "Only POST request allowed" });
  }

  try {
    const { user_id, type, description, amount } = req.body;

    if (!user_id || !type || amount === undefined) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing user_id, type or amount" });
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id,
        type,
        description,
        amount,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert transaction error:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.json({ ok: true, transaction: data });
  } catch (err: any) {
    console.error("addTransaction handler error:", err);
    return res
      .status(500)
      .json({ ok: false, error: err.message || "Unknown error" });
  }
}
