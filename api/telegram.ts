// api/telegram.ts

import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------
//  Helper Functions
// ---------------------------------------------------
function parseInitData(initData: string) {
  return Object.fromEntries(new URLSearchParams(initData));
}

function generateHash(initData: string, botToken: string) {
  const secretKey = crypto.createHash("sha256").update(botToken).digest();

  const dataCheckString = initData
    .split("&")
    .filter((pair) => !pair.startsWith("hash="))
    .sort()
    .join("\n");

  return crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");
}

// Create JWT manually (Supabase-compatible)
function createSupabaseJWT(userId: string, serviceRoleKey: string) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: userId,
    role: "authenticated",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };

  const base64 = (obj: any) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const headerBase = base64(header);
  const payloadBase = base64(payload);
  const data = `${headerBase}.${payloadBase}`;

  const signature = crypto
    .createHmac("sha256", serviceRoleKey)
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

// ---------------------------------------------------
//  MAIN HANDLER
// ---------------------------------------------------
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const { initData } = req.body || {};
  if (!initData) {
    return res.status(400).json({ ok: false, error: "Missing initData" });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!BOT_TOKEN || !SUPABASE_URL || !SERVICE_ROLE) {
    return res.status(500).json({
      ok: false,
      error: "Server misconfigured: missing environment variables",
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  try {
    // 1. VERIFY TELEGRAM SIGNATURE
    const params = parseInitData(initData);
    const receivedHash = params.hash;

    if (!receivedHash) {
      return res.status(400).json({ ok: false, error: "Missing hash" });
    }

    const computedHash = generateHash(initData, BOT_TOKEN);

    if (computedHash !== receivedHash) {
      return res.status(401).json({ ok: false, error: "Invalid initData signature" });
    }

    // Extract Telegram user data
    const tgUser = params.user ? JSON.parse(params.user) : null;
    if (!tgUser) {
      return res.status(400).json({ ok: false, error: "Missing user data" });
    }

    const telegramId = tgUser.id;

    // 2. FIND OR CREATE USER IN SUPABASE
    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("telegram_id", telegramId)
      .maybeSingle();

    let userId: string;

    if (!existing) {
      const { data: authUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: `tg-${telegramId}@telegram.local`,
          email_confirm: true,
          user_metadata: {
            telegram_id: telegramId,
            username: tgUser.username,
            name: tgUser.first_name,
          },
        });

      if (createError || !authUser?.user) {
        console.error(createError);
        return res.status(500).json({ ok: false, error: "Failed to create Supabase user" });
      }

      userId = authUser.user.id;

      await supabase.from("profiles").insert({
        id: userId,
        telegram_id: telegramId,
        username: tgUser.username,
        name: tgUser.first_name,
      });
    } else {
      userId = existing.id;
    }

    // 3. CREATE SUPABASE SESSION TOKEN (JWT)
    const access_token = createSupabaseJWT(userId, SERVICE_ROLE);

    // 4. RETURN RESULT
    return res.status(200).json({
      ok: true,
      verified: true,
      user: {
        id: userId,
        telegram_id: telegramId,
        username: tgUser.username,
        name: tgUser.first_name,
      },
      session: {
        access_token,
        token_type: "Bearer",
      },
    });

  } catch (err) {
    console.error("Telegram Auth Error:", err);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}
