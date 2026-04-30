import { resourceRepository, categoryRepository, type ResourceFilters } from '../repositories';
import type { Resource, NewResource } from '../db/schema';
import { ok, type Result, type AppError } from '../lib/result';
import type { PaginatedResult } from '../lib/types';

export class ResourceService {
  listResources(filters?: ResourceFilters, page: number = 1, limit: number = 20): Result<PaginatedResult<Resource>, AppError> {
    // Calculate offset from page (1-indexed)
    const offset = (page - 1) * limit;

    // Get count for pagination metadata
    const countResult = resourceRepository.countResources(filters);
    if (!countResult.ok) {
      return countResult;
    }
    const total = countResult.value;

    // Get paginated resources
    const resourcesResult = resourceRepository.findAll(filters, { limit, offset });
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
    return resourceRepository.findDeleted();
  }

  getResourceById(id: number): Result<Resource, AppError> {
    return resourceRepository.findById(id);
  }

  getResourceByUrl(url: string): Result<Resource, AppError> {
    return resourceRepository.findByUrl(url);
  }

  createResource(data: NewResource): Result<Resource, AppError> {
    return resourceRepository.create(data);
  }

  updateResource(id: number, data: Partial<NewResource>): Result<Resource, AppError> {
    return resourceRepository.update(id, data);
  }

  softDeleteResource(id: number): Result<boolean, AppError> {
    return resourceRepository.softDelete(id);
  }

  restoreResource(id: number): Result<boolean, AppError> {
    return resourceRepository.restore(id);
  }

  permanentDeleteResource(id: number): Result<boolean, AppError> {
    return resourceRepository.permanentDelete(id);
  }

  searchResources(query: string, categoryId?: number): Result<Resource[], AppError> {
    return resourceRepository.search(query, categoryId);
  }

  listCategories(): Result<Category[], AppError> {
    return categoryRepository.findAll();
  }

  getCategoryById(id: number): Result<Category | null, AppError> {
    return categoryRepository.findById(id);
  }

  getAllTags(): Result<{tag: string; count: number}[], AppError> {
    return resourceRepository.getAllTags();
  }
}

export const resourceService = new ResourceService();