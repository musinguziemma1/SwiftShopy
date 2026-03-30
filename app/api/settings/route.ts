import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

    console.log("Received settings:", Object.keys(settings));

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Invalid settings format" }, { status: 400 });
    }

    // Get the absolute path to .env.local
    const rootDir = process.cwd();
    const envPath = path.resolve(rootDir, ".env.local");
    
    console.log("Writing to:", envPath);
    
    // Read existing env file
    let envContent = "";
    try {
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, "utf-8");
        console.log("Existing .env.local found, length:", envContent.length);
      } else {
        console.log(".env.local not found, will create new file");
      }
    } catch (e: any) {
      console.error("Error reading .env.local:", e.message);
    }

    // Parse existing env vars
    const envLines = envContent.split("\n");
    const envMap: Record<string, string> = {};
    
    for (const line of envLines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const equalIndex = trimmed.indexOf("=");
        if (equalIndex > 0) {
          const key = trimmed.substring(0, equalIndex).trim();
          const value = trimmed.substring(equalIndex + 1).trim();
          envMap[key] = value;
        }
      }
    }

    // Update with new settings
    const updatedKeys: string[] = [];
    for (const [settingKey, value] of Object.entries(settings)) {
      const envKey = KEY_TO_ENV[settingKey];
      if (envKey && value !== undefined && value !== "") {
        envMap[envKey] = value;
        updatedKeys.push(envKey);
        console.log(`Mapped ${settingKey} -> ${envKey}`);
      }
    }

    console.log("Updated keys:", updatedKeys);

    // Build new env content preserving structure
    const newEnvLines: string[] = [];
    const processedKeys = new Set<string>();

    // Preserve existing lines and update values
    for (const line of envLines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("#") || !trimmed) {
        newEnvLines.push(line);
      } else {
        const equalIndex = trimmed.indexOf("=");
        if (equalIndex > 0) {
          const keyName = trimmed.substring(0, equalIndex).trim();
          if (envMap[keyName] !== undefined) {
            newEnvLines.push(`${keyName}=${envMap[keyName]}`);
            processedKeys.add(keyName);
          } else {
            newEnvLines.push(line);
          }
        } else {
          newEnvLines.push(line);
        }
      }
    }

    // Add any new keys that weren't in the original file
    for (const key of updatedKeys) {
      if (!processedKeys.has(key)) {
        newEnvLines.push(`${key}=${envMap[key]}`);
        console.log(`Added new key: ${key}`);
      }
    }

    // Write back to file
    const newContent = newEnvLines.join("\n");
    fs.writeFileSync(envPath, newContent, "utf-8");
    console.log("Successfully wrote to .env.local");

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedKeys.length} environment variables`,
      updatedKeys,
      filePath: envPath,
    });
  } catch (error: any) {
    console.error("Error updating .env.local:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update environment file", stack: error.stack },
      { status: 500 }
    );
  }
}
