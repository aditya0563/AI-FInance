import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { budgets } from '@/db/schema';

export const budgetRouter = router({
  getBudget: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkUserId, ctx.userId),
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      return await ctx.db.query.budgets.findFirst({
        where: eq(budgets.userId, user.id),
      });
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

      return budget;
    }),
});
