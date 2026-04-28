---
name: audit-skills-patterns
description: >
  Audit code for proper design pattern usage. Check Repository, Service, Factory, and other patterns.
trigger: When auditing architecture, reviewing pattern usage, or refactoring towards cleaner architecture.
license: Apache-2.0
metadata:
  author: edwin-dev
  version: "1.0"
---

# Design Patterns Audit

## Overview

Design patterns are reusable solutions to common software design problems. This skill checks if patterns are correctly implemented and appropriate for the context.

## Core Patterns for recursos-app

### 1. Repository Pattern

**Purpose:** Mediate between domain and data source, encapsulating data access logic.

**Current state in recursos-app:** Direct database calls mixed with business logic.

**Check:**
```typescript
// ❌ Current - mixed concerns
// src/lib/resources.ts
export function listResources(filters) {
  const conditions = [isNull(resources.deletedAt)];
  // Data access + business logic mixed
  if (filters?.q) {
    conditions.push(or(like(resources.title, `%${filters.q}%`), ...));
  }
  return db.select().from(resources).where(and(...conditions))...;
  // This is repository + service combined
}

// ✅ Proper separation
// src/repositories/ResourceRepository.ts
export class ResourceRepository {
  constructor(private db: Database) {}

  findAll(filters: ResourceFilters): Resource[] {
    const conditions = this.buildConditions(filters);
    return this.db.select().from(resources).where(and(...conditions))...;
  }

  findById(id: number): Resource | null { ... }
  create(data: NewResource): Resource { ... }
}

// src/services/ResourceService.ts
export class ResourceService {
  constructor(private repo: ResourceRepository) {}

  listResources(filters: ResourceFilters): Resource[] {
    return this.repo.findAll(filters);
  }

  // Business logic here (e.g., permissions, caching)
}
```

### 2. Service Layer Pattern

**Purpose:** Encapsulate business logic, coordinate repository operations.

**Check:**
- Is business logic in `.astro` pages or in dedicated service modules?
- Are there duplicated validation/transformations across API routes?

```typescript
// ❌ Business logic in API route
// src/pages/api/resources/index.ts
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  // Validation in route
  if (!body.title || !body.url) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), ...);
  }
  // Duplicated in other routes
};

// ✅ Business logic in service
// src/services/ResourceService.ts
export class ResourceService {
  createResource(data: CreateResourceInput): Result<Resource, ValidationError> {
    this.validate(data);
    // ...
  }
}
```

### 3. Constants/Config Pattern

**Purpose:** Avoid magic strings, centralize configuration.

**Current issue:** `resourceTypeIcons` and `resourceTypeLabels` are inline in `resource-card.astro`

**Check:**
```typescript
// ❌ Magic strings in component
// resource-card.astro
const resourceTypeIcons: Record<string, string> = {
  video: '...',
  article: '...',
  tool: '...',
  repo: '...',
};

// ✅ Centralized config
// src/lib/constants.ts
export const RESOURCE_TYPE_CONFIG = {
  video: { icon: '...', label: 'Video' },
  article: { icon: '...', label: 'Article' },
  tool: { icon: '...', label: 'Tool' },
  repo: { icon: '...', label: 'Repo' },
} as const;
```

### 4. Result/Either Pattern

**Purpose:** Handle errors explicitly, avoid throwing/catching in business logic.

**Check:**
```typescript
// ❌ Error handling mixed with business logic
function getResourceById(id: number): Resource | null {
  try {
    const result = db.select().from(resources).where(eq(resources.id, id)).all();
    return result[0] ?? null;
  } catch (error) {
    console.error('Database error:', error);
    return null; // Silent failure
  }
}

// ✅ Explicit result
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

function getResourceById(id: number): Result<Resource, 'NOT_FOUND' | 'DB_ERROR'> {
  try {
    const result = db.select().from(resources).where(eq(resources.id, id)).all();
    return result[0] ? { ok: true, value: result[0] } : { ok: false, error: 'NOT_FOUND' };
  } catch (error) {
    return { ok: false, error: 'DB_ERROR' };
  }
}
```

### 5. Strategy Pattern

**Purpose:** Swap algorithms without changing the client.

**Check:**
```typescript
// ❌ Hardcoded filter logic
if (filter.type === 'video') { /* filter by video */ }
if (filter.type === 'article') { /* filter by article */ }

// ✅ Strategy pattern
interface FilterStrategy {
  buildConditions(filters: ResourceFilters): Condition[];
}

class TypeFilterStrategy implements FilterStrategy {
  buildConditions(filters: ResourceFilters): Condition[] {
    if (!filters.type) return [];
    return [eq(resources.type, filters.type)];
  }
}
```

## Pattern Coverage in recursos-app

| Pattern | Implemented | Correct | Notes |
|---------|-------------|---------|-------|
| Repository | Partial | No | Data access in `lib/resources.ts` mixed with business logic |
| Service Layer | No | - | Business logic in API routes and Astro pages |
| Constants | Partial | No | `resourceTypeIcons` duplicated, should be centralized |
| Result/Either | No | - | Using `null` returns, exceptions not handled |
| Strategy | No | - | If/else chains for filtering |

## Finding Severity

| Severity | Description |
|----------|-------------|
| **Critical** | Business logic in view layer (Astro pages) |
| **Warning** | Mixed concerns in modules |
| **Suggestion** | Could benefit from specific pattern |

## Architecture Recommendation

```
src/
├── repositories/      # Data access only
│   └── ResourceRepository.ts
├── services/          # Business logic
│   └── ResourceService.ts
├── lib/
│   ├── constants.ts    # Shared constants (RESOURCE_TYPE_CONFIG, etc)
│   └── types.ts       # Shared types (ResourceFilters, etc)
└── pages/             # Presentation only, no business logic
```

## References

See `../references/patterns-usage.md` for pattern implementation guides.