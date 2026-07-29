import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { eq, and, sql } from 'drizzle-orm';
import { transactions, accounts } from '@/db/schema';
import { GoogleGenerativeAI } from '@google/generative-ai';
import aj from '@/lib/arcjet';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const calculateNextRecurringDate = (startDate: Date, interval: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY') => {
  const date = new Date(startDate);
  switch (interval) {
    case 'DAILY': date.setDate(date.getDate() + 1); break;
    case 'WEEKLY': date.setDate(date.getDate() + 7); break;
    case 'MONTHLY': date.setMonth(date.getMonth() + 1); break;
    case 'YEARLY': date.setFullYear(date.getFullYear() + 1); break;
  }
  return date;
};

export const transactionRouter = router({
  createTransaction: protectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      type: z.enum(['INCOME', 'EXPENSE']),
      amount: z.number().positive(),
      description: z.string().optional(),
      date: z.date(),
      category: z.string(),
      receiptUrl: z.string().optional(),
      isRecurring: z.boolean().default(false),
      recurringInterval: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Mocking request for ArcJet in tRPC context
      // Note: In production you would pass req from createTRPCContext
      const req = new Request('http://localhost'); // Dummy request if actual isn't available
      
      // Check rate limit
      const decision = await aj.protect(req as any, {
        userId: ctx.userId,
        requested: 1,
      });

      if (decision.isDenied()) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many requests. Please try again later.',
        });
      }

      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkUserId, ctx.userId),
      });

      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const account = await ctx.db.query.accounts.findFirst({
        where: (accounts, { eq, and }) => and(eq(accounts.id, input.accountId), eq(accounts.userId, user.id)),
      });

      if (!account) throw new TRPCError({ code: 'NOT_FOUND', message: 'Account not found' });

      const balanceChange = input.type === 'EXPENSE' ? -input.amount : input.amount;
      const nextRecurringDate = input.isRecurring && input.recurringInterval
        ? calculateNextRecurringDate(input.date, input.recurringInterval)
        : undefined;

      const [newTransaction] = await ctx.db.transaction(async (tx) => {
        const [insertedTx] = await tx.insert(transactions).values({
          ...input,
          amount: String(input.amount),
          userId: user.id,
          nextRecurringDate,
        }).returning();

        await tx.update(accounts)
          .set({ balance: sql`${accounts.balance} + ${balanceChange}` })
          .where(eq(accounts.id, input.accountId));

        return [insertedTx];
      });

      return { success: true, data: { ...newTransaction, amount: Number(newTransaction.amount) } };
    }),

  getTransaction: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkUserId, ctx.userId),
      });

      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const transaction = await ctx.db.query.transactions.findFirst({
        where: (transactions, { eq, and }) => and(
          eq(transactions.id, input.id),
          eq(transactions.userId, user.id)
        ),
      });

      if (!transaction) throw new TRPCError({ code: 'NOT_FOUND', message: 'Transaction not found' });

      return { ...transaction, amount: Number(transaction.amount) };
    }),

  getUserTransactions: protectedProcedure
    .input(z.object({
      accountId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkUserId, ctx.userId),
      });

      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const txs = await ctx.db.query.transactions.findMany({
        where: (transactions, { eq, and }) => {
          if (input?.accountId) {
            return and(eq(transactions.userId, user.id), eq(transactions.accountId, input.accountId));
          }
          return eq(transactions.userId, user.id);
        },
        with: {
          account: true,
        },
        orderBy: (transactions, { desc }) => [desc(transactions.date)],
      });

      return {
        success: true,
        data: txs.map(tx => ({ ...tx, amount: Number(tx.amount) })),
      };
    }),

  scanReceipt: protectedProcedure
    .input(z.object({
      base64Image: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ input }) => {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
      `;

      const result = await model.generateContent([
        { inlineData: { data: input.base64Image, mimeType: input.mimeType } },
        prompt,
      ]);

      const text = result.response.text();
      const cleanedText = text.replace(/```(?:json)?\n?/g, '').trim();

      try {
        const data = JSON.parse(cleanedText);
        return {
          amount: parseFloat(data.amount),
          date: new Date(data.date),
          description: data.description,
          category: data.category,
          merchantName: data.merchantName,
        };
      } catch (e) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to parse receipt' });
      }
    }),
});
