// Resource type configuration
export const RESOURCE_TYPE_CONFIG = {
  video: {
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    label: 'Video',
  },
  article: {
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    label: 'Article',
  },
  tool: {
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    label: 'Tool',
  },
  repo: {
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
    label: 'Repo',
  },
} as const;

export type ResourceType = keyof typeof RESOURCE_TYPE_CONFIG;

// Language configuration
export const LANGUAGE_CONFIG = {
  ES: {
    label: 'ES',
    // OKLCH values for the badge
    color: '0.68 0.16 145',      // Text color - green
    bgColor: '0.68 0.16 145',     // Background accent
    badgeClass: 'bg-emerald-900/50 text-emerald-400 border-emerald-800',
  },
  EN: {
    label: 'EN',
    color: '0.65 0.18 220',      // Text color - blue
    bgColor: '0.65 0.18 220',     // Background accent
    badgeClass: 'bg-blue-900/50 text-blue-400 border-blue-800',
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
} as const;

export type CategoryIcon = keyof typeof CATEGORY_ICON_MAP;

// Resource type enum for validation
export const RESOURCE_TYPES = ['video', 'article', 'tool', 'repo'] as const;

// Languages enum for validation
export const LANGUAGES = ['ES', 'EN'] as const;