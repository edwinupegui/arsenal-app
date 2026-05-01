import type { DbInstance } from './db/index';
import type { Session } from './lib/session';

declare global {
  namespace App {
    interface Locals {
      db: DbInstance;
      session: Session | null;
    }
  }
}
