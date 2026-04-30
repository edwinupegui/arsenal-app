import { eq, and, like, isNull, isNotNull, or, asc, desc, sql } from 'drizzle-orm';
import { db } from '../db/index';
import { resources, categories, type Resource, type NewResource, type Category } from '../db/schema';
import { ok, err, notFoundError, duplicateError, databaseError } from '../lib/result';
import type { Result, AppError } from '../lib/result';

export type SortOption = 'alpha' | 'newest' | 'oldest' | 'relevance';

export type ResourceFilters = {
  q?: string;
  categoryId?: number;
  language?: string;
  type?: string;
  tags?: string[];
  sort?: SortOption;
};

export type FindAllOptions = {
  limit?: number;
  offset?: number;
};

export class ResourceRepository {
  /**
   * Build SQL conditions from filters (shared by findAll and countResources)
   */
  private buildConditions(filters?: ResourceFilters): ReturnType<typeof and>[] {
    const conditions: ReturnType<typeof and>[] = [isNull(resources.deletedAt)];

    // Text search: use LIKE for now (simpler, works reliably)
    if (filters?.q && filters.q.trim()) {
      const searchTerm = `%${filters.q}%`;
      conditions.push(
        or(
          like(resources.title, searchTerm),
          like(resources.description, searchTerm)
        )!
      );
    }

    // Tag filtering: resources must contain ALL specified tags (AND logic)
    // Note: This assumes JSON array storage. For reliable tag filtering,
    // consider a separate junction table.
    if (filters?.tags && filters.tags.length > 0) {
      for (const tag of filters.tags) {
        conditions.push(like(resources.tags, `%"${tag}"%`));
      }
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

    return conditions;
  }

  findAll(filters?: ResourceFilters, options?: FindAllOptions): Result<Resource[], AppError> {
    try {
      const conditions = this.buildConditions(filters);

      // Build query with conditions
      let query = db
        .select()
        .from(resources)
        .where(and(...conditions));

      // Apply sorting
      const sort = filters?.sort ?? 'alpha';
      if (sort === 'newest') {
        query = query.orderBy(desc(resources.createdAt));
      } else if (sort === 'oldest') {
        query = query.orderBy(asc(resources.createdAt));
      } else if (sort === 'relevance' && filters?.q) {
        query = query.orderBy(asc(resources.title));
      } else {
        // Default: alphabetical
        query = query.orderBy(asc(resources.title));
      }

      // Apply pagination if provided
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.offset(options.offset);
      }

      const result = query.all() as Resource[];
      return ok(result);
    } catch (e) {
      return err(databaseError(`Failed to fetch resources: ${e}`));
    }
  }

  countResources(filters?: ResourceFilters): Result<number, AppError> {
    try {
      const conditions = this.buildConditions(filters);

      const result = db
        .select({ count: sql<number>`count(*)` })
        .from(resources)
        .where(and(...conditions))
        .get();

      return ok(result?.count ?? 0);
    } catch (e) {
      return err(databaseError(`Failed to count resources: ${e}`));
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

  getAllTags(): Result<{tag: string; count: number}[], AppError> {
    try {
      // Use SQLite JSON aggregation for performance - only fetches tag values, not full rows
      const result = db
        .select({ tag: sql<string>`value`, count: sql<number>`count(*)` })
        .from(resources, sql`json_each(resources.tags)`)
        .where(isNull(resources.deletedAt))
        .groupBy(sql`value`)
        .orderBy(sql`count(*) DESC`)
        .all() as { tag: string; count: number }[];

      return ok(result);
    } catch (e) {
      return err(databaseError(`Failed to fetch tags: ${e}`));
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