import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Load variables from .env.local natively for the drizzle-kit CLI
config({ path: '.env.local' });

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres?schema=public',
  },
  verbose: true,
  strict: true,
});
