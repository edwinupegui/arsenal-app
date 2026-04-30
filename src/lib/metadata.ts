// Metadata types for new resource types
// Each type has required and optional fields as defined in the spec

export interface CourseMetadata {
  platform: string
  instructor?: string
  durationMinutes?: number
  level?: 'beginner' | 'intermediate' | 'advanced'
  priceUsd?: number
  modulesCount?: number
  syllabus?: string[]
}

export interface PodcastMetadata {
  host?: string
  episodeCount?: number
  frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  platform?: string
  rssUrl?: string
}

export interface NewsletterMetadata {
  author?: string
  frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  subscriberCount?: number
  platform?: string
  archiveUrl?: string
}

export interface CommunityMetadata {
  platform: 'discord' | 'slack' | 'telegram' | 'forum' | 'reddit'
  memberCount?: number
  inviteUrl?: string
  isPrivate?: boolean
}

export type ResourceMetadata = CourseMetadata | PodcastMetadata | NewsletterMetadata | CommunityMetadata

// Zod schemas for each metadata type
import { z } from 'zod'

export const courseMetadataSchema = z.object({
  platform: z.string().min(1, 'Platform is required for courses'),
  instructor: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  priceUsd: z.number().min(0).optional(),
  modulesCount: z.number().int().positive().optional(),
  syllabus: z.array(z.string()).optional(),
})

export const podcastMetadataSchema = z.object({
  host: z.string().optional(),
  episodeCount: z.number().int().positive().optional(),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']).optional(),
  platform: z.string().optional(),
  rssUrl: z.string().url().optional().or(z.literal('')),
})

export const newsletterMetadataSchema = z.object({
  author: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']).optional(),
  subscriberCount: z.number().int().positive().optional(),
  platform: z.string().optional(),
  archiveUrl: z.string().url().optional().or(z.literal('')),
})

export const communityMetadataSchema = z.object({
  platform: z.enum(['discord', 'slack', 'telegram', 'forum', 'reddit'], {
    error: 'Platform must be one of: discord, slack, telegram, forum, reddit',
  }),
  memberCount: z.number().int().positive().optional(),
  inviteUrl: z.string().url().optional().or(z.literal('')),
  isPrivate: z.boolean().optional(),
})

// Discriminated union schema for metadata validation
// The __type field is internal - set based on resource type during validation
export const metadataSchema = z.discriminatedUnion('__type', [
  z.object({ __type: z.literal('course'), ...courseMetadataSchema.shape }),
  z.object({ __type: z.literal('podcast'), ...podcastMetadataSchema.shape }),
  z.object({ __type: z.literal('newsletter'), ...newsletterMetadataSchema.shape }),
  z.object({ __type: z.literal('community'), ...communityMetadataSchema.shape }),
])

// Schema for validating metadata based on resource type
// Returns the appropriate schema or null for types without metadata
export function getMetadataSchemaForType(type: string): z.ZodSchema | null {
  switch (type) {
    case 'course':
      return courseMetadataSchema
    case 'podcast':
      return podcastMetadataSchema
    case 'newsletter':
      return newsletterMetadataSchema
    case 'community':
      return communityMetadataSchema
    default:
      return null
  }
}

// 4KB max size for metadata JSON
const MAX_METADATA_SIZE = 4 * 1024

export function validateMetadataSize(metadata: unknown): boolean {
  const json = JSON.stringify(metadata)
  return json.length <= MAX_METADATA_SIZE
}

// Format helpers for detail page display

/**
 * Format duration in minutes to "Xh Ym" format
 * @param minutes - Duration in minutes
 * @returns Formatted string like "2h 30min" or "45min"
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (minutes == null || minutes <= 0) return ''

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${mins}min`
  }
}

/**
 * Format price in USD to display string
 * @param priceUsd - Price in USD (0 = free)
 * @returns "Gratis" for 0, "$XX USD" otherwise
 */
export function formatPrice(priceUsd: number | null | undefined): string {
  if (priceUsd == null || priceUsd === 0) return 'Gratis'
  return `$${priceUsd} USD`
}

/**
 * Format large counts with k/m suffix
 * @param count - Number to format
 * @returns Formatted string like "15k" or "1.2M"
 */
export function formatCount(count: number | null | undefined): string {
  if (count == null || count <= 0) return ''

  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`
  } else if (count >= 1_000) {
    return `${(count / 1_000).toFixed(0)}k`
  }
  return count.toString()
}

/**
 * Get contextual external link label based on resource type
 * @param type - Resource type (course, podcast, newsletter, community, video, article, tool, repo)
 * @param metadata - Optional metadata object with platform info
 * @returns Contextual label like "Ver curso en Platzi", "Escuchar en Spotify", etc.
 */
export function getExternalLinkLabel(
  type: string,
  metadata?: Record<string, unknown> | null
): string {
  const platform = metadata?.platform as string | undefined

  switch (type) {
    case 'course':
      return platform ? `Ver curso en ${platform}` : 'Ver curso'

    case 'podcast':
      return platform ? `Escuchar en ${platform}` : 'Escuchar podcast'

    case 'newsletter':
      return platform ? `Suscribirse en ${platform}` : 'Suscribirse'

    case 'community':
      if (platform) {
        const platformCapitalized = platform.charAt(0).toUpperCase() + platform.slice(1)
        return `Unirse a ${platformCapitalized}`
      }
      return 'Unirse a la comunidad'

    // Default for video, article, tool, repo
    default:
      return 'Abrir recurso'
  }
}

/**
 * Format frequency value to human-readable Spanish
 * @param frequency - Frequency enum value
 * @returns Human-readable frequency string
 */
export function formatFrequency(frequency: string): string {
  switch (frequency) {
    case 'daily':
      return 'Diario'
    case 'weekly':
      return 'Semanal'
    case 'biweekly':
      return 'Quincenal'
    case 'monthly':
      return 'Mensual'
    default:
      return frequency
  }
}