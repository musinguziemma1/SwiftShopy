/**
 * WhatsApp Security Module
 * 
 * Handles encryption, audit logging, webhook verification, and rate limiting
 * for the WhatsApp integration.
 */

import crypto from "crypto";

// ─── Encryption ────────────────────────────────────────────────
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const ITERATIONS = 100000;

function getEncryptionKey(): Buffer {
  const secret = process.env.WHATSAPP_ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET || "default-secret";
  return crypto.scryptSync(secret, "whatsapp-salt", KEY_LENGTH);
}

export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  // Format: iv:tag:encrypted
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

export function decryptToken(ciphertext: string): string {
  const key = getEncryptionKey();
  const parts = ciphertext.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid ciphertext format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const tag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ─── Webhook Signature Verification ─────────────────────────────
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export function generateWebhookVerifyToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ─── Rate Limiting ────────────────────────────────────────────
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class WhatsAppRateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private defaultLimit: number;
  private defaultWindow: number; // in milliseconds

  constructor(defaultLimit: number = 1000, defaultWindow: number = 60000) {
    this.defaultLimit = defaultLimit;
    this.defaultWindow = defaultWindow;
  }

  async checkLimit(
    key: string,
    limit?: number,
    windowMs?: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now();
    const currentLimit = limit || this.defaultLimit;
    const currentWindow = windowMs || this.defaultWindow;

    let entry = this.limits.get(key);

    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + currentWindow };
      this.limits.set(key, entry);
    }

    const remaining = Math.max(0, currentLimit - entry.count);
    const allowed = entry.count < currentLimit;

    if (allowed) {
      entry.count++;
    }

    // Clean up expired entries periodically
    if (this.limits.size > 10000) {
      this.cleanup();
    }

    return { allowed, remaining, resetAt: entry.resetAt };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (entry.resetAt < now) {
        this.limits.delete(key);
      }
    }
  }

  reset(key: string): void {
    this.limits.delete(key);
  }
}

export const whatsappRateLimiter = new WhatsAppRateLimiter();

// ─── Audit Logging ───────────────────────────────────────────
export interface WhatsAppAuditLog {
  id: string;
  storeId: string;
  action: "message_sent" | "message_received" | "template_created" | 
          "account_connected" | "account_disconnected" | "webhook_received" |
          "rate_limit_exceeded" | "error_occurred";
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
}

class WhatsAppAuditLogger {
  private logs: WhatsAppAuditLog[] = [];
  private maxLogs: number = 10000;

  log(entry: Omit<WhatsAppAuditLog, "id" | "timestamp">): void {
    const log: WhatsAppAuditLog = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    this.logs.push(log);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In production, this would also send to a logging service
    console.log(`[WhatsApp Audit] ${log.action}:`, JSON.stringify(log.details));
  }

  getLogs(
    storeId?: string,
    action?: string,
    startDate?: number,
    endDate?: number
  ): WhatsAppAuditLog[] {
    let filtered = this.logs;

    if (storeId) {
      filtered = filtered.filter(l => l.storeId === storeId);
    }
    if (action) {
      filtered = filtered.filter(l => l.action === action);
    }
    if (startDate) {
      filtered = filtered.filter(l => l.timestamp >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(l => l.timestamp <= endDate);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }
}

export const whatsappAuditLogger = new WhatsAppAuditLogger();

// ─── Circuit Breaker ───────────────────────────────────────────
export class CircuitBreaker {
  private failures: Map<string, number> = new Map();
  private lastFailure: Map<string, number> = new Map();
  private state: Map<string, "closed" | "open" | "half-open"> = new Map();

  private readonly threshold: number;
  private readonly timeout: number;

  constructor(threshold: number = 5, timeout: number = 30000) {
    this.threshold = threshold;
    this.timeout = timeout;
  }

  async execute<T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const state = this.getState(key);

    if (state === "open") {
      throw new Error(`Circuit breaker open for ${key}`);
    }

    try {
      const result = await fn();
      this.recordSuccess(key);
      return result;
    } catch (error) {
      this.recordFailure(key);
      throw error;
    }
  }

  private getState(key: string): "closed" | "open" | "half-open" {
    const current = this.state.get(key) || "closed";
    const lastFailureTime = this.lastFailure.get(key);

    if (current === "open" && lastFailureTime) {
      if (Date.now() - lastFailureTime > this.timeout) {
        this.state.set(key, "half-open");
        return "half-open";
      }
    }

    return current;
  }

  private recordSuccess(key: string): void {
    this.failures.delete(key);
    this.state.set(key, "closed");
  }

  private recordFailure(key: string): void {
    const failures = (this.failures.get(key) || 0) + 1;
    this.failures.set(key, failures);
    this.lastFailure.set(key, Date.now());

    if (failures >= this.threshold) {
      this.state.set(key, "open");
    }
  }

  getStatus(key: string): "closed" | "open" | "half-open" {
    return this.getState(key);
  }

  reset(key: string): void {
    this.failures.delete(key);
    this.lastFailure.delete(key);
    this.state.delete(key);
  }
}

export const whatsappCircuitBreaker = new CircuitBreaker();

// ─── Dead Letter Queue ────────────────────────────────────────
export interface DeadLetterEntry {
  id: string;
  type: "webhook" | "message_send";
  payload: any;
  error: string;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  lastAttemptAt?: number;
}

class DeadLetterQueue {
  private queue: DeadLetterEntry[] = [];
  private readonly maxRetries: number = 3;

  add(entry: Omit<DeadLetterEntry, "id" | "retryCount" | "createdAt" | "lastAttemptAt">): void {
    const dlqEntry: DeadLetterEntry = {
      ...entry,
      id: crypto.randomUUID(),
      retryCount: 0,
      createdAt: Date.now(),
    };

    this.queue.push(dlqEntry);
    console.error(`[DLQ] Added entry:`, dlqEntry);
  }

  retry(entryId: string): boolean {
    const entry = this.queue.find(e => e.id === entryId);
    if (!entry) return false;

    entry.retryCount++;
    entry.lastAttemptAt = Date.now();

    if (entry.retryCount >= entry.maxRetries) {
      console.error(`[DLQ] Max retries exceeded for entry:`, entryId);
      return false;
    }

    return true;
  }

  getAll(): DeadLetterEntry[] {
    return this.queue;
  }

  remove(entryId: string): void {
    this.queue = this.queue.filter(e => e.id !== entryId);
  }

  getFailed(): DeadLetterEntry[] {
    return this.queue.filter(e => e.retryCount >= e.maxRetries);
  }
}

export const deadLetterQueue = new DeadLetterQueue();

// ─── WhatsApp API Client with Security ────────────────────────
import { WhatsAppClient } from "./client";

export class SecureWhatsAppClient {
  private client: WhatsAppClient;
  private accessToken: string;

  constructor(
    accessToken: string,
    phoneNumberId: string,
    businessAccountId: string
  ) {
    // Decrypt token if it's encrypted (starts with enc:)
    if (accessToken.startsWith("enc:")) {
      this.accessToken = decryptToken(accessToken.slice(4));
    } else {
      this.accessToken = accessToken;
    }

    this.client = new WhatsAppClient({
      accessToken: this.accessToken,
      phoneNumberId,
      businessAccountId,
    });
  }

  async sendMessageWithRateLimit(
    to: string,
    type: string,
    content: any
  ): Promise<any> {
    const rateLimitKey = `wa_send_${to}`;

    // Check rate limit
    const { allowed, remaining, resetAt } = await whatsappRateLimiter.checkLimit(
      rateLimitKey,
      1000, // 1000 messages
      60000 // per minute
    );

    if (!allowed) {
      whatsappAuditLogger.log({
        storeId: "unknown",
        action: "rate_limit_exceeded",
        details: { to, remaining, resetAt },
      });
      throw new Error(`Rate limit exceeded. Reset at ${new Date(resetAt).toISOString()}`);
    }

    // Execute with circuit breaker
    return whatsappCircuitBreaker.execute(`whatsapp_api`, async () => {
      try {
        let result;
        if (type === "text") {
          result = await this.client.sendTextMessage(to, content.body);
        } else if (type === "image") {
          result = await this.client.sendImageMessage(to, content.link, content.caption);
        } else if (type === "template") {
          result = await this.client.sendTemplateMessage(to, content.name, content.language, content.components);
        } else {
          throw new Error(`Unknown message type: ${type}`);
        }

        whatsappAuditLogger.log({
          storeId: "unknown",
          action: "message_sent",
          details: { to, type, result },
        });

        return result;
      } catch (error: any) {
        // Add to dead letter queue on failure
        deadLetterQueue.add({
          type: "message_send",
          payload: { to, type, content },
          error: error.message,
          maxRetries: 3,
        });

        whatsappAuditLogger.log({
          storeId: "unknown",
          action: "error_occurred",
          details: { to, type, error: error.message },
        });

        throw error;
      }
    });
  }
}