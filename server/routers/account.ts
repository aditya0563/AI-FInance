import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { accounts, users, transactions } from '@/db/schema';

export const accountRouter = router({
  getAccountWithTransactions: protectedProcedure
    .input(z.object({ accountId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkUserId, ctx.userId),
      });

      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const account = await ctx.db.query.accounts.findFirst({
        where: (accounts, { eq, and }) => and(
          eq(accounts.id, input.accountId),
          eq(accounts.userId, user.id)
        ),
        with: {
          transactions: {
            orderBy: (transactions, { desc }) => [desc(transactions.date)],
          },
        },
      });

      if (!account) return null;

      return {
        ...account,
        balance: Number(account.balance),
        transactions: account.transactions.map((t) => ({
          ...t,
          amount: Number(t.amount),
        })),
        _count: {
          transactions: account.transactions.length,
        },
      };
    }),

  bulkDeleteTransactions: protectedProcedure
    .input(z.object({ transactionIds: z.array(z.string().uuid()) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkUserId, ctx.userId),
      });

      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      // Get transactions to calculate balance changes
      const txs = await ctx.db.query.transactions.findMany({
        where: (transactions, { inArray, and, eq }) => and(
          inArray(transactions.id, input.transactionIds),
          eq(transactions.userId, user.id)
        ),
      });

      const accountBalanceChanges = txs.reduce((acc, transaction) => {
        const change = transaction.type === 'EXPENSE'
          ? Number(transaction.amount)
          : -Number(transaction.amount);
        
        acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
        return acc;
      }, {} as Record<string, number>);

      await ctx.db.transaction(async (tx) => {
        await tx.delete(transactions)
          .where(
            and(
              inArray(transactions.id, input.transactionIds),
              eq(transactions.userId, user.id)
            )
          );

        for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
          await tx.update(accounts)
            .set({
              balance: sql`${accounts.balance} + ${balanceChange}`
            })
            .where(eq(accounts.id, accountId));
        }
      });

      return { success: true };
    }),

  updateDefaultAccount: protectedProcedure
    .input(z.object({ accountId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkUserId, ctx.userId),
      });

      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      await ctx.db.transaction(async (tx) => {
        await tx.update(accounts)
          .set({ isDefault: false })
          .where(and(eq(accounts.userId, user.id), eq(accounts.isDefault, true)));

        await tx.update(accounts)
          .set({ isDefault: true })
          .where(and(eq(accounts.id, input.accountId), eq(accounts.userId, user.id)));
      });

      const updatedAccount = await ctx.db.query.accounts.findFirst({
        where: (accounts, { eq }) => eq(accounts.id, input.accountId)
      });

      return { 
        success: true, 
        data: updatedAccount ? { ...updatedAccount, balance: Number(updatedAccount.balance) } : null 
      };
    }),
});
