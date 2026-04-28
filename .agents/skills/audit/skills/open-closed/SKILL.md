---
name: audit-skills-open-closed
description: >
  Deep dive into Open/Closed Principle. Check if code is open for extension, closed for modification.
trigger: When auditing OCP compliance or refactoring to make code extensible without modification.
license: Apache-2.0
metadata:
  author: edwin-dev
  version: "1.0"
---

# Open/Closed Principle (OCP) — Deep Dive

## Definition

Software entities should be **open for extension** but **closed for modification**.

- **Open for extension**: New behavior can be added
- **Closed for modification**: Existing code doesn't need to change to add new behavior

## What to Audit

### 1. Switch/If-Else Chains

**Red Flag:**
```typescript
// ❌ Must modify to add new type
function getResourceTypeIcon(type: string): string {
  switch (type) {
    case 'video': return 'M14.752...';
    case 'article': return 'M9 12...';
    case 'tool': return 'M10.325...';
    case 'repo': return 'M12 6...';
    default: return 'M12 6...';
  }
}

// To add 'course' type, must modify this function
```

**Good Pattern:**
```typescript
// ✅ Closed for modification, open for extension
// src/lib/constants.ts
export const RESOURCE_TYPE_CONFIG = {
  video: { icon: 'M14.752...', label: 'Video' },
  article: { icon: 'M9 12...', label: 'Article' },
  tool: { icon: 'M10.325...', label: 'Tool' },
  repo: { icon: 'M12 6...', label: 'Repo' },
} as const;

type ResourceType = keyof typeof RESOURCE_TYPE_CONFIG;

// Add new type by adding entry, function stays the same
function getResourceTypeIcon(type: ResourceType): string {
  return RESOURCE_TYPE_CONFIG[type]?.icon ?? RESOURCE_TYPE_CONFIG.video.icon;
}
```

### 2. Feature Flags vs Code Changes

If adding a feature requires modifying core logic, it's a OCP violation.

**Example in recursos-app:**
- `filter-bar.astro` checks type/language/category filters
- If a new filter dimension is needed (e.g., `level`), currently needs code changes

### 3. Data-Driven vs Code-Driven Logic

**Red Flag:**
```typescript
// ❌ Logic scattered in code
function renderBadge(type: string) {
  if (type === 'video') {
    return `<span class="badge-video">...</span>`;
  }
  if (type === 'article') {
    return `<span class="badge-article">...</span>`;
  }
}
```

**Good Pattern:**
```typescript
// ✅ Data-driven: add new type by adding data, not code
const BADGE_CONFIG = {
  video: { class: 'badge-video', label: 'Video' },
  article: { class: 'badge-article', label: 'Article' },
};

// To add new type: just add entry to BADGE_CONFIG
// No code changes needed
```

## Current OCP Issues in recursos-app

### Issue 1: `resource-card.astro` type icons

```astro
<!-- Current: must modify to add new type -->
const resourceTypeIcons: Record<string, string> = {
  video: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.574zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  // ... hardcoded
};
```

**Fix:** Move to `src/lib/constants.ts` and import.

### Issue 2: `filter-bar.astro` filter logic

Currently filters are built with if/else chains. A Strategy pattern would make this extensible.

### Issue 3: Language badge in resource-card

```astro
<!-- Hardcoded language badge -->
{resource.language === 'ES'
  ? { label: 'ES', class: 'bg-emerald-900/50 text-emerald-400 border-emerald-800' }
  : { label: 'EN', class: 'bg-blue-900/50 text-blue-400 border-blue-800' }}
```

**Fix:** Add to `RESOURCE_TYPE_CONFIG` or create `LANGUAGE_CONFIG`.

## OCP Refactor Pattern

### Before: OCP Violation

```typescript
// src/lib/resource-type-utils.ts
export function getResourceTypeIcon(type: string): string {
  if (type === 'video') return '...';
  if (type === 'article') return '...';
  // Add new type → modify this function
}
```

### After: OCP Compliant

```typescript
// src/lib/constants.ts
export const RESOURCE_TYPE_CONFIG = {
  video: { icon: '...', label: 'Video' },
  article: { icon: '...', label: 'Article' },
} as const;

export function getResourceTypeConfig(type: keyof typeof RESOURCE_TYPE_CONFIG) {
  return RESOURCE_TYPE_CONFIG[type];
}

// Add new type → just add entry, no code change
```

## Audit Questions

1. Can I add new functionality without modifying existing code?
2. Is there a switch/if-else chain that grows with new types?
3. Are there magic strings that represent configuration data?
4. Could this be data-driven instead of code-driven?

## See Also

- **SOLID audit**: Main audit skill
- **DRY audit**: Constants centralization
- **Patterns audit**: Strategy pattern