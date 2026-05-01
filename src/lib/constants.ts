// Resource type configuration
export const RESOURCE_TYPE_CONFIG = {
  video: {
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    label: 'Video',
    hasMetadata: false,
  },
  article: {
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    label: 'Article',
    hasMetadata: false,
  },
  tool: {
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    label: 'Tool',
    hasMetadata: false,
  },
  repo: {
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
    label: 'Repo',
    hasMetadata: false,
  },
  course: {
    icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479L11 12H4z',
    label: 'Course',
    hasMetadata: true,
  },
  podcast: {
    icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0-11V4m0 11v4m0-11h4m-11 0h4m-4-11a3 3 0 01-3-3V4a3 3 0 013-3h4a3 3 0 013 3v3a3 3 0 01-3 3z',
    label: 'Podcast',
    hasMetadata: true,
  },
  newsletter: {
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    label: 'Newsletter',
    hasMetadata: true,
  },
  community: {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    label: 'Community',
    hasMetadata: true,
  },
} as const;

export type ResourceType = keyof typeof RESOURCE_TYPE_CONFIG;

// Language configuration with OKLCH values
export const LANGUAGE_CONFIG = {
  ES: {
    label: 'ES',
    color: '0.68 0.12 145',
    bgColor: '0.68 0.12 145',
    badgeClass: 'border-emerald-800/50 text-emerald-300',
  },
  EN: {
    label: 'EN',
    color: '0.62 0.14 220',
    bgColor: '0.62 0.14 220',
    badgeClass: 'border-blue-800/50 text-blue-300',
  },
} as const;

export type Language = keyof typeof LANGUAGE_CONFIG;

// Category icon map
export const CATEGORY_ICON_MAP = {
  architect: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  robot: 'M12 2a2 2 0 012 2v4a2 2 0 01-2 2 2 2 0 01-2-2V4a2 2 0 012-2zm-2 8a2 2 0 00-2 2v2a4 4 0 004 4h4a4 4 0 004-4v-2a2 2 0 00-2-2zm6 0a2 2 0 00-2 2v2a4 4 0 004 4h4a4 4 0 004-4v-2a2 2 0 00-2-2z',
  gamepad: 'M15 6a1 1 0 11-2 0 1 1 0 012 0zM9 6a1 1 0 11-2 0 1 1 0 012 0zM6 15v-3a3 3 0 013-3h6a3 3 0 013 3v3M6 15a2 2 0 002 2h8a2 2 0 002-2M6 15V9a2 2 0 012-2h8a2 2 0 012 2v6',
  layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  bookmark: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z',
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  database: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  briefcase: 'M21 13.016A3 3 0 0119 16h-1V5a3 3 0 00-5.996-1.758L8 5m5 8h5l-1-1.5M5 13h4',
  trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
} as const;

export type CategoryIcon = keyof typeof CATEGORY_ICON_MAP;

// Resource type enum for validation
export const RESOURCE_TYPES = ['video', 'article', 'tool', 'repo', 'course', 'podcast', 'newsletter', 'community'] as const

// Suggested tags for resources (shown as guidance when creating/filtering)
export const SUGGESTED_TAGS = [
  // Level
  'principiante', 'intermedio', 'avanzado', 'fundamentos',
  // Format
  'tutorial', 'curso-completo', 'cheatsheet', 'documentacion', 'referencia',
  // Content type
  'patrones', 'buenas-practicas', 'arquitectura', 'performance', 'debugging',
  'optimizacion', 'seguridad', 'testing',
  // Tech specific
  'typescript', 'javascript', 'react', 'astro', 'svelte', 'node',
  'docker', 'kubernetes', 'postgres', 'sqlite', 'redis',
  // Learning style
  'gratuito', 'paid', 'oficial', 'comunidad',
] as const;

export type SuggestedTag = typeof SUGGESTED_TAGS[number];

// Language enum for validation
export const LANGUAGES = ['ES', 'EN'] as const

// Resource type colors for UI styling (Tailwind classes for dark theme)
export const TYPE_COLORS: Record<ResourceType, { bg: string; text: string; border: string; label: string }> = {
  video: {
    bg: 'bg-red-400/10',
    text: 'text-red-400',
    border: 'border-red-400/30',
    label: 'Video',
  },
  article: {
    bg: 'bg-blue-400/10',
    text: 'text-blue-400',
    border: 'border-blue-400/30',
    label: 'Article',
  },
  tool: {
    bg: 'bg-teal-400/10',
    text: 'text-teal-400',
    border: 'border-teal-400/30',
    label: 'Tool',
  },
  repo: {
    bg: 'bg-violet-400/10',
    text: 'text-violet-400',
    border: 'border-violet-400/30',
    label: 'Repo',
  },
  course: {
    bg: 'bg-amber-400/10',
    text: 'text-amber-400',
    border: 'border-amber-400/30',
    label: 'Curso',
  },
  podcast: {
    bg: 'bg-pink-400/10',
    text: 'text-pink-400',
    border: 'border-pink-400/30',
    label: 'Podcast',
  },
  newsletter: {
    bg: 'bg-cyan-400/10',
    text: 'text-cyan-400',
    border: 'border-cyan-400/30',
    label: 'Newsletter',
  },
  community: {
    bg: 'bg-emerald-400/10',
    text: 'text-emerald-400',
    border: 'border-emerald-400/30',
    label: 'Comunidad',
  },
};
