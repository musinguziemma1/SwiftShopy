import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockMutation, mockQuery, mockDb } = vi.hoisted(() => ({
  mockMutation: vi.fn(),
  mockQuery: vi.fn(),
  mockDb: {
    insert: vi.fn(),
    query: vi.fn(),
    patch: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  }
}));

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
vi.mock("../../convex/_generated/server", () => ({
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

// Capture Handlers
let submitKYCHandler: any;
let approveKYCHandler: any;
let rejectKYCHandler: any;
let checkKYCVerifiedHandler: any;

vi.mock("../../convex/kyc", async () => {
  const actual = await vi.importActual("../../convex/kyc");

  mockMutation.mockImplementation((config: any) => {
    if (config.handler) {
      if (config.handler.name === "") {
        // we can capture by looking at the exported function names instead of anonymous,
        // or just mock the module differently.
      }
    }
    return config;
  });

  return { ...actual };
});

import { submitKYC, approveKYC, rejectKYC, checkKYCVerified } from "../../convex/kyc";

describe("KYC Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("checkKYCVerified", () => {
    it("should return false if user not found", async () => {
      mockDb.get.mockResolvedValueOnce(null);

      const result = await (checkKYCVerified as any).handler(
        { db: mockDb },
        { userId: "invalidUser" }
      );

      expect(result).toEqual({
        verified: false,
        status: "unverified",
        message: "User not found",
      });
    });

    it("should return verified status", async () => {
      mockDb.get.mockResolvedValueOnce({
        _id: "user1",
        kycStatus: "verified",
        kycTier: "enterprise"
      });

      const result = await (checkKYCVerified as any).handler(
        { db: mockDb },
        { userId: "user1" }
      );

      expect(result).toEqual({
        verified: true,
        status: "verified",
        tier: "enterprise",
        message: "KYC verification complete",
      });
    });
  });

  describe("submitKYC", () => {
    it("should correctly handle valid submission and insert into db", async () => {
      // Setup minimal correct returns for risk score not to fail
      mockDb.get.mockResolvedValueOnce({ 
        _id: "user1", 
        phone: "1234567890" 
      });

      // No existing KYC
      const mockQueryResult = {
        withIndex: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValueOnce(null),
      };

      // We chain queries
      mockDb.query.mockReturnValue(mockQueryResult);
      
      // We will just mock query behavior as return null for all the check blocks (duplicate, store, blacklist)
      vi.spyOn(mockDb, "query").mockImplementation(() => ({
        withIndex: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(null),
      } as any));

      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(1234567890);

      mockDb.insert.mockResolvedValueOnce("kyc_id_1");

      const result = await (submitKYC as any).handler(
        { db: mockDb },
        {
          userId: "user1",
          fullName: "John Doe",
          dateOfBirth: "1990-01-01",
          idType: "national_id",
          idNumber: "CM12345678ABCD",
          documentUrl: "http://doc",
          selfieUrl: "http://selfie",
          businessName: "JD Store",
          phoneNumber: "1234567890",
          faceMatchScore: 0.95,
          livenessScore: 0.90
        }
      );

      expect(result.status).toBe("pending");
      
      expect(mockDb.insert).toHaveBeenCalledWith("users_kyc", expect.objectContaining({
        status: "pending",
        userId: "user1",
        fullName: "John Doe",
      }));
    });
  });

  describe("approveKYC", () => {
    it("should allow admin to approve a pending KYC", async () => {
      mockDb.get.mockResolvedValueOnce({
        _id: "kyc_id_1",
        status: "pending",
        userId: "user1",
        tier: "verified",
        fullName: "John Doe",
        businessName: "JD Store"
      });

      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);

      const result = await (approveKYC as any).handler(
        { db: mockDb },
        {
          kycId: "kyc_id_1",
          adminId: "admin1",
          adminName: "Super Admin"
        }
      );

      expect(result.success).toBe(true);

      // check if it patched the KYC status
      expect(mockDb.patch).toHaveBeenCalledWith("kyc_id_1", {
        status: "verified",
        reviewedAt: now,
        reviewedBy: "admin1",
      });

      // check if it patched user
      expect(mockDb.patch).toHaveBeenCalledWith("user1", {
        kycStatus: "verified",
        kycTier: "verified",
      });
    });
  });

  describe("rejectKYC", () => {
    it("should allow admin to reject a pending KYC with reason", async () => {
      mockDb.get.mockResolvedValueOnce({
        _id: "kyc_id_1",
        status: "pending",
        userId: "user1",
        tier: "verified",
        fullName: "John Doe",
        businessName: "JD Store"
      });

      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);

      const result = await (rejectKYC as any).handler(
        { db: mockDb },
        {
          kycId: "kyc_id_1",
          adminId: "admin1",
          adminName: "Super Admin",
          reason: "Blurry document photo"
        }
      );

      expect(result.success).toBe(true);

      // check if it patched the KYC status
      expect(mockDb.patch).toHaveBeenCalledWith("kyc_id_1", {
        status: "rejected",
        reviewedAt: now,
        reviewedBy: "admin1",
        rejectionReason: "Blurry document photo"
      });

      // check if it patched user
      expect(mockDb.patch).toHaveBeenCalledWith("user1", {
        kycStatus: "rejected",
      });
    });
  });
});
