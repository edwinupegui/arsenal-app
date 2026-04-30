import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const dbPath = import.meta.env.DATABASE_URL ?? './resources.db';
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

export * from './schema';
export { sqlite };

// DB instance type for dependency injection
// Use the inferred type from drizzle() return
export type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Creates a new database instance.
 * Use this for dependency injection instead of the global `db`.
 */
export function createDb(): DbInstance {
  const path = import.meta.env.DATABASE_URL ?? './resources.db';
  const conn = new Database(path);
  return drizzle(conn, { schema });
}

// Deprecated alias - use createDb() for dependency injection
// @deprecated Use createDb() instead for testable code
export { db };