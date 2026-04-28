import { resourceRepository, categoryRepository, type ResourceFilters } from '../repositories';
import type { Resource, NewResource } from '../db/schema';
import type { Result, AppError } from '../lib/result';

export class ResourceService {
  listResources(filters?: ResourceFilters): Result<Resource[], AppError> {
    return resourceRepository.findAll(filters);
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