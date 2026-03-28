import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

function createMockRequest(ip: string = "127.0.0.1") {
  return {
    headers: {
      get: (name: string) => {
        if (name === "x-forwarded-for") return ip;
        return null;
      },
    },
    nextUrl: { pathname: "/api/test" },
  } as any;
}

describe("Rate Limiting", () => {
  it("should allow requests within limit", () => {
    const req = createMockRequest();
    const result = rateLimit(req, 5, 60000);
    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(4);
  });

  it("should block requests over limit", () => {
    const req = createMockRequest("192.168.1.1");
    for (let i = 0; i < 5; i++) {
      rateLimit(req, 5, 60000);
    }
    const result = rateLimit(req, 5, 60000);
    expect(result.limited).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("should track different IPs separately", () => {
    const req1 = createMockRequest("10.0.0.1");
    const req2 = createMockRequest("10.0.0.2");
    for (let i = 0; i < 3; i++) {
      rateLimit(req1, 5, 60000);
    }
    const result = rateLimit(req2, 5, 60000);
    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(4);
  });
});
