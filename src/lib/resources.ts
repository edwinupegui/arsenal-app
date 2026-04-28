// Re-export from service layer for backward compatibility
// The actual implementation lives in src/services/ResourceService.ts
export {
  resourceService,
  ResourceService,
} from '../services/ResourceService';

export type { ResourceFilters } from '../repositories';

// Re-export schema types
export type { Resource, NewResource, Category } from '../db/schema';

// Parse tags from JSON (Drizzle already handles JSON mode)
export function parseTags(tags: string[] | null): string[] {
  return tags ?? [];
}

// Convenience re-exports for direct usage
import { resourceService } from '../services/ResourceService';

export const listResources = resourceService.listResources.bind(resourceService);
export const listDeletedResources = resourceService.listDeletedResources.bind(resourceService);
export const getResourceById = resourceService.getResourceById.bind(resourceService);
export const getResourceByUrl = resourceService.getResourceByUrl.bind(resourceService);
export const createResource = resourceService.createResource.bind(resourceService);
export const updateResource = resourceService.updateResource.bind(resourceService);
export const softDeleteResource = resourceService.softDeleteResource.bind(resourceService);
export const restoreResource = resourceService.restoreResource.bind(resourceService);
export const permanentDeleteResource = resourceService.permanentDeleteResource.bind(resourceService);
export const searchResources = resourceService.searchResources.bind(resourceService);
export const listCategories = resourceService.listCategories.bind(resourceService);
export const getCategoryById = resourceService.getCategoryById.bind(resourceService);
export const getAllTags = resourceService.getAllTags.bind(resourceService);