import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ─── Update .env.local with API settings ───────────────────────────────

interface EnvUpdate {
  [key: string]: string;
}

// Map setting keys to env variable names
const KEY_TO_ENV: Record<string, string> = {
  mtn_sandbox_base_url: "MTN_SANDBOX_BASE_URL",
  mtn_sandbox_collections_key: "MTN_SANDBOX_COLLECTIONS_KEY",
  mtn_sandbox_disbursements_key: "MTN_SANDBOX_DISBURSEMENTS_KEY",
  mtn_sandbox_api_user_id: "MTN_SANDBOX_API_USER_ID",
  mtn_sandbox_api_key: "MTN_SANDBOX_API_KEY",
  mtn_production_base_url: "MTN_PRODUCTION_BASE_URL",
  mtn_production_collections_key: "MTN_PRODUCTION_COLLECTIONS_KEY",
  mtn_production_disbursements_key: "MTN_PRODUCTION_DISBURSEMENTS_KEY",
  mtn_production_api_user_id: "MTN_PRODUCTION_API_USER_ID",
  mtn_production_api_key: "MTN_PRODUCTION_API_KEY",
  airtel_sandbox_base_url: "AIRTEL_SANDBOX_BASE_URL",
  airtel_production_base_url: "AIRTEL_PRODUCTION_BASE_URL",
  airtel_client_id: "AIRTEL_CLIENT_ID",
  airtel_client_secret: "AIRTEL_CLIENT_SECRET",
  whatsapp_phone_number_id: "WHATSAPP_PHONE_NUMBER_ID",
  whatsapp_access_token: "WHATSAPP_ACCESS_TOKEN",
  whatsapp_api_version: "WHATSAPP_API_VERSION",
  email_provider: "EMAIL_PROVIDER",
  resend_api_key: "RESEND_API_KEY",
  sendgrid_api_key: "SENDGRID_API_KEY",
  email_from: "EMAIL_FROM",
  environment: "MTN_ENVIRONMENT",
  currency: "DEFAULT_CURRENCY",
  callback_url: "MTN_CALLBACK_URL",
  webhook_secret: "MTN_WEBHOOK_SECRET",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body as { settings: Record<string, string> };

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Invalid settings format" }, { status: 400 });
    }

    const envPath = path.join(process.cwd(), ".env.local");
    
    // Read existing env file
    let envContent = "";
    try {
      envContent = fs.readFileSync(envPath, "utf-8");
    } catch (e) {
      // File doesn't exist, create new
      envContent = "";
    }

    // Parse existing env vars
    const envLines = envContent.split("\n");
    const envMap: Record<string, string> = {};
    
    for (const line of envLines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key) {
          envMap[key.trim()] = valueParts.join("=").trim();
        }
      }
    }

    // Update with new settings
    const updatedKeys: string[] = [];
    for (const [settingKey, value] of Object.entries(settings)) {
      const envKey = KEY_TO_ENV[settingKey];
      if (envKey && value) {
        envMap[envKey] = value;
        updatedKeys.push(envKey);
      }
    }

    // Build new env content
    const newEnvLines: string[] = [];
    const processedKeys = new Set<string>();

    // Preserve existing lines and update values
    for (const line of envLines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("#") || !trimmed) {
        newEnvLines.push(line);
      } else {
        const [key] = trimmed.split("=");
        const keyName = key?.trim();
        if (keyName && envMap[keyName] !== undefined) {
          newEnvLines.push(`${keyName}=${envMap[keyName]}`);
          processedKeys.add(keyName);
        } else {
          newEnvLines.push(line);
        }
      }
    }

    // Add any new keys that weren't in the original file
    for (const [key, value] of Object.entries(envMap)) {
      if (!processedKeys.has(key) && updatedKeys.includes(key)) {
        newEnvLines.push(`${key}=${value}`);
      }
    }

    // Write back to file
    fs.writeFileSync(envPath, newEnvLines.join("\n"), "utf-8");

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedKeys.length} environment variables`,
      updatedKeys,
    });
  } catch (error: any) {
    console.error("Error updating .env.local:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update environment file" },
      { status: 500 }
    );
  }
}
