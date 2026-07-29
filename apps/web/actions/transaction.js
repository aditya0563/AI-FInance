"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

export async function getUserTransactions(cursor = null, limit = 10) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findFirst({
      where: { clerkUserId: userId, deletedAt: null },
    });

    if (!user) throw new Error("User not found");

    const queryOptions = {
      where: { userId: user.id, deletedAt: null },
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
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return { success: false, error: error.message };
  }
}
