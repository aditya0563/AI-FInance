import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const budgetRouter = router({
  getBudget: protectedProcedure
    .input(z.object({ accountId: z.string().uuid().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const budget = await ctx.db.budget.findFirst({
        where: { userId: user.id },
      });

      let currentExpenses = 0;
      if (input?.accountId) {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const expenses = await ctx.db.transaction.aggregate({
          where: {
            userId: user.id,
            type: 'EXPENSE',
            date: { gte: startOfMonth, lte: endOfMonth },
            accountId: input.accountId,
          },
          _sum: { amount: true },
        });
        currentExpenses = expenses._sum.amount ? expenses._sum.amount.toNumber() : 0;
      }

      return {
        budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
        currentExpenses,
      };
    }),

  updateBudget: protectedProcedure
    .input(z.object({ amount: z.number().positive('Budget amount must be a positive number') }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const budget = await ctx.db.budget.upsert({
        where: { userId: user.id },
        update: { amount: input.amount },
        create: {
          userId: user.id,
          amount: input.amount,
        },
      });

      return { ...budget, amount: budget.amount.toNumber() };
    }),
});
