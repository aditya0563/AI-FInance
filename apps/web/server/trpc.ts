import { initTRPC, TRPCError } from '@trpc/server';
import { auth } from '@clerk/nextjs/server';
import superjson from 'superjson';
import { db } from '@/db';

export const createContext = async () => {
  const { userId } = await auth();
  return {
    userId,
    db,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  return next({
    ctx: {
      userId: ctx.userId,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }

  const user = await ctx.db.query.users.findFirst({
    where: (users, { eq }) => eq(users.clerkUserId, ctx.userId),
  });

  if (!user || user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }

  return next({
    ctx: {
      userId: ctx.userId,
    },
  });
});

export const adminProcedure = t.procedure.use(isAdmin);
