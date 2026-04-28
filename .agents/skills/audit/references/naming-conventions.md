# Naming Conventions — recursos-app

This document defines the authoritative naming standards for this project. All code, files, and documentation must follow these rules.

---

## Core Rule

| Category | Language | Examples |
|----------|----------|----------|
| **File names** | English (kebab-case) | `resource-card.astro`, `resource-repository.ts` |
| **Variables** | English (camelCase) | `resourceList`, `filterOptions` |
| **Functions** | English (camelCase) | `getResourceById()`, `createResource()` |
| **Types/Classes** | English (PascalCase) | `Resource`, `ResourceRepository` |
| **Constants** | English (UPPER_SNAKE_CASE) | `MAX_RETRIES`, `API_BASE_URL` |
| **DB tables** | English (snake_case, plural) | `resources`, `categories` |
| **DB columns** | English (snake_case) | `created_at`, `category_id` |
| **Page URLs** | **Spanish** | `/recursos`, `/recursos/new` |
| **Page directories** | **Spanish** (mirrors URL) | `src/pages/recursos/` |
| **API URLs** | **English** | `/api/resources`, `/api/resources/[id]` |
| **API directories** | **English** (mirrors URL) | `src/pages/api/resources/` |
| **Components** | English (PascalCase) | `<ResourceCard />` |

**Why:** Page URLs in Spanish for SEO/usability. API endpoints in English as is standard for technical APIs.

---

## 1. File Names

**Pattern:** kebab-case, English

```
✅ Correct
❌ Incorrect

resource-card.astro
filter-bar.astro
resource-repository.ts
constants.ts

ResourceCard.astro      # PascalCase
filterBar.astro         # camelCase
resourceRepository.ts   # camelCase
```

---

## 2. Variables and Functions

**Pattern:** camelCase, English, verb-first for functions

```typescript
const resourceList = [];
const filterOptions = {};
const isActive = true;
const hasPermission = false;

function getResourceById(id: number): Resource | null { ... }
function createResource(data: NewResource): Resource { ... }
function handleSubmit(event: Event) { ... }

const MAX_RETRIES = 3;           // Only true constants
const API_BASE_URL = '/api';
```

---

## 3. Page URLs and Directories (Spanish)

Mirrors user-facing URLs for SEO/usability.

```
✅ Correct
❌ Incorrect

/recursos
/recursos/new
/recursos/[id]/edit
/recursos/trash

src/pages/recursos/
src/pages/recursos/index.astro
src/pages/recursos/new.astro
src/pages/recursos/[id]/
src/pages/recursos/[id]/edit.astro
src/pages/recursos/trash.astro

src/pages/resources/         # ❌ Doesn't match URL
```

---

## 4. API URLs and Directories (English)

Technical endpoints use English as is standard.

```
✅ Correct
❌ Incorrect

/api/resources
/api/resources/[id]

src/pages/api/resources/
src/pages/api/resources/index.ts       # GET, POST
src/pages/api/resources/[id]/
src/pages/api/resources/[id]/index.ts  # GET, PUT, DELETE
src/pages/api/resources/[id]/permanent.ts
src/pages/api/resources/[id]/restore.ts

src/pages/api/recursos/     # ❌ Spanish in API
```

---

## 5. Types and Interfaces

**Pattern:** PascalCase, English

```typescript
type Resource = { id: number; title: string; };
type ResourceFilters = { q?: string; categoryId?: number; };
type ResourceList = Resource[];

interface ResourceRepository {
  findAll(filters?: ResourceFilters): Resource[];
  findById(id: number): Resource | null;
}

enum ResourceType {
  Video = 'video',
  Article = 'article',
  Tool = 'tool',
  Repo = 'repo',
}

enum Language { ES = 'ES', EN = 'EN' }
```

---

## 6. Classes

**Pattern:** PascalCase, noun-first

```typescript
class ResourceRepository {
  private _db: Database;

  constructor(db: Database) {
    this._db = db;
  }

  public findAll(): Resource[] { ... }
  public create(data: NewResource): Resource { ... }

  private buildConditions(filters: ResourceFilters): Condition[] { ... }
}
```

---

## 7. Database Schema (Drizzle)

**Pattern:** English, snake_case, plural

```typescript
export const resources = sqliteTable('resources', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  category_id: integer('category_id').references(() => categories.id),
  created_at: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  deleted_at: text('deleted_at'),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type Category = typeof categories.$inferSelect;
```

---

## 8. Components (Astro)

**File:** `resource-card.astro`
**Usage:** `<ResourceCard />`
**Props:** `ResourceCardProps`

```astro
---
interface Props {
  title: string;
  description?: string;
  variant?: 'default' | 'compact';
}

const { title, description, variant = 'default' } = Astro.props;
---

<article class:list={['card', variant === 'compact' && 'card--compact']}>
  <h3>{title}</h3>
  {description && <p>{description}</p>}
</article>
```

---

## 9. CSS Classes (Tailwind)

Use design tokens, not magic values.

```astro
<!-- ❌ Magic values -->
<div class="bg-[#0f0f0f] border border-[#2a2a2a] text-[#737373]">

<!-- ✅ Design tokens -->
<div class="bg-surface border-border text-muted">
```

---

## 10. Git Commits

**Pattern:** English, conventional commits

```
✅ Correct
feat(resources): add filter by category
fix(resources): handle null tags
refactor(resources): extract repository
docs: update installation

❌ Incorrect
feat(recursos): add filtro por categoria
Arreglar bug
```

---

## Quick Reference

| Element | Language | Convention | Example |
|---------|----------|------------|---------|
| File name | English | kebab-case | `resource-card.astro` |
| Page URL | Spanish | - | `/recursos` |
| Page directory | Spanish | mirrors URL | `src/pages/recursos/` |
| API URL | English | - | `/api/resources` |
| API directory | English | mirrors URL | `src/pages/api/resources/` |
| Variable | English | camelCase | `resourceList` |
| Function | English | camelCase, verb-first | `getResourceById()` |
| Class/Type | English | PascalCase | `ResourceRepository` |
| Constant | English | UPPER_SNAKE_CASE | `MAX_COUNT` |
| Component | English | PascalCase | `<ResourceCard />` |
| DB table | English | snake_case, plural | `resources` |
| DB column | English | snake_case | `created_at` |

---

## Enforcement

When auditing with `audit-skills-naming`:

1. **Code identifiers** → English only
2. **File names** → kebab-case English
3. **Page directories** → Spanish (mirrors page URLs)
4. **API directories** → English (mirrors API URLs)
5. **DB schema** → English snake_case
6. **No magic strings** → use constants

Violations → **Warning** in audit report.