# Audit Findings — Recursos App

## SOLID Compliance

| Principle | Status | Violation | Location |
|-----------|--------|-----------|----------|
| **S**ingle Responsibility | ⚠️ Warning | Mixed data access + business logic | `src/lib/recursos.ts` |
| **O**pen/Closed | ⚠️ Warning | Magic strings need code change for new types | `ResourceCard.astro` |
| **L**iskov Substitution | ✅ N/A | No inheritance hierarchies | - |
| **I**nterface Segregation | ⚠️ Suggestion | Could split into smaller focused interfaces | `recursos.ts` |
| **D**ependency Inversion | ⚠️ Suggestion | Direct `db` import, hard to mock | `src/lib/recursos.ts` |

**Overall: 3/5 SOLID principles adequately followed**

---

## Naming Violations (Critical)

**Rule:** Code identifiers in English. Page URLs in Spanish. API URLs in English.

**What's correct:**
- Page directories: Spanish (`src/pages/recursos/`) ✅
- Page URLs: Spanish (`/recursos`) ✅
- API directories: English (`src/pages/api/resources/`) - needs fix
- API URLs: English (`/api/resources`) - needs fix

**What's wrong (code identifiers in Spanish):**

| Current (Spanish) | Should Be (English) | Location |
|-------------------|---------------------|----------|
| `listRecursos()` | `listResources()` | `src/lib/recursos.ts` |
| `createRecurso()` | `createResource()` | `src/lib/recursos.ts` |
| `getRecursoById()` | `getResourceById()` | `src/lib/recursos.ts` |
| `updateRecurso()` | `updateResource()` | `src/lib/recursos.ts` |
| `softDeleteRecurso()` | `softDeleteResource()` | `src/lib/recursos.ts` |
| `listCategorias()` | `listCategories()` | `src/lib/recursos.ts` |
| `getRecursoByUrl()` | `getResourceByUrl()` | `src/lib/recursos.ts` |
| `searchRecursos()` | `searchResources()` | `src/lib/recursos.ts` |
| `Recurso` type | `Resource` | `src/lib/recursos.ts`, `src/db/schema.ts` |
| `Categoria` type | `Category` | `src/lib/recursos.ts`, `src/db/schema.ts` |
| `NewRecurso` type | `NewResource` | `src/lib/recursos.ts` |
| `parseTags()` | `parseTags()` | ✅ Already English |

**Files to rename/update:**

1. `src/lib/recursos.ts` → `src/lib/resources.ts` (file name + all identifiers)
2. `src/db/schema.ts` — rename table `recursos` → `resources`, `categorias` → `categories`, update columns to English
3. `src/pages/api/recursos/` → `src/pages/api/resources/` (directory + all file names)
4. All imports referencing Spanish names

---

## DRY Violations

### Critical (3+ repetitions)
| Issue | Location | Fix |
|-------|----------|-----|
| `bg-[#0f0f0f] border border-[#2a2a2a]` | 6+ files | Move to CSS class in `global.css` |

### Warning (2 repetitions)
| Issue | Location | Fix |
|-------|----------|-----|
| `parseTags` function | `recursos.ts` line 141, `ResourceCard.astro` line 26 | Consolidate in one place |
| `tipoIcons` + `tipoLabels` | `ResourceCard.astro` lines 28-40, used only there but hardcoded | Move to `constants.ts` |
| `createRecursoSchema` vs `updateRecursoSchema` | `validation.ts` lines 6-24 | Use `Partial<>` + passthrough |

### Suggestion (1 instance but should be constant)
| Issue | Location | Fix |
|-------|----------|-----|
| Color `#737373` (muted text) | 8+ locations | Extract to `theme.ts` |
| Color `#6366f1` (accent) | 5+ locations | Extract to `theme.ts` |
| Color `#0f0f0f` (surface) | 4+ locations | Extract to `theme.ts` |

---

## Design Pattern Usage

| Pattern | Status | Current Implementation |
|---------|--------|----------------------|
| Repository | ⚠️ Partial | Data access in `lib/recursos.ts`, no dedicated class |
| Service Layer | ❌ Missing | Business logic in API routes and pages |
| Factory | ✅ N/A | Not needed for current complexity |
| Strategy | ❌ Missing | If/else chains for filtering |
| Result/Either | ❌ Missing | Using `null` returns and try/catch |

### Repository Pattern Issue
```typescript
// Current: mixed concerns
// src/lib/recursos.ts
export function listRecursos(filters?) {
  // Data access + business logic + filtering all mixed
  const conditions = [isNull(recursos.deletedAt)];
  if (filters?.q) { conditions.push(or(like(...))); }
  return db.select().from(recursos).where(...);
}
```

Should be:
```typescript
// src/repositories/RecursoRepository.ts
export class RecursoRepository {
  findAll(filters: RecursoFilters): Recurso[] {
    return this.db.select().from(recursos).where(this.buildConditions(filters));
  }
}

// src/services/RecursoService.ts
export class RecursoService {
  listRecursos(filters: RecursoFilters): Recurso[] {
    return this.repo.findAll(filters); // Service handles business rules
  }
}
```

---

## Anti-Patterns

### God Module (Warning)
**File:** `src/lib/recursos.ts`
**Functions:** 13 and growing
**Concerns:** CRUD, filtering, searching, formatting, deleted handling

```
listRecursos, listDeletedRecursos, getRecursoById, getRecursoByUrl,
createRecurso, updateRecurso, softDeleteRecurso, restoreRecurso,
permanentDeleteRecurso, listCategorias, getCategoriaById,
parseTags, searchRecursos
```

**Fix:** Split into `RecursoRepository`, `CategoriaRepository`, `RecursoService`

### Magic Strings (Warning)
**Location:** `ResourceCard.astro` lines 28-40
**Values:** `tipoIcons` SVG paths, `tipoLabels` text

These should be in `constants.ts`:
```typescript
export const TIPO_CONFIG = {
  video: { icon: 'M14.752...', label: 'Video' },
  articulo: { icon: 'M9 12...', label: 'Artículo' },
  tool: { icon: 'M10.325...', label: 'Tool' },
  repo: { icon: 'M12 6...', label: 'Repo' },
} as const;
```

### Data Clump (Suggestion)
**Pattern:** `{ q, categoriaId, idioma, tipo }` passed together

**Fix:** Create `RecursoFilters` type:
```typescript
type RecursoFilters = {
  q?: string;
  categoriaId?: number;
  idioma?: string;
  tipo?: string;
};
```

---

## Specific File Analysis

### `src/lib/resources.ts`

| Function | Responsibility | Should be in | Violation |
|----------|---------------|--------------|-----------|
| `listResources` | Data access | ResourceRepository | SRP |
| `getResourceById` | Data access | ResourceRepository | SRP |
| `createResource` | Data access | ResourceRepository | SRP |
| `updateResource` | Data access | ResourceRepository | SRP |
| `softDeleteResource` | Data access | ResourceRepository | SRP |
| `listCategories` | Data access | CategoryRepository | SRP |
| `getCategoryById` | Data access | CategoryRepository | SRP |
| `parseTags` | Transformation | ResourceService or utils | - |
| `searchResources` | Data access + search | ResourceRepository | SRP |
| `getResourceByUrl` | Data access | ResourceRepository | SRP |

### `src/pages/recursos/index.astro`

| Issue | Violation |
|-------|-----------|
| Fetches data (repository concern) | SRP |
| Transforms data for display | SRP |
| Renders UI | ✓ OK |
| Contains inline `<form>` for delete | Controller in view |

### `src/components/resource-card.astro`

| Issue | Violation |
|-------|-----------|
| `resourceTypeIcons` hardcoded | OCP |
| `resourceTypeLabels` hardcoded | OCP, DRY |
| Language badge inline | Could be data-driven |
| Tag parsing inline | DRY (duplicated from `lib/resources.ts`) |

---

## Priority Fix Order

1. **Immediate** (Zero risk, high value):
   - **Phase 0**: Rename all Spanish identifiers to English (see naming violations above)
   - Extract `TIPO_CONFIG` to `src/lib/constants.ts`
   - Extract `IDIOMA_CONFIG` for language badges
   - Create `src/lib/theme.ts` with color tokens

2. **Short term** (Low risk refactor):
   - Rename `src/lib/recursos.ts` → `src/lib/resources.ts`
   - Split into `repositories/` + `services/`
   - Move tag parsing to single location

3. **Medium term** (Architectural improvement):
   - Add `ResourceFilters` type
   - Refactor API routes to use services

4. **Optional** (If project grows):
   - Result/Either error handling
   - Dependency injection container
   - Full test coverage

---

## Files Requiring Changes

| File | Changes Needed |
|------|---------------|
| `src/lib/resources.ts` | Rename from `recursos.ts` + split into repository + service |
| `src/lib/categories.ts` | Rename from `categorias.ts` (if exists) |
| `src/lib/constants.ts` | Create with RESOURCE_TYPE_CONFIG, LANGUAGE_CONFIG |
| `src/lib/theme.ts` | Create with color tokens |
| `src/lib/types.ts` | Create ResourceFilters, shared types |
| `src/components/resource-card.astro` | Use constants (was `ResourceCard.astro`) |
| `src/components/filter-bar.astro` | Data-driven filter options (was `FilterBar.astro`) |
| `src/components/resource-form.astro` | Use constants (was `ResourceForm.astro`) |
| `src/pages/recursos/index.astro` | Use service layer (stays Spanish - mirrors URL) |
| `src/pages/api/resources/` | Rename from `api/recursos/` (English - mirrors URL) |
| `src/styles/global.css` | Extract repeated classes |
| `src/layouts/Layout.astro` | Use theme tokens |

---

## Naming Convention Reference

See `../references/naming-conventions.md` for full standard.

Quick rules:
- File names: `kebab-case.astro`, `kebab-case.ts`
- Variables/functions: `camelCase`
- Classes/Types: `PascalCase`
- Constants: `UPPER_SNAKE_CASE` (only true constants)
- DB columns: `snake_case`
- Always use English identifiers