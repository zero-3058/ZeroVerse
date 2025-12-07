// api/updatePoints.ts
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
    const { tg_id, newPoints } = req.body;

    if (!tg_id || newPoints === undefined) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ zero_points: newPoints })
      .eq("tg_id", tg_id)
      .select()
      .single();

    if (error) {
      console.error("Update points error:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.json({ ok: true, user: data });
  } catch (err: any) {
    console.error("Update points handler error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
