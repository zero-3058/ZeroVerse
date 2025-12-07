// api/telegram.ts
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// BACKEND supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validate Telegram initData
function validateTelegram(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);
  const dataCheckArr: string[] = [];

  params.forEach((value, key) => {
    if (key !== "hash") dataCheckArr.push(`${key}=${value}`);
  });

  dataCheckArr.sort();
  const dataString = dataCheckArr.join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const calculated = crypto
    .createHmac("sha256", secretKey)
    .update(dataString)
    .digest("hex");

  return calculated === params.get("hash");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Only POST allowed" });
  }

  const botToken = process.env.BOT_TOKEN!;
  const { initData } = req.body;

  if (!initData) {
    return res.status(400).json({ ok: false, error: "Missing initData" });
  }

  if (!validateTelegram(initData, botToken)) {
    return res.status(401).json({ ok: false, error: "Invalid signature" });
  }

  const params = new URLSearchParams(initData);
  const user = JSON.parse(params.get("user")!);
  const email = `${user.id}@telegram.local`;

  // Create user if not exists
  const { error: userErr } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (userErr) {
   console.error("CREATE USER ERROR:", userErr);
  }

  if (userErr && !userErr.message.includes("email_exists")) {
    return res.status(500).json({ ok: false, error: userErr });
  }

  // Generate login link to produce access token
  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkErr) {
   console.error("GENERATE LINK ERROR:", linkErr); // 🔥 DEBUG LOG
   return res.status(500).json({ ok: false, error: linkErr });
 }


  const access_token = linkData?.properties?.hashed_token;

  if (!access_token) {
    return res.status(500).json({ ok: false, error: "No access token generated" });
  }

  return res.json({
    ok: true,
    user,
    session: { access_token },
  });
}
