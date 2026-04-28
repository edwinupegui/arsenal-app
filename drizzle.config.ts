import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL ??
  (process.env.NODE_ENV === 'production' ? '/app/data/resources.db' : './resources.db');

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: databaseUrl,
  },
});