import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { eq, and } from 'drizzle-orm';
import { budgets, transactions } from '@/db/schema';

export const budgetRouter = router({
  getCurrentBudget: protectedProcedure
    .input(z.object({ accountId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkUserId, ctx.userId),
      });

      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const budget = await ctx.db.query.budgets.findFirst({
        where: (budgets, { eq }) => eq(budgets.userId, user.id),
      });

      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const expenses = await ctx.db.query.transactions.findMany({
        where: (transactions, { eq, and, gte, lte }) => and(
          eq(transactions.userId, user.id),
          eq(transactions.type, 'EXPENSE'),
          eq(transactions.accountId, input.accountId),
          gte(transactions.date, startOfMonth),
          lte(transactions.date, endOfMonth)
        ),
      });

      const currentExpenses = expenses.reduce((sum, tx) => sum + Number(tx.amount), 0);

      return {
        budget: budget ? { ...budget, amount: Number(budget.amount) } : null,
        currentExpenses,
      };
    }),

  updateBudget: protectedProcedure
    .input(z.object({ amount: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkUserId, ctx.userId),
      });

      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const [budget] = await ctx.db
        .insert(budgets)
        .values({
          userId: user.id,
          amount: String(input.amount),
        })
        .onConflictDoUpdate({
          target: budgets.userId,
          set: { amount: String(input.amount) },
        })
        .returning();

      return {
        success: true,
        data: { ...budget, amount: Number(budget.amount) },
      };
    }),
});
