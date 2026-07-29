import { pgTable, text, timestamp, boolean, uuid, numeric, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const transactionTypeEnum = pgEnum('transaction_type', ['INCOME', 'EXPENSE']);
export const accountTypeEnum = pgEnum('account_type', ['CURRENT', 'SAVINGS']);
export const transactionStatusEnum = pgEnum('transaction_status', ['PENDING', 'COMPLETED', 'FAILED']);
export const recurringIntervalEnum = pgEnum('recurring_interval', ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkUserId: text('clerkUserId').unique().notNull(),
  email: text('email').unique().notNull(),
  name: text('name'),
  role: text('role').default('user').notNull(),
  imageUrl: text('imageUrl'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  transactions: many(transactions),
  budgets: many(budgets),
}));

// Accounts Table
export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: accountTypeEnum('type').notNull(),
  balance: numeric('balance', { precision: 12, scale: 2 }).default('0').notNull(),
  isDefault: boolean('isDefault').default(false).notNull(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index('accounts_userId_idx').on(table.userId),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

// Transactions Table
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: transactionTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description'),
  date: timestamp('date', { mode: 'date' }).notNull(),
  category: text('category').notNull(),
  receiptUrl: text('receiptUrl'),
  isRecurring: boolean('isRecurring').default(false).notNull(),
  recurringInterval: recurringIntervalEnum('recurringInterval'),
  nextRecurringDate: timestamp('nextRecurringDate', { mode: 'date' }),
  lastProcessed: timestamp('lastProcessed', { mode: 'date' }),
  status: transactionStatusEnum('status').default('COMPLETED').notNull(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: uuid('accountId').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index('transactions_userId_idx').on(table.userId),
  accountIdIdx: index('transactions_accountId_idx').on(table.accountId),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
}));

// Budgets Table
export const budgets = pgTable('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  lastAlertSent: timestamp('lastAlertSent', { mode: 'date' }),
  userId: uuid('userId').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => ({
  userIdIdx: index('budgets_userId_idx').on(table.userId),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
}));

// Infer Types
export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type SelectAccount = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

export type SelectTransaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export type SelectBudget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;
