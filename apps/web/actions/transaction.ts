"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

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

export async function getUserTransactions(cursor: string | null = null, limit: number = 10): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return { success: false, error: "User not found" };

    const queryOptions: Prisma.TransactionFindManyArgs = {
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: limit + 1, // Fetch one extra to determine if there are more
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      // Skip the cursor itself so we don't return it again
      queryOptions.skip = 1;
    }

    const transactions = await db.transaction.findMany(queryOptions);

    let nextCursor = null;
    if (transactions.length > limit) {
      const nextItem = transactions.pop();
      nextCursor = transactions[transactions.length - 1].id;
    }

    return {
      success: true,
      data: {
        transactions: transactions.map(serializeTransaction),
        nextCursor,
      }
    };
  } catch (error: any) {
    console.error("Failed to fetch transactions:", error);
    return { success: false, error: "An unexpected error occurred while fetching transactions." };
  }
}
