import type { Resource, NewResource, Category } from '../db/schema';

// Re-export from schema for convenience
export type { Resource, NewResource, Category };

// Resource with parsed tags (for UI consumption)
export interface ResourceWithTags extends Resource {
  parsedTags: string[];
}

// Resource with category attached (for list views)
export interface ResourceWithCategory {
  resource: ResourceWithTags;
  category: Category;
}

// Filter options for resource queries
export interface ResourceFilters {
  q?: string;
  categoryId?: number;
  language?: string;
  type?: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Create/Update input types (derived from schema)
export type CreateResourceInput = Omit<NewResource, 'createdAt'>;
export type UpdateResourceInput = Partial<Omit<NewResource, 'id' | 'createdAt'>>;