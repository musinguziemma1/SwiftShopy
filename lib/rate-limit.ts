import { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(req: NextRequest, limit: number = 100, windowMs: number = 60000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? 
             req.headers.get("x-real-ip") ?? 
             "unknown";
  const key = `${ip}:${req.nextUrl.pathname}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (entry && entry.resetTime > now) {
    if (entry.count >= limit) {
      return { limited: true, remaining: 0, resetAt: entry.resetTime };
    }
    entry.count++;
    return { limited: false, remaining: limit - entry.count, resetAt: entry.resetTime };
  }

  rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
  return { limited: false, remaining: limit - 1, resetAt: now + windowMs };
}

export function withRateLimit(handler: Function, limit: number = 100) {
  return async (req: NextRequest, ...args: any[]) => {
    const result = rateLimit(req, limit);
    if (result.limited) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        },
      });
    }
    return handler(req, ...args);
  };
}
