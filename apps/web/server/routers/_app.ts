import { router } from '../trpc';
import { accountRouter } from './account';
import { budgetRouter } from './budget';
import { transactionRouter } from './transaction';

export const appRouter = router({
  account: accountRouter,
  budget: budgetRouter,
  transaction: transactionRouter,
});

export type AppRouter = typeof appRouter;
