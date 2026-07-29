import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { eq, and, sql } from 'drizzle-orm';
import { transactions, accounts } from '@/db/schema';

export const transactionRouter = router({
  getTransactions: protectedProcedure
    .input(z.object({ accountId: z.string().uuid().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkUserId, ctx.userId),
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      return await ctx.db.query.transactions.findMany({
        where: (txs, { eq, and }) => {
          if (input?.accountId) {
            return and(eq(txs.userId, user.id), eq(txs.accountId, input.accountId));
          }
          return eq(txs.userId, user.id);
        },
        orderBy: (txs, { desc }) => [desc(txs.date)],
      });
    }),

  createTransaction: protectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      type: z.enum(['INCOME', 'EXPENSE']),
      amount: z.number().positive(),
      description: z.string().optional(),
      date: z.date(),
      category: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkUserId, ctx.userId),
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const balanceChange = input.type === 'EXPENSE' ? -input.amount : input.amount;

      return await ctx.db.transaction(async (tx) => {
        const [newTx] = await tx.insert(transactions)
          .values({
            ...input,
            amount: String(input.amount),
            userId: user.id,
          })
          .returning();

        await tx.update(accounts)
          .set({ balance: sql`${accounts.balance} + ${balanceChange}` })
          .where(eq(accounts.id, input.accountId));

        return newTx;
      });
    }),
});
