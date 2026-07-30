import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTransaction, bulkDeleteTransactions } from "@/actions/transaction";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { mockDeep, mockReset } from "vitest-mock-extended";

// Mock clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
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

describe("Transaction Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(db);
  });

  describe("createTransaction", () => {
    it("should create a transaction successfully", async () => {
      (auth as any).mockResolvedValue({ userId: "user_123" });
      const mockUser = { id: "db_user_1", clerkUserId: "user_123" };
      (db.user.findUnique as any).mockResolvedValue(mockUser);
      
      const mockTransaction = {
        id: "txn_1",
        amount: { toNumber: () => 50 },
        description: "Test Transaction",
        type: "EXPENSE"
      };
      
      // Assume creating a transaction involves updating an account balance inside a transaction
      (db.$transaction as any).mockResolvedValue(mockTransaction);

      // We call the function (even if not fully implemented yet)
      const result = await createTransaction({ 
        amount: "50", 
        description: "Test",
        type: "EXPENSE",
        accountId: "acc_1"
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should reject invalid amount", async () => {
      (auth as any).mockResolvedValue({ userId: "user_123" });
      (db.user.findUnique as any).mockResolvedValue({ id: "db_user_1" });

      const result = await createTransaction({ 
        amount: "invalid", 
        description: "Test",
        accountId: "acc_1"
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid amount");
    });

    it("should require authentication", async () => {
      (auth as any).mockResolvedValue({ userId: null });
      const result = await createTransaction({ amount: "50" });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });
  });

  describe("bulkDeleteTransactions", () => {
    it("should delete multiple transactions successfully", async () => {
      (auth as any).mockResolvedValue({ userId: "user_123" });
      (db.user.findUnique as any).mockResolvedValue({ id: "db_user_1" });
      
      // Mock the deletion response
      (db.transaction.deleteMany as any).mockResolvedValue({ count: 3 });

      const result = await bulkDeleteTransactions(["txn_1", "txn_2", "txn_3"]);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("count", 3);
    });

    it("should handle error boundaries if deletion fails", async () => {
      (auth as any).mockResolvedValue({ userId: "user_123" });
      (db.user.findUnique as any).mockResolvedValue({ id: "db_user_1" });
      
      (db.transaction.deleteMany as any).mockRejectedValue(new Error("Database error"));

      const result = await bulkDeleteTransactions(["txn_1"]);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain("unexpected error");
    });

    it("should require authentication", async () => {
      (auth as any).mockResolvedValue({ userId: null });
      const result = await bulkDeleteTransactions(["txn_1"]);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });
  });
});
