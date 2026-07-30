import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAccount } from "@/actions/dashboard";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import aj from "@/lib/arcjet";
import { mockDeep, mockReset } from "vitest-mock-extended";

// Mock clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

// Mock arcjet
vi.mock("@/lib/arcjet", () => ({
  default: {
    protect: vi.fn(),
  },
}));
vi.mock("@arcjet/next", () => ({
  request: vi.fn(),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock prisma with vitest-mock-extended
vi.mock("@/lib/prisma", () => {
  const { mockDeep } = require("vitest-mock-extended");
  return {
    db: mockDeep(),
  };
});

describe("createAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(db);
  });

  it("should create an account successfully", async () => {
    // Setup mocks
    (auth as any).mockResolvedValue({ userId: "user_123" });
    (aj.protect as any).mockResolvedValue({ isDenied: () => false });

    const mockUser = { id: "db_user_1", clerkUserId: "user_123" };
    (db.user.findUnique as any).mockResolvedValue(mockUser);
    (db.account.findMany as any).mockResolvedValue([]);
    
    (db.account.updateMany as any).mockResolvedValue({ count: 0 });
    
    const mockCreatedAccount = { 
      id: "acc_1", 
      balance: { toNumber: () => 100 },
      amount: null
    };
    (db.account.create as any).mockResolvedValue(mockCreatedAccount);

    const result = await createAccount({ 
      name: "Test Account", 
      type: "CURRENT", 
      balance: "100.00", 
      isDefault: true 
    });
    
    expect(result.success).toBe(true);
    expect(result.data.id).toBe("acc_1");
    expect(result.data.balance).toBe(100);
    
    expect(db.account.create).toHaveBeenCalled();
  });

  it("should reject when balance is invalid", async () => {
    (auth as any).mockResolvedValue({ userId: "user_123" });
    (aj.protect as any).mockResolvedValue({ isDenied: () => false });
    (db.user.findUnique as any).mockResolvedValue({ id: "db_user_1" });

    const result = await createAccount({ 
      name: "Test Account", 
      balance: "invalid_balance" 
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid balance amount");
  });

  it("should reject when unauthorized", async () => {
    (auth as any).mockResolvedValue({ userId: null });

    const result = await createAccount({ name: "Test", balance: "100" });
    
    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should handle rate limiting", async () => {
    (auth as any).mockResolvedValue({ userId: "user_123" });
    
    // Mock rate limit denied
    (aj.protect as any).mockResolvedValue({ 
      isDenied: () => true,
      reason: {
        isRateLimit: () => true,
        remaining: 0,
        reset: 60
      }
    });

    const result = await createAccount({ name: "Test", balance: "100" });
    
    expect(result.success).toBe(false);
    expect(result.error).toBe("Too many requests. Please try again later.");
  });
});
