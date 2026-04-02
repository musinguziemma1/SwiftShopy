import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { sha256 } from "js-sha256";

// Mock the convex module
const mockMutation = vi.fn();
const mockQuery = vi.fn();
const mockDb = {
  insert: vi.fn(),
  query: vi.fn(),
  delete: vi.fn(),
};

// Mock convex/values
vi.mock("convex/values", () => ({
  v: {
    object: (schema: any) => schema,
    string: () => ({}),
    number: () => ({}),
    optional: (schema: any) => schema,
    union: (...schemas: any[]) => schemas[0],
    literal: (value: any) => ({ _literal: value }),
    id: (table: string) => ({ _id: table }),
    array: (schema: any) => [],
  },
}));

// Mock convex/_generated/server
vi.mock("../convex/_generated/server", () => ({
  mutation: (config: any) => {
    mockMutation(config);
    return {
      ...config,
      handler: config.handler,
    };
  },
  query: (config: any) => {
    mockQuery(config);
    return {
      ...config,
      handler: config.handler,
    };
  },
}));

// Mock the tokenization module
let createPaymentTokenHandler: any;
let validatePaymentTokenHandler: any;
let getPaymentTokenInfoHandler: any;
let cleanupExpiredTokensHandler: any;
let logTokenUsageHandler: any;
let getTokenAuditLogsHandler: any;

vi.mock("../../convex/tokenization", async () => {
  const actual = await vi.importActual("../../convex/tokenization");
  
  // Capture handlers when they're registered
  mockMutation.mockImplementation((config: any) => {
    if (config.handler) {
      if (config.handler.name === "createPaymentToken") {
        createPaymentTokenHandler = config.handler;
      } else if (config.handler.name === "cleanupExpiredTokens") {
        cleanupExpiredTokensHandler = config.handler;
      } else if (config.handler.name === "logTokenUsage") {
        logTokenUsageHandler = config.handler;
      }
      return { ...config };
    }
    return config;
  });
  
  mockQuery.mockImplementation((config: any) => {
    if (config.handler) {
      if (config.handler.name === "validatePaymentToken") {
        validatePaymentTokenHandler = config.handler;
      } else if (config.handler.name === "getPaymentTokenInfo") {
        getPaymentTokenInfoHandler = config.handler;
      } else if (config.handler.name === "getTokenAuditLogs") {
        getTokenAuditLogsHandler = config.handler;
      }
      return { ...config };
    }
    return config;
  });
  
  // Return the actual module with mocked functions
  return {
    ...actual,
    createPaymentToken: createPaymentTokenHandler,
    validatePaymentToken: validatePaymentTokenHandler,
    getPaymentTokenInfo: getPaymentTokenInfoHandler,
    cleanupExpiredTokens: cleanupExpiredTokensHandler,
    logTokenUsage: logTokenUsageHandler,
    getTokenAuditLogs: getTokenAuditLogsHandler,
  };
});

import {
  createPaymentToken,
  validatePaymentToken,
  getPaymentTokenInfo,
  cleanupExpiredTokens,
  logTokenUsage,
  getTokenAuditLogs,
} from "../../convex/tokenization";

describe("Tokenization Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use a fixed UUID for predictable testing
    vi.spyOn(uuidv4, "default").mockReturnValue("test-token-uuid");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createPaymentToken", () => {
    it("should create a token with correct data", async () => {
      const paymentData = { cardNumber: "4111111111111111", cvv: "123" };
      const mockTokenRecord = {
        _id: "token123",
        token: "test-token-uuid",
        hashedData: sha256(JSON.stringify(paymentData)),
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000,
      };

      mockDb.insert.mockResolvedValueOnce(mockTokenRecord);

      const result = await createPaymentToken(
        { db: mockDb },
        { paymentData, expiresInMinutes: 30 }
      );

      expect(result).toEqual({
        token: "test-token-uuid",
        expiresAt: expect.any(String),
        createdAt: expect.any(Number),
      });

      // Verify insert was called with correct data
      expect(mockDb.insert).toHaveBeenCalledWith("payment_tokens", {
        token: "test-token-uuid",
        hashedData: sha256(JSON.stringify(paymentData)),
        createdAt: expect.any(Number),
        expiresAt: expect.any(Number),
      });
    });

    it("should use default expiration time when not provided", async () => {
      const paymentData = { cardNumber: "4111111111111111" };
      const mockTokenRecord = {
        _id: "token123",
        token: "test-token-uuid",
        hashedData: sha256(JSON.stringify(paymentData)),
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000,
      };

      mockDb.insert.mockResolvedValueOnce(mockTokenRecord);

      await createPaymentToken(
        { db: mockDb },
        { paymentData }
      );

      // Verify insert was called with default expiration (30 minutes)
      expect(mockDb.insert).toHaveBeenCalledWith("payment_tokens", expect.objectContaining({
        expiresAt: expect.any(Number),
      }));
    });
  });

  describe("validatePaymentToken", () => {
    it("should return true for valid token and data", async () => {
      const paymentData = { cardNumber: "4111111111111111" };
      const token = "test-token";
      const now = Date.now();
      const mockTokenRecord = {
        _id: "token123",
        token,
        hashedData: sha256(JSON.stringify(paymentData)),
        createdAt: now - 1000, // 1 second ago
        expiresAt: now + 30 * 60 * 1000, // 30 minutes in future
      };

      const mockQueryResult = {
        filter: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValueOnce(mockTokenRecord),
      };
      mockDb.query.mockReturnValue(mockQueryResult);

      const result = await validatePaymentToken(
        { db: mockDb },
        { token, paymentData }
      );

      expect(result).toBe(true);
    });

    it("should return false for non-existent token", async () => {
      const mockQueryResult = {
        filter: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValueOnce(null),
      };
      mockDb.query.mockReturnValue(mockQueryResult);

      const result = await validatePaymentToken(
        { db: mockDb },
        { token: "invalid-token", paymentData: {} }
      );

      expect(result).toBe(false);
    });

    it("should return false for expired token", async () => {
      const paymentData = { cardNumber: "4111111111111111" };
      const token = "test-token";
      const now = Date.now();
      const mockTokenRecord = {
        _id: "token123",
        token,
        hashedData: sha256(JSON.stringify(paymentData)),
        createdAt: now - 31 * 60 * 1000, // 31 minutes ago
        expiresAt: now - 60 * 1000, // 1 minute ago (expired)
      };

      const mockQueryResult = {
        filter: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValueOnce(mockTokenRecord),
      };
      mockDb.query.mockReturnValue(mockQueryResult);

      const result = await validatePaymentToken(
        { db: mockDb },
        { token, paymentData }
      );

      expect(result).toBe(false);
    });

    it("should return false for mismatched data", async () => {
      const paymentData = { cardNumber: "4111111111111111" };
      const wrongData = { cardNumber: "4222222222222222" };
      const token = "test-token";
      const now = Date.now();
      const mockTokenRecord = {
        _id: "token123",
        token,
        hashedData: sha256(JSON.stringify(paymentData)), // hash of correct data
        createdAt: now - 1000,
        expiresAt: now + 30 * 60 * 1000,
      };

      const mockQueryResult = {
        filter: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValueOnce(mockTokenRecord),
      };
      mockDb.query.mockReturnValue(mockQueryResult);

      const result = await validatePaymentToken(
        { db: mockDb },
        { token, paymentData: wrongData }
      );

      expect(result).toBe(false);
    });
  });

  describe("getPaymentTokenInfo", () => {
    it("should return token info for valid token", async () => {
      const token = "test-token";
      const now = Date.now();
      const mockTokenRecord = {
        _id: "token123",
        token,
        hashedData: "some-hash",
        createdAt: now - 1000,
        expiresAt: now + 30 * 60 * 1000,
      };

      const mockQueryResult = {
        filter: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValueOnce(mockTokenRecord),
      };
      mockDb.query.mockReturnValue(mockQueryResult);

      const result = await getPaymentTokenInfo(
        { db: mockDb },
        { token }
      );

      expect(result).toEqual({
        token: "test-token",
        createdAt: expect.any(Number),
        expiresAt: expect.any(Number),
        isExpired: false,
      });
    });

    it("should return null for non-existent token", async () => {
      const mockQueryResult = {
        filter: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValueOnce(null),
      };
      mockDb.query.mockReturnValue(mockQueryResult);

      const result = await getPaymentTokenInfo(
        { db: mockDb },
        { token: "invalid-token" }
      );

      expect(result).toBeNull();
    });

    it("should mark expired tokens as expired", async () => {
      const token = "test-token";
      const now = Date.now();
      const mockTokenRecord = {
        _id: "token123",
        token,
        hashedData: "some-hash",
        createdAt: now - 31 * 60 * 1000,
        expiresAt: now - 60 * 1000, // Expired
      };

      const mockQueryResult = {
        filter: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValueOnce(mockTokenRecord),
      };
      mockDb.query.mockReturnValue(mockQueryResult);

      const result = await getPaymentTokenInfo(
        { db: mockDb },
        { token }
      );

      expect(result).toEqual({
        token: "test-token",
        createdAt: expect.any(Number),
        expiresAt: expect.any(Number),
        isExpired: true,
      });
    });
  });

  describe("cleanupExpiredTokens", () => {
    it("should delete expired tokens and return count", async () => {
      const now = Date.now();
      const expiredTokens = [
        { _id: "token1", token: "expired1", expiresAt: now - 1000 },
        { _id: "token2", token: "expired2", expiresAt: now - 2000 },
      ];
      const activeTokens = [
        { _id: "token3", token: "active1", expiresAt: now + 1000 },
      ];

      const mockQueryResult = {
        filter: vi.fn().mockReturnThis(),
        collect: vi.fn().mockResolvedValueOnce(expiredTokens),
      };
      mockDb.query.mockReturnValue(mockQueryResult);

      const result = await cleanupExpiredTokens({ db: mockDb });

      expect(result).toBe(2);
      expect(mockDb.delete).toHaveBeenCalledTimes(2);
      expect(mockDb.delete).toHaveBeenCalledWith("token1");
      expect(mockDb.delete).toHaveBeenCalledWith("token2");
    });

    it("should return 0 when no expired tokens", async () => {
      const now = Date.now();
      const activeTokens = [
        { _id: "token1", token: "active1", expiresAt: now + 1000 },
      ];

      const mockQueryResult = {
        filter: vi.fn().mockReturnThis(),
        collect: vi.fn().mockResolvedValueOnce([]),
      };
      mockDb.query.mockReturnValue(mockQueryResult);

      const result = await cleanupExpiredTokens({ db: mockDb });

      expect(result).toBe(0);
      expect(mockDb.delete).not.toHaveBeenCalled();
    });
  });

  describe("logTokenUsage", () => {
    it("should log token usage correctly", async () => {
      const mockLogRecord = {
        _id: "log123",
        tokenId: "token123",
        action: "create",
        userId: "user123",
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
        metadata: { test: true },
        createdAt: Date.now(),
      };

      mockDb.insert.mockResolvedValueOnce(mockLogRecord);

      const result = await logTokenUsage(
        { db: mockDb },
        {
          tokenId: "token123",
          action: "create",
          userId: "user123",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          metadata: { test: true },
        }
      );

      expect(result).toBe("log123");
      expect(mockDb.insert).toHaveBeenCalledWith("token_audit_log", {
        tokenId: "token123",
        action: "create",
        userId: "user123",
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
        metadata: { test: true },
        createdAt: expect.any(Number),
      });
    });
  });

  describe("getTokenAuditLogs", () => {
    it("should return audit logs for token", async () => {
      const mockLogs = [
        {
          _id: "log1",
          tokenId: "token123",
          action: "create",
          userId: "user123",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          metadata: { test: true },
          createdAt: Date.now() - 1000,
        },
        {
          _id: "log2",
          tokenId: "token123",
          action: "validate",
          userId: "user123",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          metadata: { test: false },
          createdAt: Date.now(),
        },
      ];

      const mockQueryResult = {
        filter: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValueOnce(mockLogs),
      };
      mockDb.query.mockReturnValue(mockQueryResult);

      const result = await getTokenAuditLogs(
        { db: mockDb },
        { tokenId: "token123", limit: 10 }
      );

      expect(result).toEqual(mockLogs);
      expect(mockDb.query().filter().order().limit()).toHaveBeenCalledWith(
        "token_audit_log"
      );
    });

    it("should return all audit logs when no tokenId specified", async () => {
      const mockLogs = [
        {
          _id: "log1",
          tokenId: "token123",
          action: "create",
          userId: "user123",
          ipAddress: "127.0.0.1",
          userAgent: "test-agent",
          metadata: {},
          createdAt: Date.now(),
        },
      ];

      const mockQueryResult = {
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValueOnce(mockLogs),
      };
      mockDb.query.mockReturnValue(mockQueryResult);

      const result = await getTokenAuditLogs(
        { db: mockDb },
        { limit: 5 }
      );

      expect(result).toEqual(mockLogs);
      expect(mockDb.query().order().limit()).toHaveBeenCalledWith(
        "token_audit_log"
      );
    });
  });
});