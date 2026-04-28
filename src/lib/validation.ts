import { z } from 'zod';
import { LANGUAGES, RESOURCE_TYPES } from './constants';

export const languageEnum = z.enum(LANGUAGES);
export const typeEnum = z.enum(RESOURCE_TYPES);

export const createResourceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Maximum 200 characters'),
  url: z.string().url('Invalid URL').max(500, 'Maximum 500 characters'),
  description: z.string().max(1000, 'Maximum 1000 characters').optional(),
  tags: z.array(z.string()).optional().default([]),
  language: languageEnum,
  type: typeEnum,
  categoryId: z.number().int().positive('Category is required'),
});

export const updateResourceSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  url: z.string().url().max(500).optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  language: languageEnum.optional(),
  type: typeEnum.optional(),
  categoryId: z.number().int().positive().optional(),
});

export const sortEnum = z.enum(['alpha', 'newest', 'oldest', 'relevance']);

export const filterSchema = z.object({
  q: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  language: languageEnum.optional(),
  type: typeEnum.optional(),
  sort: sortEnum.optional().default('alpha'),
  tags: z.string().optional().transform(val => {
    if (!val) return [];
    return val.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type FilterInput = z.infer<typeof filterSchema>;