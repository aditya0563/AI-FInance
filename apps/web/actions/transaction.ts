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

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function scanReceipt(formData: FormData): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Mock data if no API key is provided
      return { 
        success: true, 
        data: { 
          amount: 42.50, 
          description: "Mock Receipt (No API Key)", 
          category: "Food", 
          date: new Date().toISOString() 
        } 
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `Analyze this receipt and extract the following information in JSON format:
    {
      "amount": (total amount as number),
      "description": (merchant name or brief description),
      "category": (one word category like Food, Travel, Groceries, Utilities, etc.),
      "date": (ISO date string of the receipt date)
    }
    Only return the JSON object, without markdown formatting.`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type || "image/jpeg",
        },
      },
      prompt,
    ]);

    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);

    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to scan receipt:", error);
    return { success: false, error: "Failed to process receipt image." };
  }
}
