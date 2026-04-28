import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the repositories before importing the service
vi.mock('../repositories', () => ({
  resourceRepository: {
    findAll: vi.fn(),
    findDeleted: vi.fn(),
    findById: vi.fn(),
    findByUrl: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
    restore: vi.fn(),
    permanentDelete: vi.fn(),
    search: vi.fn(),
  },
  categoryRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
  },
}));

// Mock schema types
vi.mock('../db/schema', () => ({
  type: { Resource: {}, NewResource: {} },
}));

import { ResourceService } from '../services/ResourceService';
import { resourceRepository, categoryRepository } from '../repositories';
import type { Resource, NewResource } from '../db/schema';

// Re-export for tests
export { resourceRepository, categoryRepository };

describe('ResourceService', () => {
  let service: ResourceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ResourceService();
  });

  describe('listResources', () => {
    it('should return resources when repository succeeds', async () => {
      const mockResources = [{
        id: 1,
        title: 'Test',
        url: 'http://test.com',
        description: 'desc',
        tags: [],
        language: 'EN',
        type: 'article',
        categoryId: 1,
        createdAt: '2024-01-01',
        deletedAt: null,
      }];
      vi.mocked(resourceRepository.findAll).mockReturnValue({ ok: true, value: mockResources });

      const result = service.listResources();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(mockResources);
      }
    });

    it('should return error when repository fails', async () => {
      vi.mocked(resourceRepository.findAll).mockReturnValue({
        ok: false,
        error: { type: 'DATABASE_ERROR' as const, message: 'DB error' },
      });

      const result = service.listResources();

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe('DB error');
      }
    });

    it('should pass filters to repository', async () => {
      vi.mocked(resourceRepository.findAll).mockReturnValue({ ok: true, value: [] });

      service.listResources({ q: 'test', categoryId: 1 });

      expect(resourceRepository.findAll).toHaveBeenCalledWith({ q: 'test', categoryId: 1 });
    });
  });

  describe('getResourceById', () => {
    it('should return resource when found', async () => {
      const mockResource = {
        id: 1,
        title: 'Test',
        url: 'http://test.com',
        description: 'desc',
        tags: [],
        language: 'EN',
        type: 'article',
        categoryId: 1,
        createdAt: '2024-01-01',
        deletedAt: null,
      };
      vi.mocked(resourceRepository.findById).mockReturnValue({ ok: true, value: mockResource });

      const result = service.getResourceById(1);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(1);
      }
    });

    it('should return not found error when resource does not exist', async () => {
      vi.mocked(resourceRepository.findById).mockReturnValue({
        ok: false,
        error: { type: 'NOT_FOUND' as const, message: 'Resource with id 999 not found' },
      });

      const result = service.getResourceById(999);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('NOT_FOUND');
      }
    });
  });

  describe('createResource', () => {
    it('should create resource and return it', async () => {
      const newResource: NewResource = {
        title: 'New Resource',
        url: 'http://new.com',
        description: 'new desc',
        tags: ['tag1'],
        language: 'ES',
        type: 'video',
        categoryId: 1,
      };
      const created = {
        id: 10,
        title: newResource.title,
        url: newResource.url,
        description: newResource.description ?? null,
        tags: newResource.tags ?? null,
        language: newResource.language,
        type: newResource.type,
        categoryId: newResource.categoryId,
        createdAt: '2024-01-01',
        deletedAt: null,
      };
      vi.mocked(resourceRepository.create).mockReturnValue({ ok: true, value: created });

      const result = service.createResource(newResource);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe(10);
        expect(result.value.title).toBe('New Resource');
      }
    });

    it('should return error on duplicate URL', async () => {
      const newResource: NewResource = {
        title: 'New Resource',
        url: 'http://existing.com',
        description: 'desc',
        tags: [],
        language: 'EN',
        type: 'article',
        categoryId: 1,
      };
      vi.mocked(resourceRepository.create).mockReturnValue({
        ok: false,
        error: { type: 'DUPLICATE_ENTRY' as const, message: "url 'http://existing.com' already exists" },
      });

      const result = service.createResource(newResource);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('DUPLICATE_ENTRY');
      }
    });
  });

  describe('updateResource', () => {
    it('should update and return resource', async () => {
      const updated = {
        id: 1,
        title: 'Updated',
        url: 'http://test.com',
        description: 'updated',
        tags: [],
        language: 'EN',
        type: 'article',
        categoryId: 1,
        createdAt: '2024-01-01',
        deletedAt: null,
      };
      vi.mocked(resourceRepository.update).mockReturnValue({ ok: true, value: updated });

      const result = service.updateResource(1, { title: 'Updated' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.title).toBe('Updated');
      }
    });

    it('should return not found for non-existent resource', async () => {
      vi.mocked(resourceRepository.update).mockReturnValue({
        ok: false,
        error: { type: 'NOT_FOUND' as const, message: 'Resource with id 999 not found' },
      });

      const result = service.updateResource(999, { title: 'Updated' });

      expect(result.ok).toBe(false);
    });
  });

  describe('softDeleteResource', () => {
    it('should return true on successful soft delete', async () => {
      vi.mocked(resourceRepository.softDelete).mockReturnValue({ ok: true, value: true });

      const result = service.softDeleteResource(1);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(true);
      }
    });

    it('should return error when resource not found', async () => {
      vi.mocked(resourceRepository.softDelete).mockReturnValue({
        ok: false,
        error: { type: 'NOT_FOUND' as const, message: 'Resource with id 999 not found' },
      });

      const result = service.softDeleteResource(999);

      expect(result.ok).toBe(false);
    });
  });

  describe('restoreResource', () => {
    it('should return true on successful restore', async () => {
      vi.mocked(resourceRepository.restore).mockReturnValue({ ok: true, value: true });

      const result = service.restoreResource(1);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(true);
      }
    });
  });

  describe('permanentDeleteResource', () => {
    it('should return true on successful permanent delete', async () => {
      vi.mocked(resourceRepository.permanentDelete).mockReturnValue({ ok: true, value: true });

      const result = service.permanentDeleteResource(1);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(true);
      }
    });

    it('should return error when trying to delete non-deleted resource', async () => {
      vi.mocked(resourceRepository.permanentDelete).mockReturnValue({
        ok: false,
        error: { type: 'DATABASE_ERROR' as const, message: 'Cannot permanently delete a non-deleted resource' },
      });

      const result = service.permanentDeleteResource(1);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('DATABASE_ERROR');
      }
    });
  });

  describe('searchResources', () => {
    it('should return matching resources', async () => {
      const mockResources = [{
        id: 1,
        title: 'React Guide',
        url: 'http://react.com',
        description: 'Learn React',
        tags: [],
        language: 'EN',
        type: 'article',
        categoryId: 1,
        createdAt: '2024-01-01',
        deletedAt: null,
      }];
      vi.mocked(resourceRepository.search).mockReturnValue({ ok: true, value: mockResources });

      const result = service.searchResources('React');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].title).toBe('React Guide');
      }
    });

    it('should return empty array when no matches', async () => {
      vi.mocked(resourceRepository.search).mockReturnValue({ ok: true, value: [] });

      const result = service.searchResources('nonexistent');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(0);
      }
    });
  });

  describe('listCategories', () => {
    it('should return categories', async () => {
      const mockCategories = [{ id: 1, name: 'Frontend', icon: 'code' }];
      vi.mocked(categoryRepository.findAll).mockReturnValue({ ok: true, value: mockCategories });

      const result = service.listCategories();

      expect(result.ok).toBe(true);
    });
  });
});