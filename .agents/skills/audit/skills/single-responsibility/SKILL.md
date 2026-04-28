---
name: audit-skills-single-responsibility
description: >
  Deep dive into Single Responsibility Principle. Check if modules have one reason to change.
trigger: When auditing SRP compliance or refactoring a module to have single responsibility.
license: Apache-2.0
metadata:
  author: edwin-dev
  version: "1.0"
---

# Single Responsibility Principle (SRP) — Deep Dive

## Definition

A module should have one, and only one, reason to change.

**Reason to change** = a single stakeholder (person/group) that can request the module to change.

## What to Audit

### 1. Can you describe the module in one sentence?

```typescript
// ❌ Vague description
class ResourceManager {
  // "This class manages resources"
  // Reason to change: anyone who needs resources functionality
  // → Too many stakeholders
}

// ✅ Clear description
class ResourceRepository {
  // "This class handles CRUD operations for resources in the database"
  // Reason to change: database schema changes or query optimization needs
  // → Single stakeholder: database team
}
```

### 2. Does the module contain multiple responsibilities?

Watch for:
- **Mixed data access and business logic**: `lib/resources.ts` does DB operations AND business rules
- **UI logic mixed with data**: Astro pages that both fetch data AND render AND handle forms
- **Validation mixed with persistence**: Creating a resource validates AND saves

### 3. Are there hidden responsibilities?

Look for functions that "just happen" to do extra work:

```typescript
// ❌ Hidden responsibility
function createResource(data: NewResource): Resource {
  // Primary: create resource in DB
  const result = db.insert(resources).values({ ... }).returning().all();

  // Hidden: Sends email notification
  await sendEmail('new-resource', data);

  // Hidden: Logs audit trail
  await logAudit('resource_created', data.id);

  return result[0];
}

// ✅ Single responsibility
function createResource(data: NewResource): Resource {
  return db.insert(resources).values({ ... }).returning().all();
}

// Separate services handle their own concerns
// EmailService.sendNewResourceNotification(data)
// AuditService.logResourceCreated(data)
```

## Current State in recursos-app

### Issue: `src/lib/resources.ts` mixes concerns

| Function | Responsibility | Should be in |
|----------|---------------|---------------|
| `listResources` | Data access | ResourceRepository |
| `getResourceById` | Data access | ResourceRepository |
| `createResource` | Data access + implicit notifications | ResourceRepository + event emission |
| `updateResource` | Data access | ResourceRepository |
| `softDeleteResource` | Data access | ResourceRepository |
| `restoreResource` | Data access | ResourceRepository |
| `permanentDeleteResource` | Data access | ResourceRepository |
| `listCategories` | Data access | CategoryRepository |
| `getCategoryById` | Data access | CategoryRepository |
| `parseTags` | Data transformation | ResourceService or utility |
| `searchResources` | Data access + search logic | ResourceRepository |
| `getResourceByUrl` | Data access | ResourceRepository |

### Issue: Astro pages mix concerns

Pages like `recursos/index.astro`:
- Fetch data (repository)
- Transform data for display (service)
- Render UI (view)
- Handle form submissions (controller)

## SRP Refactor Guide

### Step 1: Identify responsibilities

```typescript
// Before: mixed responsibilities
// src/lib/recursos.ts
export function listRecursos(filters) {
  // Data access: ✅ Repository concern
  const conditions = [isNull(recursos.deletedAt)];

  // Business logic: Should be in Service
  if (filters?.q) {
    conditions.push(/* search logic */);
  }

  // Data access: ✅ Repository concern
  return db.select().from(recursos).where(and(...conditions));
}
```

### Step 2: Separate into layers

```typescript
// src/repositories/RecursoRepository.ts
export class RecursoRepository {
  constructor(private db: Database) {}

  findAll(conditions: Condition[]): Recurso[] {
    return this.db.select().from(recursos).where(and(...conditions)).all();
  }

  findById(id: number): Recurso | undefined {
    return this.db.select().from(recursos).where(eq(recursos.id, id)).get();
  }
}

// src/services/RecursoService.ts
export class RecursoService {
  constructor(private repo: RecursoRepository) {}

  listRecursos(filters: RecursoFilters): Recurso[] {
    const conditions = this.buildConditions(filters);
    return this.repo.findAll(conditions);
  }

  private buildConditions(filters: RecursoFilters): Condition[] {
    const conditions: Condition[] = [isNull(recursos.deletedAt)];
    if (filters.q) {
      conditions.push(/* search logic here */);
    }
    // More filters...
    return conditions;
  }
}
```

## Audit Questions

1. Can I describe what this module does in one sentence?
2. Does this module change for more than one reason?
3. Are there responsibilities that could be extracted to another module?
4. Do I use "and" when describing what this module does?

## See Also

- **SOLID audit**: Main audit skill
- **Patterns audit**: Repository and Service patterns
- **DRY audit**: Extract patterns