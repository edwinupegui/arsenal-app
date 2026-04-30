import { describe, it, expect } from 'vitest'
import {
  courseMetadataSchema,
  podcastMetadataSchema,
  newsletterMetadataSchema,
  communityMetadataSchema,
  formatDuration,
  formatPrice,
  formatCount,
  formatFrequency,
  getExternalLinkLabel,
  validateMetadataSize,
} from '../metadata'

describe('metadata schemas', () => {
  describe('courseMetadataSchema', () => {
    it('validates correct course metadata', () => {
      const result = courseMetadataSchema.safeParse({
        platform: 'Platzi',
        instructor: 'Juan Pérez',
        durationMinutes: 480,
        level: 'intermediate',
        priceUsd: 29,
        modulesCount: 12,
        syllabus: ['Intro', 'Basics', 'Advanced'],
      })
      expect(result.success).toBe(true)
    })

    it('requires platform field', () => {
      const result = courseMetadataSchema.safeParse({
        instructor: 'Juan Pérez',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        // Check that there's at least one issue about platform
        const platformIssues = result.error.issues.filter(
          (issue) => issue.path.includes('platform')
        )
        expect(platformIssues.length).toBeGreaterThan(0)
      }
    })

    it('accepts optional fields when missing', () => {
      const result = courseMetadataSchema.safeParse({
        platform: 'Platzi',
      })
      expect(result.success).toBe(true)
    })

    it('validates level enum', () => {
      const result = courseMetadataSchema.safeParse({
        platform: 'Platzi',
        level: 'expert', // invalid
      })
      expect(result.success).toBe(false)
    })

    it('accepts priceUsd of 0 (free)', () => {
      const result = courseMetadataSchema.safeParse({
        platform: 'Platzi',
        priceUsd: 0,
      })
      expect(result.success).toBe(true)
    })

    it('rejects negative price', () => {
      const result = courseMetadataSchema.safeParse({
        platform: 'Platzi',
        priceUsd: -10,
      })
      expect(result.success).toBe(false)
    })

    it('rejects negative durationMinutes', () => {
      const result = courseMetadataSchema.safeParse({
        platform: 'Platzi',
        durationMinutes: -5,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('podcastMetadataSchema', () => {
    it('validates correct podcast metadata', () => {
      const result = podcastMetadataSchema.safeParse({
        host: 'Syntax FM',
        episodeCount: 300,
        frequency: 'weekly',
        platform: 'Spotify',
        rssUrl: 'https://feed.example.com/podcast.xml',
      })
      expect(result.success).toBe(true)
    })

    it('accepts empty string for optional URL fields', () => {
      const result = podcastMetadataSchema.safeParse({
        host: 'Syntax FM',
        rssUrl: '',
      })
      expect(result.success).toBe(true)
    })

    it('validates frequency enum', () => {
      const result = podcastMetadataSchema.safeParse({
        frequency: 'yearly', // invalid
      })
      expect(result.success).toBe(false)
    })

    it('accepts all valid frequency values', () => {
      const frequencies = ['daily', 'weekly', 'biweekly', 'monthly']
      for (const freq of frequencies) {
        const result = podcastMetadataSchema.safeParse({ frequency: freq })
        expect(result.success).toBe(true)
      }
    })

    it('rejects invalid URL for rssUrl', () => {
      const result = podcastMetadataSchema.safeParse({
        rssUrl: 'not-a-valid-url',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('newsletterMetadataSchema', () => {
    it('validates correct newsletter metadata', () => {
      const result = newsletterMetadataSchema.safeParse({
        author: 'Cooper Weekly',
        frequency: 'weekly',
        subscriberCount: 15000,
        platform: 'Substack',
        archiveUrl: 'https://archive.example.com',
      })
      expect(result.success).toBe(true)
    })

    it('accepts empty string for optional URL fields', () => {
      const result = newsletterMetadataSchema.safeParse({
        author: 'Cooper Weekly',
        archiveUrl: '',
      })
      expect(result.success).toBe(true)
    })

    it('validates frequency enum', () => {
      const result = newsletterMetadataSchema.safeParse({
        frequency: 'invalid', // invalid
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid URL for archiveUrl', () => {
      const result = newsletterMetadataSchema.safeParse({
        archiveUrl: 'not-a-valid-url',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('communityMetadataSchema', () => {
    it('validates correct community metadata', () => {
      const result = communityMetadataSchema.safeParse({
        platform: 'discord',
        memberCount: 5000,
        inviteUrl: 'https://discord.gg/example',
        isPrivate: true,
      })
      expect(result.success).toBe(true)
    })

    it('requires platform field', () => {
      const result = communityMetadataSchema.safeParse({
        memberCount: 5000,
      })
      expect(result.success).toBe(false)
    })

    it('validates platform enum', () => {
      const result = communityMetadataSchema.safeParse({
        platform: 'invalid',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const errorMessage = result.error.issues[0]?.message || result.error.message || ''
        expect(errorMessage).toContain('discord')
      }
    })

    it('accepts all valid platform values', () => {
      const platforms = ['discord', 'slack', 'telegram', 'forum', 'reddit']
      for (const platform of platforms) {
        const result = communityMetadataSchema.safeParse({ platform })
        expect(result.success).toBe(true)
      }
    })

    it('accepts empty string for optional URL fields', () => {
      const result = communityMetadataSchema.safeParse({
        platform: 'discord',
        inviteUrl: '',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('validateMetadataSize', () => {
    it('accepts metadata under 4KB', () => {
      const smallMetadata = {
        platform: 'Platzi',
        instructor: 'Test Instructor',
        durationMinutes: 120,
      }
      expect(validateMetadataSize(smallMetadata)).toBe(true)
    })

    it('rejects metadata exceeding 4KB', () => {
      // Create a string that will exceed 4KB when JSON serialized
      const largeMetadata = {
        platform: 'Platzi',
        syllabus: Array(500).fill('This is a very long module title that adds up to significant size'),
      }
      expect(validateMetadataSize(largeMetadata)).toBe(false)
    })

    it('accepts null', () => {
      expect(validateMetadataSize(null)).toBe(true)
    })

    it('accepts empty object', () => {
      expect(validateMetadataSize({})).toBe(true)
    })
  })
})

describe('format helpers', () => {
  describe('formatDuration', () => {
    it('formats hours and minutes', () => {
      expect(formatDuration(150)).toBe('2h 30min')
    })

    it('formats hours only when no remaining minutes', () => {
      expect(formatDuration(120)).toBe('2h')
    })

    it('formats minutes only when less than an hour', () => {
      expect(formatDuration(45)).toBe('45min')
    })

    it('returns empty string for null', () => {
      expect(formatDuration(null)).toBe('')
    })

    it('returns empty string for undefined', () => {
      expect(formatDuration(undefined)).toBe('')
    })

    it('returns empty string for 0', () => {
      expect(formatDuration(0)).toBe('')
    })

    it('returns empty string for negative values', () => {
      expect(formatDuration(-10)).toBe('')
    })
  })

  describe('formatPrice', () => {
    it('returns "Gratis" for 0', () => {
      expect(formatPrice(0)).toBe('Gratis')
    })

    it('returns "Gratis" for null', () => {
      expect(formatPrice(null)).toBe('Gratis')
    })

    it('returns "Gratis" for undefined', () => {
      expect(formatPrice(undefined)).toBe('Gratis')
    })

    it('formats price as "$XX USD"', () => {
      expect(formatPrice(29)).toBe('$29 USD')
      expect(formatPrice(99)).toBe('$99 USD')
    })

    it('handles decimal prices', () => {
      expect(formatPrice(19.99)).toBe('$19.99 USD')
    })
  })

  describe('formatCount', () => {
    it('returns empty string for null', () => {
      expect(formatCount(null)).toBe('')
    })

    it('returns empty string for undefined', () => {
      expect(formatCount(undefined)).toBe('')
    })

    it('returns empty string for 0', () => {
      expect(formatCount(0)).toBe('')
    })

    it('returns empty string for negative values', () => {
      expect(formatCount(-100)).toBe('')
    })

    it('returns number as string for values < 1000', () => {
      expect(formatCount(500)).toBe('500')
    })

    it('formats thousands as k', () => {
      expect(formatCount(1500)).toBe('2k')
      expect(formatCount(15000)).toBe('15k')
    })

    it('formats millions as M', () => {
      expect(formatCount(1500000)).toBe('1.5M')
    })

    it('handles exact thousands', () => {
      expect(formatCount(1000)).toBe('1k')
    })
  })

  describe('formatFrequency', () => {
    it('translates daily to Diario', () => {
      expect(formatFrequency('daily')).toBe('Diario')
    })

    it('translates weekly to Semanal', () => {
      expect(formatFrequency('weekly')).toBe('Semanal')
    })

    it('translates biweekly to Quincenal', () => {
      expect(formatFrequency('biweekly')).toBe('Quincenal')
    })

    it('translates monthly to Mensual', () => {
      expect(formatFrequency('monthly')).toBe('Mensual')
    })

    it('returns unknown frequencies unchanged', () => {
      expect(formatFrequency('yearly')).toBe('yearly')
      expect(formatFrequency('unknown')).toBe('unknown')
    })
  })

  describe('getExternalLinkLabel', () => {
    it('returns contextual label for course with platform', () => {
      expect(getExternalLinkLabel('course', { platform: 'Platzi' })).toBe('Ver curso en Platzi')
    })

    it('returns default label for course without platform', () => {
      expect(getExternalLinkLabel('course', {})).toBe('Ver curso')
      expect(getExternalLinkLabel('course', null)).toBe('Ver curso')
      expect(getExternalLinkLabel('course', undefined)).toBe('Ver curso')
    })

    it('returns contextual label for podcast with platform', () => {
      expect(getExternalLinkLabel('podcast', { platform: 'Spotify' })).toBe('Escuchar en Spotify')
    })

    it('returns default label for podcast without platform', () => {
      expect(getExternalLinkLabel('podcast', {})).toBe('Escuchar podcast')
    })

    it('returns contextual label for newsletter with platform', () => {
      expect(getExternalLinkLabel('newsletter', { platform: 'Substack' })).toBe('Suscribirse en Substack')
    })

    it('returns default label for newsletter without platform', () => {
      expect(getExternalLinkLabel('newsletter', {})).toBe('Suscribirse')
    })

    it('returns contextual label for community with platform', () => {
      expect(getExternalLinkLabel('community', { platform: 'discord' })).toBe('Unirse a Discord')
    })

    it('capitalizes platform name for community', () => {
      expect(getExternalLinkLabel('community', { platform: 'slack' })).toBe('Unirse a Slack')
    })

    it('returns default label for community without platform', () => {
      expect(getExternalLinkLabel('community', {})).toBe('Unirse a la comunidad')
    })

    it('returns "Abrir recurso" for video type', () => {
      expect(getExternalLinkLabel('video', {})).toBe('Abrir recurso')
    })

    it('returns "Abrir recurso" for article type', () => {
      expect(getExternalLinkLabel('article', {})).toBe('Abrir recurso')
    })

    it('returns "Abrir recurso" for tool type', () => {
      expect(getExternalLinkLabel('tool', {})).toBe('Abrir recurso')
    })

    it('returns "Abrir recurso" for repo type', () => {
      expect(getExternalLinkLabel('repo', {})).toBe('Abrir recurso')
    })

    it('handles metadata with no platform key', () => {
      expect(getExternalLinkLabel('course', { instructor: 'Test' })).toBe('Ver curso')
    })
  })
})