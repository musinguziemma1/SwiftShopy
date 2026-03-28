import { describe, it, expect, vi } from "vitest";
import { generateSecret, verifyToken, generateBackupCodes } from "@/lib/2fa";

describe("2FA Service", () => {
  it("should generate a secret with otpauth URL", () => {
    const result = generateSecret("test@example.com");
    expect(result.secret).toBeDefined();
    expect(result.secret.length).toBeGreaterThan(0);
    expect(result.otpauthUrl).toContain("otpauth://totp");
    expect(result.otpauthUrl).toContain("SwiftShopy");
  });

  it("should generate backup codes", () => {
    const codes = generateBackupCodes(8);
    expect(codes).toHaveLength(8);
    codes.forEach((code) => {
      expect(code).toHaveLength(8);
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });
  });

  it("should generate correct number of backup codes", () => {
    const codes5 = generateBackupCodes(5);
    expect(codes5).toHaveLength(5);
    const codes10 = generateBackupCodes(10);
    expect(codes10).toHaveLength(10);
  });
});
