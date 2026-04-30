import type { DbInstance } from './db/index';

declare global {
  namespace App {
    interface Locals {
      db: DbInstance;
    }
  }
}