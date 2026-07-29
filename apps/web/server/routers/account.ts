import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const accountRouter = router({
  getUserAccounts: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      return await ctx.db.account.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
    }),

  getAccountWithTransactions: protectedProcedure
    .input(z.object({ accountId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      const account = await ctx.db.account.findUnique({
        where: {
          id: input.accountId,
          userId: user.id,
        },
        include: {
          transactions: {
            orderBy: { date: 'desc' },
          },
          _count: {
            select: { transactions: true },
          },
        },
      });

      if (!account) return null;

      return {
        ...account,
        balance: account.balance.toNumber(),
        transactions: account.transactions.map((tx: any) => ({
          ...tx,
          amount: tx.amount.toNumber(),
        })),
      };
    }),

  createAccount: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      type: z.enum(['CURRENT', 'SAVINGS']),
      balance: z.number().default(0),
      isDefault: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      return await ctx.db.$transaction(async (tx) => {
        if (input.isDefault) {
          await tx.account.updateMany({
            where: { userId: user.id },
            data: { isDefault: false },
          });
        }

        return await tx.account.create({
          data: {
            name: input.name,
            type: input.type,
            balance: input.balance,
            isDefault: input.isDefault,
            userId: user.id,
          },
        });
      });
    }),

  updateDefaultAccount: protectedProcedure
    .input(z.object({ accountId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });

      await ctx.db.$transaction([
        ctx.db.account.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        }),
        ctx.db.account.update({
          where: { id: input.accountId, userId: user.id },
          data: { isDefault: true },
        }),
      ]);

      const updatedAccount = await ctx.db.account.findUnique({
        where: { id: input.accountId },
      });

      return {
        ...updatedAccount,
        balance: updatedAccount?.balance?.toNumber(),
      };
    }),
});
