import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";

export function generateSecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `SwiftShopy (${email})`,
    issuer: "SwiftShopy",
  });
  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
  };
}

export async function generateQRCode(otpauthUrl: string): Promise<string> {
  return await QRCode.toDataURL(otpauthUrl);
}

export function verifyToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
}

export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
  }
  return codes;
}
