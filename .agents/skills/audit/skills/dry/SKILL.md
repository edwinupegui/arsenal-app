---
name: audit-skills-dry
description: >
  Audit code for DRY principle violations. Find duplicated logic, magic strings, and repeated patterns.
trigger: When auditing code duplication, refactoring repeated logic, or cleaning up magic values.
license: Apache-2.0
metadata:
  author: edwin-dev
  version: "1.0"
---

# DRY Principle Audit

## Overview

**DRY: Don't Repeat Yourself**

Every piece of knowledge must have a single, authoritative, unambiguous representation in a system.

## What to Check

### 1. Duplicated Logic

**Check:**
- Similar code blocks that could be extracted to a function
- Repeated if/else conditions across multiple files
- Copy-pasted algorithms that could be parameterized

**Red Flags:**
```typescript
// ❌ Duplicated logic
function formatDateES(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateEN(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${month}/${day}/${year}`; // Only difference is format
}

// ✅ DRY - single function with locale parameter
function formatDate(date: Date, locale: 'ES' | 'EN'): string {
  const parts = {
    ES: (d: Date) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
    EN: (d: Date) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`,
  };
  return parts[locale](date);
}
```

### 2. Magic Strings/Numbers

**Check:**
- Hardcoded strings used in multiple places (labels, error messages, CSS classes)
- Magic numbers without named constants
- Repeated configuration values

**Red Flags:**
```typescript
// ❌ Magic strings scattered
const card = {
  bg: 'bg-[#0f0f0f]',
  border: 'border-[#2a2a2a]',
  text: 'text-[#737373]',
};

// ❌ Used everywhere
function Card() {
  return <div class="bg-[#0f0f0f] border border-[#2a2a2a] ...">
}
function AnotherCard() {
  return <div class="bg-[#0f0f0f] border border-[#2a2a2a] ...">
}

// ✅ Single source of truth
// src/lib/theme.ts
export const theme = {
  colors: {
    surface: '#0f0f0f',
    border: '#2a2a2a',
    muted: '#737373',
    accent: '#6366f1',
  },
};

// Now use theme.colors.surface everywhere
```

### 3. Repeated UI Patterns

**Check:**
- Same component structure repeated with minor differences
- Repeated inline styles that should be CSS classes
- Copy-pasted Astro component markup

**Red Flags:**
```astro
<!-- ❌ Repeated structure -->
<div class="flex items-center gap-2">
  <svg class="w-4 h-4" ...>...</svg>
  <span>Label</span>
</div>

<div class="flex items-center gap-2">
  <svg class="w-4 h-4" ...>...</svg>
  <span>Label 2</span>
</div>

<!-- ✅ Extract to component -->
<!-- src/components/Badge.astro -->
---
interface Props {
  icon: string;
  label: string;
  variant?: 'default' | 'accent';
}
---
<div class:list={["flex items-center gap-2", variant === 'accent' && "text-accent"]}>
  <svg class="w-4 h-4" ...>...</svg>
  <span>{label}</span>
</div>
```

### 4. Database Query Duplication

**Check:**
- Same query logic repeated in multiple functions
- Repeated filter-building code
- Duplicate validation schemas

**Red Flags:**
```typescript
// ❌ Repeated condition building
function listRecursos(filters?: { categoriaId?: number }) {
  const conditions = [isNull(recursos.deletedAt)];
  if (filters?.categoriaId) {
    conditions.push(eq(recursos.categoriaId, filters.categoriaId));
  }
  // ...
}

function searchRecursos(query: string, categoriaId?: number) {
  const conditions = [
    isNull(recursos.deletedAt),
    like(recursos.titulo, `%${query}%`),
  ];
  if (categoriaId) {
    conditions.push(eq(recursos.categoriaId, categoriaId)); // DUPLICATED!
  }
  // ...
}

// ✅ Extract query builder
function buildRecursoConditions(filters: RecursoFilters) {
  const conditions = [isNull(recursos.deletedAt)];
  if (filters.q) {
    conditions.push(or(like(recursos.titulo, `%${filters.q}%`), ...));
  }
  if (filters.categoriaId) {
    conditions.push(eq(recursos.categoriaId, filters.categoriaId));
  }
  return conditions;
}
```

## Common DRY Violations in recursos-app

| Location | Issue | Fix |
|----------|-------|-----|
| `resource-card.astro` | `resourceTypeIcons` and `resourceTypeLabels` duplicated in page | Extract to `src/lib/constants.ts` |
| `resources.ts` | `getResourceById` called in multiple functions for existence checks | Extract to internal helper |
| Multiple `.astro` files | `bg-[#0f0f0f] border border-[#2a2a2a]` repeated | Move to CSS class |
| `validation.ts` | Schema types duplicated across create/update | Use `Partial` types properly |

## Audit Checklist

For each file:
```
File: {path}
├── Magic strings → extract to constants?
├── Magic numbers → extract to named constants?
├── Duplicated logic → extract to function?
├── Repeated UI markup → extract to component?
├── Duplicate queries → extract query builder?
└── Issues: [list]
```

## Finding Severity

| Severity | Description |
|----------|-------------|
| **Critical** | Identical code blocks repeated 3+ times |
| **Warning** | Similar logic that could be unified |
| **Suggestion** | Magic string that should be named constant |

## References

See `../references/dry-examples.md` for before/after refactors.