import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

function calculateNextRecurringDate(startDate: Date, interval: string) {
  const date = new Date(startDate);
  switch (interval) {
    case 'DAILY': date.setDate(date.getDate() + 1); break;
    case 'WEEKLY': date.setDate(date.getDate() + 7); break;
    case 'MONTHLY': date.setMonth(date.getMonth() + 1); break;
    case 'YEARLY': date.setFullYear(date.getFullYear() + 1); break;
  }
  return date;
}

export const transactionRouter = router({
  getTransactions: protectedProcedure
    .input(z.object({
      accountId: z.string().uuid().optional(),
      type: z.enum(['INCOME', 'EXPENSE']).optional()
    }).optional())
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const transactions = await ctx.db.transaction.findMany({
        where: {
          userId: user.id,
          ...(input?.accountId ? { accountId: input.accountId } : {}),
          ...(input?.type ? { type: input.type } : {}),
        },
        include: { account: true },
        orderBy: { date: 'desc' },
      });

      return transactions.map((tx: any) => ({
        ...tx,
        amount: tx.amount.toNumber(),
      }));
    }),
    
  getTransaction: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const transaction = await ctx.db.transaction.findUnique({
        where: { id: input.id, userId: user.id },
      });

      if (!transaction) throw new TRPCError({ code: 'NOT_FOUND', message: 'Transaction not found' });

      return { ...transaction, amount: transaction.amount.toNumber() };
    }),

  createTransaction: protectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      type: z.enum(['INCOME', 'EXPENSE']),
      amount: z.number().positive(),
      description: z.string().optional(),
      date: z.date(),
      category: z.string(),
      receiptUrl: z.string().url().optional(),
      isRecurring: z.boolean().default(false),
      recurringInterval: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const account = await ctx.db.account.findUnique({
        where: {
          id: input.accountId,
          userId: user.id,
        },
      });

      if (!account) throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized account access' });

      const balanceChange = input.type === 'EXPENSE' ? -input.amount : input.amount;

      return await ctx.db.$transaction(async (tx) => {
        const newTransaction = await tx.transaction.create({
          data: {
            ...input,
            userId: user.id,
            nextRecurringDate: input.isRecurring && input.recurringInterval
              ? calculateNextRecurringDate(input.date, input.recurringInterval)
              : null,
          },
        });

        await tx.account.update({
          where: { id: input.accountId },
          data: { balance: { increment: balanceChange } },
        });

        return { ...newTransaction, amount: newTransaction.amount.toNumber() };
      });
    }),

  updateTransaction: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: z.object({
        accountId: z.string().uuid(),
        type: z.enum(['INCOME', 'EXPENSE']),
        amount: z.number().positive(),
        description: z.string().optional(),
        date: z.date(),
        category: z.string(),
        isRecurring: z.boolean().optional(),
        recurringInterval: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
      })
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const originalTransaction = await ctx.db.transaction.findUnique({
        where: { id: input.id, userId: user.id },
      });

      if (!originalTransaction) throw new TRPCError({ code: 'NOT_FOUND', message: 'Transaction not found' });

      const oldBalanceChange = originalTransaction.type === 'EXPENSE'
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

      const newBalanceChange = input.data.type === 'EXPENSE' ? -input.data.amount : input.data.amount;
      const netBalanceChange = newBalanceChange - oldBalanceChange;

      return await ctx.db.$transaction(async (tx) => {
        const updatedTransaction = await tx.transaction.update({
          where: { id: input.id, userId: user.id },
          data: {
            ...input.data,
            nextRecurringDate: input.data.isRecurring && input.data.recurringInterval
              ? calculateNextRecurringDate(input.data.date, input.data.recurringInterval)
              : null,
          },
        });

        await tx.account.update({
          where: { id: input.data.accountId },
          data: { balance: { increment: netBalanceChange } },
        });

        return { ...updatedTransaction, amount: updatedTransaction.amount.toNumber() };
      });
    }),

  bulkDeleteTransactions: protectedProcedure
    .input(z.object({ transactionIds: z.array(z.string().uuid()) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const transactions = await ctx.db.transaction.findMany({
        where: {
          id: { in: input.transactionIds },
          userId: user.id,
        },
      });

      const accountBalanceChanges = transactions.reduce((acc: Record<string, number>, transaction: any) => {
        const change = transaction.type === 'EXPENSE' ? transaction.amount.toNumber() : -transaction.amount.toNumber();
        acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
        return acc;
      }, {});

      await ctx.db.$transaction(async (tx) => {
        await tx.transaction.deleteMany({
          where: { id: { in: input.transactionIds }, userId: user.id },
        });

        for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
          await tx.account.update({
            where: { id: accountId },
            data: { balance: { increment: balanceChange } },
          });
        }
      });

      return { success: true };
    }),
});
