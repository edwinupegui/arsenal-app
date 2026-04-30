import { z } from 'zod'
import { LANGUAGES, RESOURCE_TYPES, CATEGORY_ICON_MAP } from './constants'
import {
  courseMetadataSchema,
  podcastMetadataSchema,
  newsletterMetadataSchema,
  communityMetadataSchema,
  validateMetadataSize,
} from './metadata'

export const languageEnum = z.enum(LANGUAGES)
export const typeEnum = z.enum(RESOURCE_TYPES)

// Metadata schemas for each type that has metadata
const metadataSchemas = {
  course: courseMetadataSchema,
  podcast: podcastMetadataSchema,
  newsletter: newsletterMetadataSchema,
  community: communityMetadataSchema,
}

// Base metadata validation (4KB size check)
const metadataBaseSchema = z.object({}).passthrough().refine(
  (data) => validateMetadataSize(data),
  { message: 'Metadata exceeds maximum size of 4KB' }
)

export const createResourceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Maximum 200 characters'),
  url: z.string().url('Invalid URL').max(500, 'Maximum 500 characters'),
  description: z.string().max(1000, 'Maximum 1000 characters').optional(),
  tags: z.array(z.string()).optional().default([]),
  language: languageEnum,
  type: typeEnum,
  categoryId: z.number().int().positive('Category is required'),
  metadata: z.unknown().optional().nullable(),
}).superRefine((data, ctx) => {
  // Validate metadata based on type
  if (data.metadata === null || data.metadata === undefined) {
    return // null/undefined is valid for all types
  }

  const type = data.type as string
  const schema = metadataSchemas[type as keyof typeof metadataSchemas]

  if (schema) {
    const result = schema.safeParse(data.metadata)
    if (!result.success) {
      for (const error of result.error.errors) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error.message,
          path: ['metadata', ...error.path],
        })
      }
    }
  } else {
    // Types without metadata: video, article, tool, repo
    // Metadata must be null or undefined for these types
    if (data.metadata !== null && data.metadata !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${type} resources cannot have metadata`,
        path: ['metadata'],
      })
    }
  }
})

export const updateResourceSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  url: z.string().url().max(500).optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  language: languageEnum.optional(),
  type: typeEnum.optional(),
  categoryId: z.number().int().positive().optional(),
  metadata: z.unknown().optional().nullable(),
}).superRefine((data, ctx) => {
  // Only validate metadata if it's provided (not undefined)
  if (data.metadata === undefined) {
    return
  }

  if (data.metadata === null) {
    return // null is always valid
  }

  const type = data.type
  if (!type) {
    // Can't validate metadata without knowing the type
    return
  }

  const schema = metadataSchemas[type as keyof typeof metadataSchemas]

  if (schema) {
    const result = schema.safeParse(data.metadata)
    if (!result.success) {
      for (const error of result.error.errors) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error.message,
          path: ['metadata', ...error.path],
        })
      }
    }
  } else {
    // Types without metadata
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${type} resources cannot have metadata`,
      path: ['metadata'],
    })
  }
})

export const sortEnum = z.enum(['alpha', 'newest', 'oldest', 'relevance'])

export const filterSchema = z.object({
  q: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  language: languageEnum.optional(),
  type: typeEnum.optional(),
  sort: sortEnum.optional().default('alpha'),
  tags: z.string().optional().transform(val => {
    if (!val) return []
    return val.split(',').map(t => t.trim()).filter(t => t.length > 0)
  }),
})

export type CreateResourceInput = z.infer<typeof createResourceSchema>
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>
export type FilterInput = z.infer<typeof filterSchema>

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// Category icon enum derived from CATEGORY_ICON_MAP keys
export const categoryIconEnum = z.enum(Object.keys(CATEGORY_ICON_MAP))
export type CategoryIconEnum = z.infer<typeof categoryIconEnum>

// Category validation schema
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Maximum 100 characters'),
  icon: categoryIconEnum,
})

export type CreateCategoryInput = z.infer<typeof categorySchema>
type UpdateCategoryInputPartial = z.infer<typeof categorySchema.partial>
export type { UpdateCategoryInputPartial as UpdateCategoryInput }