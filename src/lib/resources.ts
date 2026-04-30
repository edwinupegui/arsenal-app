import { resourceService, ResourceService } from '../services/ResourceService';

// Re-export for backward compatibility
export { resourceService, ResourceService };

export type { ResourceFilters } from '../repositories';
export type { Resource, NewResource, Category } from '../db/schema';

// Parse tags from JSON or array (handles both Drizzle JSON mode and legacy strings)
// Defensive parsing - accepts string[], null, or JSON string
export function parseTags(tags: string[] | string | null | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  // Legacy: tags stored as JSON string
  if (typeof tags === 'string') {
    try {
      return JSON.parse(tags) as string[];
    } catch {
      return [];
    }
  }
  return [];
}

// Convenience re-exports for direct usage (avoids importing from multiple places)
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
export const listTags = resourceService.listTags.bind(resourceService);

// Backward compatibility alias (deprecated - use listTags instead)
export const getAllTags = listTags;