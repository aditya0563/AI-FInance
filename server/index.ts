import { router } from './trpc';
import { accountRouter } from './routers/account';
import { budgetRouter } from './routers/budget';
import { transactionRouter } from './routers/transaction';

export const appRouter = router({
  account: accountRouter,
  budget: budgetRouter,
  transaction: transactionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
