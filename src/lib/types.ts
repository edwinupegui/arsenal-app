import type { Resource, NewResource, Category } from '../db/schema';
import type { SortOption, ResourceFilters as RepoResourceFilters } from '../repositories';

// Re-export from schema for convenience
export type { Resource, NewResource, Category };

// Re-export filter types from repository (single source of truth)
export type { SortOption };
export type ResourceFilters = RepoResourceFilters;

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Create/Update input types (derived from schema)
export type CreateResourceInput = Omit<NewResource, 'createdAt'>;
export type UpdateResourceInput = Partial<Omit<NewResource, 'id' | 'createdAt'>>;