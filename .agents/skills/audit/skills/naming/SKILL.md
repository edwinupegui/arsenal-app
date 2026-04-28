---
name: audit-skills-naming
description: >
  Audit code for naming convention compliance. Check file names, variables, classes follow standards.
trigger: When auditing code, reviewing naming, or refactoring to enforce naming conventions.
license: Apache-2.0
metadata:
  author: edwin-dev
  version: "1.0"
---

# Naming Conventions Audit

## Overview

Naming is one of the most important aspects of code quality. Good names make code self-documenting, reducing need for comments.

## Authoritative Reference

See `../references/naming-conventions.md` for the complete standard.

## What to Audit

### 1. File Names

**Standard:** `kebab-case.astro`, `kebab-case.ts`

```typescript
// ❌ Violations
ResourceCard.astro      // PascalCase in filename
filterBar.astro         // camelCase in filename
api_recursos.ts         // snake_case
getResource.ts          // verb-first in filename

// ✅ Correct
resource-card.astro
filter-bar.astro
api-recursos.ts
resource-utils.ts
```

**Check with:**
```bash
# Find non-kebab-case files
ls src/**/*.astro | grep -v '^[a-z][a-z0-9-]*\.astro$'
```

### 2. Variables and Functions

**Standard:** `camelCase` for variables/functions

```typescript
// ❌ Violations
const ResourceList = [];      // PascalCase variable
const resource_list = [];     // snake_case variable
const FILTER_OPTIONS = {};    // UPPER_SNAKE_CASE (unless true constant)

function GetResourceById() {} // PascalCase function
function resource_by_id() {}  // snake_case function

// ✅ Correct
const resourceList = [];
const filterOptions = {};
const MAX_RETRIES = 3;       // Only for true constants

function getResourceById() {}
function fetchResources() {}
```

### 3. Boolean Variables

**Standard:** prefix with `is`, `has`, `should`, `can`

```typescript
// ❌ Violations
const active = true;
const permission = false;
const redirect = true;

// ✅ Correct
const isActive = true;
const hasPermission = false;
const shouldRedirect = true;
const canEdit = true;
```

### 4. Event Handlers

**Standard:** prefix with `handle`

```typescript
// ❌ Violations
function onClick() {}
function clickHandler() {}
function btnClick() {}

// ✅ Correct
function handleClick() {}
function handleSubmit() {}
function handleInputChange() {}
```

### 5. Classes and Types

**Standard:** `PascalCase`

```typescript
// ❌ Violations
class recursoRepository {}
interface recurso_filters {}
type resource_list = {};

// ✅ Correct
class ResourceRepository {}
interface ResourceFilters {}
type ResourceList = Resource[];
```

### 6. Database Schema

**Standard:** English, snake_case for table/column names, plural table names

```typescript
// ❌ Violations
export const recursos = sqliteTable('recursos', { ... });   // Spanish table name
export const categorias = sqliteTable('categorias', { ... }); // Spanish table name
export const recursos = sqliteTable('recursos', {
  createdAt: text('createdAt'),         // camelCase column
  categoriaId: integer('categoriaId'),   // camelCase column
});

// ✅ Correct - English names, snake_case columns
export const resources = sqliteTable('resources', {
  created_at: text('created_at'),
  category_id: integer('category_id'),
  title: text('title').notNull(),
});

export const categories = sqliteTable('categories', {
  name: text('name').notNull(),
  icon: text('icon').notNull(),
});
```

### 7. Page Directories (Spanish — mirrors page URLs)

```typescript
// ❌ Violations
src/pages/resources/       // English, doesn't match page URL /recursos

// ✅ Correct
src/pages/recursos/         // Spanish mirrors /recursos
src/pages/recursos/index.astro
src/pages/recursos/new.astro
```

### 8. API Directories (English — mirrors API URLs)

```typescript
// ❌ Violations
src/pages/api/recursos/    // Spanish in API URL

// ✅ Correct
src/pages/api/resources/    // English mirrors /api/resources
src/pages/api/resources/index.ts
src/pages/api/resources/[id]/
```

### 9. Constants

**Standard:** `UPPER_SNAKE_CASE` only for true constants (magic values that never change)

```typescript
// ❌ Violations - overusing UPPER_SNAKE_CASE
const API_URL = 'http://localhost:4321';    // Environment-dependent
const DEFAULT_PAGE = 1;                      // Configurable
const resourceList = [];                      // Variable, not constant

// ✅ Correct
const MAX_RETRIES = 3;                        // Truly constant
const PI = 3.14159;                           // Mathematical constant
const API_BASE_URL = '/api';                  // Framework constant
const resourceList = [];                      // Regular variable
```

### 10. Component Names

**Standard:** PascalCase for usage, kebab-case for file

```astro
<!-- file: resource-card.astro -->

<!-- ❌ Violations -->
<resource_card />           <!-- snake_case usage -->
<ResourceCard />             <!-- correct -->
<resource-card />            <!-- kebab-case usage -->

<!-- ✅ Correct -->
<ResourceCard />

<!-- Props interface -->
interface ResourceCardProps {
  title: string;
}
```

### 11. CSS Classes (Tailwind)

**Standard:** Use design tokens, not magic values

```astro
<!-- ❌ Violations - magic values -->
<div class="bg-[#0f0f0f] border border-[#2a2a2a] text-[#737373]">

<!-- ✅ Correct - use theme tokens -->
<div class="bg-surface border-border text-muted">
```

---

## Audit Checklist

For each file:

```
File: {path}
├── Filename: kebab-case? English?
├── Page dir: Spanish (mirrors URL)?
├── API dir: English (mirrors URL)?
├── Variables: camelCase?
├── Functions: camelCase + verb-first?
├── Classes/Types: PascalCase?
├── Constants: UPPER_SNAKE_CASE (only if true constant)?
├── Components: PascalCase usage?
├── DB schema: English snake_case?
└── CSS: design tokens, not magic values?
```

---

## Naming Violations Severity

| Severity | Impact | Example |
|----------|--------|---------|
| **Critical** | Causes bugs or confusion | `deleteRecurso` vs `deleteRecursos` in code |
| **Warning** | Deviation from standard | Page dir in English instead of Spanish |
| **Suggestion** | Minor improvement | `isActive` instead of `active` |

---

## Reference

Full standard: `../references/naming-conventions.md`