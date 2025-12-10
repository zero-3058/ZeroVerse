// api/createWithdrawRequest.ts
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
    const { tg_id, zrcAmount } = req.body;

    if (!tg_id || !zrcAmount) {
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

    if (user.zrc_balance < zrcAmount) {
      return res.status(400).json({
        ok: false,
        error: "Not enough ZRC to withdraw",
      });
    }

    // Deduct ZRC immediately
    const updatedZRC = user.zrc_balance - zrcAmount;

    const { data: updatedUser, error: updateErr } = await supabase
      .from("users")
      .update({
        zrc_balance: updatedZRC,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateErr) {
      return res.status(500).json({ ok: false, error: updateErr.message });
    }

    // Insert into withdraw_requests
    await supabase.from("withdraw_requests").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      zrc_amount: zrcAmount,
      wallet_address: user.ton_wallet_address || null,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    // Log transaction
    await supabase.from("transactions").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      type: "withdraw_request",
      description: `Requested withdrawal of ${zrcAmount} ZRC`,
      amount: -zrcAmount,
      created_at: new Date().toISOString(),
    });

    return res.json({
      ok: true,
      message: "Withdrawal request submitted",
      user: updatedUser,
    });

  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
