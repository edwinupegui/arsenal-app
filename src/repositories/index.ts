import { eq, and, like, isNull, isNotNull, or, asc } from 'drizzle-orm';
import { db } from '../db/index';
import { resources, categories, type Resource, type NewResource, type Category } from '../db/schema';
import { ok, err, notFoundError, duplicateError, databaseError } from '../lib/result';
import type { Result, AppError } from '../lib/result';

export type ResourceFilters = {
  q?: string;
  categoryId?: number;
  language?: string;
  type?: string;
};

export class ResourceRepository {
  findAll(filters?: ResourceFilters): Result<Resource[], AppError> {
    try {
      const conditions = [isNull(resources.deletedAt)];

      if (filters?.q) {
        conditions.push(
          or(
            like(resources.title, `%${filters.q}%`),
            like(resources.description, `%${filters.q}%`)
          )!
        );
      }
      if (filters?.categoryId) {
        conditions.push(eq(resources.categoryId, filters.categoryId));
      }
      if (filters?.language) {
        conditions.push(eq(resources.language, filters.language));
      }
      if (filters?.type) {
        conditions.push(eq(resources.type, filters.type));
      }

      const result = db
        .select()
        .from(resources)
        .where(and(...conditions))
        .orderBy(asc(resources.title))
        .all() as Resource[];

      return ok(result);
    } catch (e) {
      return err(databaseError(`Failed to fetch resources: ${e}`));
    }
  }

  findDeleted(): Result<Resource[], AppError> {
    try {
      const result = db
        .select()
        .from(resources)
        .where(isNotNull(resources.deletedAt))
        .orderBy(asc(resources.title))
        .all() as Resource[];

      return ok(result);
    } catch (e) {
      return err(databaseError(`Failed to fetch deleted resources: ${e}`));
    }
  }

  findById(id: number): Result<Resource, AppError> {
    try {
      const result = db
        .select()
        .from(resources)
        .where(eq(resources.id, id))
        .limit(1)
        .all();

      if (!result[0]) {
        return err(notFoundError('Resource', id));
      }
      return ok(result[0] as Resource);
    } catch (e) {
      return err(databaseError(`Failed to fetch resource ${id}: ${e}`));
    }
  }

  findByUrl(url: string): Result<Resource, AppError> {
    try {
      const result = db
        .select()
        .from(resources)
        .where(eq(resources.url, url))
        .limit(1)
        .all();

      if (!result[0]) {
        return err(notFoundError('Resource'));
      }
      return ok(result[0] as Resource);
    } catch (e) {
      return err(databaseError(`Failed to fetch resource by url: ${e}`));
    }
  }

  create(data: NewResource): Result<Resource, AppError> {
    try {
      const now = new Date().toISOString();
      const result = db.insert(resources).values({
        ...data,
        createdAt: now,
      }).returning().all();

      if (!result[0]) {
        return err(databaseError('Failed to create resource'));
      }
      return ok(result[0] as Resource);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('UNIQUE')) {
        return err(duplicateError('url', data.url));
      }
      return err(databaseError(`Failed to create resource: ${e}`));
    }
  }

  update(id: number, data: Partial<NewResource>): Result<Resource, AppError> {
    try {
      const existing = db
        .select()
        .from(resources)
        .where(eq(resources.id, id))
        .limit(1)
        .all();

      if (!existing[0]) {
        return err(notFoundError('Resource', id));
      }

      const result = db
        .update(resources)
        .set(data)
        .where(eq(resources.id, id))
        .returning()
        .all();

      if (!result[0]) {
        return err(databaseError('Failed to update resource'));
      }
      return ok(result[0] as Resource);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('UNIQUE')) {
        return err(duplicateError('url', data.url ?? ''));
      }
      return err(databaseError(`Failed to update resource ${id}: ${e}`));
    }
  }

  softDelete(id: number): Result<boolean, AppError> {
    try {
      const existing = db
        .select()
        .from(resources)
        .where(eq(resources.id, id))
        .limit(1)
        .all();

      if (!existing[0]) {
        return err(notFoundError('Resource', id));
      }
      if ((existing[0] as Resource).deletedAt) {
        return ok(false); // Already deleted
      }

      const now = new Date().toISOString();
      db.update(resources).set({ deletedAt: now }).where(eq(resources.id, id)).run();
      return ok(true);
    } catch (e) {
      return err(databaseError(`Failed to soft delete resource ${id}: ${e}`));
    }
  }

  restore(id: number): Result<boolean, AppError> {
    try {
      const existing = db
        .select()
        .from(resources)
        .where(eq(resources.id, id))
        .limit(1)
        .all();

      if (!existing[0]) {
        return err(notFoundError('Resource', id));
      }
      if (!(existing[0] as Resource).deletedAt) {
        return ok(false); // Not deleted
      }

      db.update(resources).set({ deletedAt: null }).where(eq(resources.id, id)).run();
      return ok(true);
    } catch (e) {
      return err(databaseError(`Failed to restore resource ${id}: ${e}`));
    }
  }

  permanentDelete(id: number): Result<boolean, AppError> {
    try {
      const existing = db
        .select()
        .from(resources)
        .where(eq(resources.id, id))
        .limit(1)
        .all();

      if (!existing[0]) {
        return err(notFoundError('Resource', id));
      }
      if (!(existing[0] as Resource).deletedAt) {
        return err(databaseError('Cannot permanently delete a non-deleted resource'));
      }

      db.delete(resources).where(eq(resources.id, id)).run();
      return ok(true);
    } catch (e) {
      return err(databaseError(`Failed to permanently delete resource ${id}: ${e}`));
    }
  }

  search(query: string, categoryId?: number): Result<Resource[], AppError> {
    try {
      const conditions = [
        isNull(resources.deletedAt),
        or(
          like(resources.title, `%${query}%`),
          like(resources.description, `%${query}%`)
        )!
      ];

      if (categoryId) {
        conditions.push(eq(resources.categoryId, categoryId));
      }

      const result = db
        .select()
        .from(resources)
        .where(and(...conditions))
        .orderBy(asc(resources.title))
        .all() as Resource[];

      return ok(result);
    } catch (e) {
      return err(databaseError(`Failed to search resources: ${e}`));
    }
  }
}

export class CategoryRepository {
  findAll(): Result<Category[], AppError> {
    try {
      const result = db.select().from(categories).orderBy(asc(categories.id)).all() as Category[];
      return ok(result);
    } catch (e) {
      return err(databaseError(`Failed to fetch categories: ${e}`));
    }
  }

  findById(id: number): Result<Category, AppError> {
    try {
      const result = db
        .select()
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1)
        .all();

      if (!result[0]) {
        return err(notFoundError('Category', id));
      }
      return ok(result[0] as Category);
    } catch (e) {
      return err(databaseError(`Failed to fetch category ${id}: ${e}`));
    }
  }
}

// Singleton instances for convenience
export const resourceRepository = new ResourceRepository();
export const categoryRepository = new CategoryRepository();