import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { accounts } from '@/db/schema';

export const accountRouter = router({
  getUserAccounts: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkUserId, ctx.userId),
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      return await ctx.db.query.accounts.findMany({
        where: eq(accounts.userId, user.id),
        orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
      });
    }),

  createAccount: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      type: z.enum(['CURRENT', 'SAVINGS']),
      balance: z.number().default(0),
      isDefault: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.clerkUserId, ctx.userId),
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      return await ctx.db.transaction(async (tx) => {
        if (input.isDefault) {
          await tx.update(accounts)
            .set({ isDefault: false })
            .where(eq(accounts.userId, user.id));
        }

        const [newAccount] = await tx.insert(accounts)
          .values({
            name: input.name,
            type: input.type,
            balance: String(input.balance),
            isDefault: input.isDefault,
            userId: user.id,
          })
          .returning();

        return newAccount;
      });
    }),
});
