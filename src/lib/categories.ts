// Re-export all resource operations from new resources module
export {
  listResources,
  listDeletedResources,
  getResourceById,
  getResourceByUrl,
  createResource,
  updateResource,
  softDeleteResource,
  restoreResource,
  permanentDeleteResource,
  parseTags,
  searchResources,
} from './resources';

// Category operations
export { listCategories, getCategoryById } from './resources';