// api/telegram.ts
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Backend Supabase admin client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validate Telegram initData signature
function validateTelegram(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);
  const items: string[] = [];

  params.forEach((value, key) => {
    if (key !== "hash") items.push(`${key}=${value}`);
  });

  items.sort();
  const dataString = items.join("\n");

  const secret = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const calculated = crypto
    .createHmac("sha256", secret)
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

  // Telegram signature validation
  if (!validateTelegram(initData, botToken)) {
    return res.status(401).json({ ok: false, error: "Invalid signature" });
  }

  // Extract user from Telegram initData
  const params = new URLSearchParams(initData);
  const user = JSON.parse(params.get("user")!);
  const email = `${user.id}@telegram.local`;

  // Create Supabase user (ignore if already exists)
  const { error: userErr } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (userErr && userErr.code !== "email_exists") {
    return res.status(500).json({ ok: false, error: userErr.message });
  }

  // Generate a login link → returns a token
  const { data: linkData, error: linkErr } =
    await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

  if (linkErr) {
    return res.status(500).json({ ok: false, error: linkErr.message });
  }

  // Extract access token safely
  const props: any = linkData?.properties ?? {};
  const access_token =
    props.hashed_token ||
    props.token ||
    null;

  if (!access_token) {
    return res.status(500).json({
      ok: false,
      error: "No access token returned",
    });
  }

  // SUCCESS!
  return res.json({
    ok: true,
    user,
    session: { access_token },
  });
}
