// api/telegram.ts
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Backend Supabase admin client (service role)
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
  const { initData } = req.body as { initData?: string };

  if (!initData) {
    return res.status(400).json({ ok: false, error: "Missing initData" });
  }

  // 1) Telegram signature validation
  if (!validateTelegram(initData, botToken)) {
    return res.status(401).json({ ok: false, error: "Invalid signature" });
  }

  // 2) Extract Telegram user from initData
  const params = new URLSearchParams(initData);
  const userRaw = params.get("user");

  if (!userRaw) {
    return res.status(400).json({ ok: false, error: "Missing user data" });
  }

  const user = JSON.parse(userRaw);
  const email = `${user.id}@telegram.local`;

  // 3) Create Supabase Auth user (ignore if already exists)
  const { error: userErr } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (userErr && userErr.code !== "email_exists") {
    return res.status(500).json({ ok: false, error: userErr.message });
  }

  // 4) Generate a login link → returns a token
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

  // 5) UPSERT into your existing `users` table
  // Schema:
  // id uuid primary key default gen_random_uuid(),
  // tg_id text unique not null,
  // tg_name text,
  // tg_username text,
  // zero_points integer default 0,
  // ton_wallet_address text,
  // referrer_id uuid references users(id) on delete set null,
  // created_at timestamptz default now(),
  // updated_at timestamptz default now()
  const tg_id = String(user.id);
  const tg_name = user.first_name
    ? user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.first_name
    : null;
  const tg_username = user.username ?? null;

  const { data: appUser, error: upsertErr } = await supabase
    .from("users")
    .upsert(
      {
        tg_id,
        tg_name,
        tg_username,
        // zero_points will use default 0 if new row
      },
      {
        onConflict: "tg_id",
      }
    )
    .select()
    .single();

  if (upsertErr) {
    console.error("Supabase users upsert error:", upsertErr);
    return res
      .status(500)
      .json({ ok: false, error: "Failed to upsert app user" });
  }

  // 6) SUCCESS → return:
  // - raw Telegram user (user)
  // - Supabase Auth session token (session.access_token)
  // - your app-level user record from `users` table (appUser)
  return res.json({
    ok: true,
    user, // Telegram user object
    session: { access_token },
    appUser, // Row from `users` table (includes zero_points, etc.)
  });
}
