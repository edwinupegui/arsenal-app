---
name: audit-skills-anti-patterns
description: >
  Detect and fix code smells and anti-patterns. Find God Objects, shotgun surgery, and other issues.
trigger: When auditing code quality, finding bugs, or refactoring messy code.
license: Apache-2.0
metadata:
  author: edwin-dev
  version: "1.0"
---

# Anti-Patterns Audit

## Overview

Anti-patterns are common responses to a problem that are usually ineffective and counterproductive.

## Common Anti-Patterns

### 1. God Object/Class

**What:** A single class/module that knows too much or does too much.

**Current risk in recursos-app:**
```typescript
// src/lib/resources.ts - growing list of unrelated functions
export function listResources() { ... }
export function listDeletedResources() { ... }
export function getResourceById() { ... }
export function getResourceByUrl() { ... }
export function createResource() { ... }
export function updateResource() { ... }
export function softDeleteResource() { ... }
export function restoreResource() { ... }
export function permanentDeleteResource() { ... }
export function listCategories() { ... }
export function getCategoryById() { ... }
export function parseTags() { ... }
export function searchResources() { ... }
// This is becoming a God Module
```

**Fix:** Separate into:
- `ResourceRepository` (CRUD operations)
- `CategoryRepository` (category operations)
- `ResourceService` (business logic)

### 2. Shotgun Surgery

**What:** A single change requires modifying many scattered files/classes.

**Example in recursos-app:**
- Changing `RESOURCE_TYPE_CONFIG` structure requires editing:
  - `resource-card.astro`
  - `filter-bar.astro` (if it shows type badges)
  - Any other component displaying type info

**Fix:** Centralize configuration, use a single import.

### 3. Premature Optimization

**What:** Optimizing before measuring, making code complex for hypothetical performance gains.

**Example:**
```typescript
// ❌ Unnecessary optimization
const result = db
  .select({ id: resources.id, title: resources.title }) // Selecting only 2 columns
  .from(resources)
  .where(eq(resources.id, id));

// ✅ Simple until proven slow
const result = db.select().from(resources).where(eq(resources.id, id)).get();
```

### 4. Magic Strings/Numbers

**What:** Hardcoded values that should be named constants.

**Current examples in recursos-app:**
```typescript
// resource-card.astro - inline magic strings
const resourceTypeIcons: Record<string, string> = { /* hardcoded SVG paths */ };

// Pages - CSS class repetition
class="bg-[#0f0f0f] border border-[#2a2a2a]"

// Layout.astro
bg-[#0f0f0f]/95 backdrop-blur-sm z-50
```

### 5. Callback Hell

**What:** Nested callbacks making code hard to read.

Not currently present in recursos-app (uses async/await), but watch for in future API routes.

### 6. Data Clump

**What:** Groups of variables passed together everywhere.

**Example:**
```typescript
// These always appear together
{ q, categoryId, language, type }

// Should be a type
type ResourceFilters = {
  q?: string;
  categoryId?: number;
  language?: string;
  type?: string;
};
```

### 7. Feature Envy

**What:** A function that uses more data from other classes than its own.

Not a current issue, but watch in future refactors.

### 8. Primitive Obsession

**What:** Using primitives instead of small objects for domain concepts.

**Current:**
```typescript
// language is just a string
language: text('language').notNull(),

// type is just a string
type: text('type').notNull(),
```

**Better:**
```typescript
// Using enums/const objects
export const LANGUAGE = ['ES', 'EN'] as const;
export const RESOURCE_TYPE = ['video', 'article', 'tool', 'repo'] as const;
```

### 9. Parallel Inheritance Hierarchies

**What:** When you add a subclass for one class, you must also add a subclass for another.

Not present in current codebase.

### 10. Lazy Class

**What:** Classes that do too little, adding unnecessary complexity.

Not currently an issue.

## Anti-Pattern Checklist

```
File: {path}
├── God Object: Is this module doing too much?
├── Shotgun Surgery: Would one change require multiple edits?
├── Magic Values: Are there hardcoded strings/numbers?
├── Data Clump: Are there groups of params passed together?
├── Primitive Obsession: Are primitives used for domain concepts?
└── Issues: [list]
```

## Severity Scale

| Severity | Impact | Example |
|----------|--------|---------|
| **Critical** | Causes bugs, hard to maintain | God module with 15+ functions |
| **Warning** | Maintenance burden | Magic strings in 5+ files |
| **Suggestion** | Minor code smell | Slightly misnamed variable |

## References

See `../references/anti-patterns-guide.md` for detailed explanations and fixes.