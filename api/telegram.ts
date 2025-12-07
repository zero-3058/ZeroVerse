// api/telegram.ts
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// BACKEND Supabase client
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

  // Signature verification
  if (!validateTelegram(initData, botToken)) {
    return res.status(401).json({ ok: false, error: "Invalid signature" });
  }

  // Parse Telegram user
  const params = new URLSearchParams(initData);
  const user = JSON.parse(params.get("user")!);
  const email = `${user.id}@telegram.local`;

  // Attempt to create user
  const { error: userErr } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  // Log the error for debugging
  if (userErr) {
    console.error("CREATE USER ERROR:", userErr);
  }

  // Allow "email already exists" → NOT a real error
  if (userErr && userErr.code !== "email_exists") {
    return res.status(500).json({ ok: false, error: userErr });
  }

  // Generate login link to get token
  const { data: linkData, error: linkErr } =
    await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

  if (linkErr) {
    console.error("GENERATE LINK ERROR:", linkErr);
    return res.status(500).json({ ok: false, error: linkErr });
  }

  // NEW Supabase returns token in properties.hassed_token OR token
  // Safely extract token (runtime only — avoid TS errors)
  const props: any = linkData?.properties || {};
  const access_token =
   props.hashed_token ||
   props.token ||
  null;


  if (!access_token) {
    console.error("NO ACCESS TOKEN RETURNED:", linkData);
    return res.status(500).json({
      ok: false,
      error: "No access token returned by generateLink",
    });
  }

  // SUCCESS
  return res.json({
    ok: true,
    user,
    session: { access_token },
  });
}
