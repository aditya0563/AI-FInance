"use server";

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj: any) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

export async function getUserAccounts(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }
    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    // Serialize accounts before sending to client
    const serializedAccounts = accounts.map(serializeTransaction);

    return { success: true, data: serializedAccounts };
  } catch (error: any) {
    console.error("getUserAccounts error:", error);
    return { success: false, error: "An unexpected error occurred while fetching user accounts." };
  }
}

export async function createAccount(data: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        return { success: false, error: "Too many requests. Please try again later." };
      }

      return { success: false, error: "Request blocked" };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Convert balance to float before saving
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      return { success: false, error: "Invalid balance amount" };
    }

    // Check if this is the user's first account
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    // If it's the first account, make it default regardless of user input
    // If not, use the user's preference
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    // If this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create new account
    const account = await db.account.create({
      data: {
        name: data.name,
        type: data.type,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault, // Override the isDefault based on our logic
      },
    });

    // Serialize the account before returning
    const serializedAccount = serializeTransaction(account);

    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
  } catch (error: any) {
    console.error("createAccount error:", error);
    return { success: false, error: "An unexpected error occurred while creating the account." };
  }
}

export async function getDashboardData(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get all user transactions
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return { success: true, data: transactions.map(serializeTransaction) };
  } catch (error: any) {
    console.error("getDashboardData error:", error);
    return { success: false, error: "An unexpected error occurred while fetching dashboard data." };
  }
}
