import { resourceRepository, categoryRepository, type ResourceFilters } from '../repositories';
import type { Resource, NewResource, Category } from '../db/schema';
import { ok, type Result, type AppError } from '../lib/result';
import type { PaginatedResult } from '../lib/types';

/**
 * ResourceService - Business logic layer for resource management.
 *
 * Supports optional dependency injection for testability:
 * - Default: uses module-level singleton repositories
 * - Constructor injection: pass custom repositories for testing
 */
export class ResourceService {
  private resourceRepo: typeof resourceRepository;
  private categoryRepo: typeof categoryRepository;

  constructor(
    resourceRepo: typeof resourceRepository = resourceRepository,
    categoryRepo: typeof categoryRepository = categoryRepository
  ) {
    this.resourceRepo = resourceRepo;
    this.categoryRepo = categoryRepo;
  }

  listResources(filters?: ResourceFilters, page: number = 1, limit: number = 20): Result<PaginatedResult<Resource>, AppError> {
    // Calculate offset from page (1-indexed)
    const offset = (page - 1) * limit;

    // Get count for pagination metadata
    const countResult = this.resourceRepo.countResources(filters);
    if (!countResult.ok) {
      return countResult;
    }
    const total = countResult.value;

    // Get paginated resources
    const resourcesResult = this.resourceRepo.findAll(filters, { limit, offset });
    if (!resourcesResult.ok) {
      return resourcesResult;
    }

    const totalPages = Math.ceil(total / limit);

    return ok({
      data: resourcesResult.value,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  }

  listDeletedResources(): Result<Resource[], AppError> {
    return this.resourceRepo.findDeleted();
  }

  getResourceById(id: number): Result<Resource, AppError> {
    return this.resourceRepo.findById(id);
  }

  getResourceByUrl(url: string): Result<Resource, AppError> {
    return this.resourceRepo.findByUrl(url);
  }

  createResource(data: NewResource): Result<Resource, AppError> {
    return this.resourceRepo.create(data);
  }

  updateResource(id: number, data: Partial<NewResource>): Result<Resource, AppError> {
    return this.resourceRepo.update(id, data);
  }

  softDeleteResource(id: number): Result<boolean, AppError> {
    return this.resourceRepo.softDelete(id);
  }

  restoreResource(id: number): Result<boolean, AppError> {
    return this.resourceRepo.restore(id);
  }

  permanentDeleteResource(id: number): Result<boolean, AppError> {
    return this.resourceRepo.permanentDelete(id);
  }

  searchResources(query: string, categoryId?: number): Result<Resource[], AppError> {
    return this.resourceRepo.search(query, categoryId);
  }

  listCategories(): Result<Category[], AppError> {
    return this.categoryRepo.findAll();
  }

  getCategoryById(id: number): Result<Category | null, AppError> {
    return this.categoryRepo.findById(id);
  }

  listTags(): Result<{tag: string; count: number}[], AppError> {
    return this.resourceRepo.getAllTags();
  }
}

export const resourceService = new ResourceService();