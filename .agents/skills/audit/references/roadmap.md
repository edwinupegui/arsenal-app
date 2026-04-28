# Recursos App — Refactor Roadmap

## Project Analysis

**Type:** Astro SSR app with SQLite/Drizzle, Tailwind CSS v4, Bun
**Purpose:** Curated technical resources manager with CRUD operations
**Current state:** Functional monolith — all logic in `src/lib/recursos.ts` and `.astro` pages

---

## Initial Audit Findings

### Critical Issues

| # | File | Issue | Impact |
|---|------|-------|--------|
| 1 | `src/lib/recursos.ts` | God Module — 13 mixed functions | Hard to maintain, SRP violation |
| 2 | `ResourceCard.astro` | Magic strings `tipoIcons`, `tipoLabels` hardcoded | OCP violation, duplication |
| 3 | `.astro` pages | Mixed concerns (data + view + controller) | SRP violation |
| 4 | All files | **Spanish naming in code** (`listRecursos`, `createRecurso`) | Naming convention violation - use English |

### Warning Issues

| # | File | Issue | Impact |
|---|------|-------|--------|
| 5 | `src/lib/recursos.ts` | `parseTags` duplicated — in lib and ResourceCard | DRY violation |
| 6 | `ResourceCard.astro` | Inline language badge logic | Could be data-driven |
| 7 | `src/lib/validation.ts` | Schema duplication — create/update nearly identical | DRY, could use `Partial<>` |
| 8 | Multiple | CSS class repetition `bg-[#0f0f0f] border border-[#2a2a2a]` | DRY violation, theme coupling |

### Suggestion Issues

| # | File | Issue | Impact |
|---|------|-------|--------|
| 9 | All `.astro` | Hardcoded color values in markup | Theme coupling |
| 10 | API routes | Error handling could be more structured | Could use Result pattern |
| 11 | `src/lib/recursos.ts` | Could benefit from Result/Either pattern | Error handling |

---

## Roadmap

### Phase 0: Naming Standardization

**Goal:** Rename all code identifiers to English. Page URLs stay Spanish, API URLs become English.

**Current violations:**
- `listRecursos()` → `listResources()`
- `createRecurso()` → `createResource()`
- `getRecursoById()` → `getResourceById()`
- `getRecursoByUrl()` → `getResourceByUrl()`
- `updateRecurso()` → `updateResource()`
- `softDeleteRecurso()` → `softDeleteResource()`
- `restoreRecurso()` → `restoreResource()`
- `permanentDeleteRecurso()` → `permanentDeleteResource()`
- `listDeletedRecursos()` → `listDeletedResources()`
- `searchRecursos()` → `searchResources()`
- `parseTags()` → `parseTags()` (keep as-is, already English)
- `listCategorias()` → `listCategories()`
- `getCategoriaById()` → `getCategoryById()`
- `Recurso` type → `Resource`
- `NewRecurso` type → `NewResource`
- `Categoria` type → `Category`

**Files to rename:**

1. **Code identifiers** (Spanish → English inside files):
   - `src/lib/recursos.ts` → `src/lib/resources.ts`
   - `src/lib/validation.ts` (update schema names)
   - `src/lib/categorias.ts` → `src/lib/categories.ts`

2. **Database schema** (Spanish → English):
   - `src/db/schema.ts` — table `recursos` → `resources`, `categorias` → `categories`
   - Column `categoriaId` → `categoryId`, `createdAt` → `created_at`, `deletedAt` → `deleted_at`

3. **API directories** (Spanish → English, mirrors URL):
   - `src/pages/api/recursos/` → `src/pages/api/resources/`
   - `src/pages/api/recursos/[id]/` → `src/pages/api/resources/[id]/`

4. **Page directories** (stay Spanish, mirrors URL):
   - `src/pages/recursos/` → stays as is ✅

5. **Import updates** in all files referencing renamed modules

**Skill:** `audit-skills-naming`

---

### Phase 1: Foundation (Centralize Configuration)

**Goal:** Eliminate magic strings, create single source of truth.

**Tasks:**
- [ ] 1.1 Create `src/lib/constants.ts` with `TIPO_CONFIG`, `IDIOMA_CONFIG`
- [ ] 1.2 Extract `tipoIcons` and `tipoLabels` from `ResourceCard.astro` to constants
- [ ] 1.3 Create `src/lib/theme.ts` with color tokens (current hardcoded values)
- [ ] 1.4 Update `ResourceCard.astro` to use constants
- [ ] 1.5 Update `Layout.astro` to use theme tokens

**Skill:** `audit-skills-dry`, `audit-skills-open-closed`

---

### Phase 2: Code Organization (Repository Pattern)

**Goal:** Separate data access from business logic.

**Tasks:**
- [ ] 2.1 Create `src/repositories/RecursoRepository.ts` — CRUD operations
- [ ] 2.2 Create `src/repositories/CategoriaRepository.ts` — categoria operations
- [ ] 2.3 Move DB operations from `src/lib/recursos.ts` to repositories
- [ ] 2.4 Create `src/services/RecursoService.ts` — business logic, filtering
- [ ] 2.5 Update `src/lib/recursos.ts` to re-export from new structure
- [ ] 2.6 Update API routes to use services

**Skill:** `audit-skills-patterns`, `audit-skills-single-responsibility`

---

### Phase 3: Schema Consolidation

**Goal:** DRY validation schemas, proper TypeScript types.

**Tasks:**
- [ ] 3.1 Create unified `src/lib/types.ts` with all domain types
- [ ] 3.2 Refactor `validation.ts` to use shared types
- [ ] 3.3 Use Drizzle's `InferSelectModel`, `InferInsertModel` properly
- [ ] 3.4 Add `RecursoFilters` type for filter operations

**Skill:** `audit-skills-dry`, `typescript-advanced-types`

---

### Phase 4: Component Extraction

**Goal:** Reduce duplication in Astro components.

**Tasks:**
- [ ] 4.1 Extract badge components (`IdiomaBadge`, `TipoBadge`) from `ResourceCard`
- [ ] 4.2 Create `src/components/FilterBar.astro` with filter config
- [ ] 4.3 Create `src/components/ResourceGrid.astro` for list rendering
- [ ] 4.4 Extract repeated CSS classes to global styles

**Skill:** `audit-skills-dry`, `frontend-design`

---

### Phase 5: Error Handling (Optional)

**Goal:** Structured error handling with Result pattern.

**Tasks:**
- [ ] 5.1 Create `src/lib/result.ts` with Result/Either type
- [ ] 5.2 Refactor repository methods to return `Result<T, E>`
- [ ] 5.3 Update service layer to handle Result types
- [ ] 5.4 Update API routes to handle errors properly

**Skill:** `audit-skills-patterns`

---

### Phase 6: Testing Infrastructure (Optional)

**Goal:** Add unit tests for services.

**Tasks:**
- [ ] 6.1 Create mock implementations of repositories
- [ ] 6.2 Add unit tests for `RecursoService`
- [ ] 6.3 Add integration tests for API routes
- [ ] 6.4 Ensure existing vitest tests still pass

**Skill:** `go-testing` (adapted for TypeScript)

---

## Priority Order

```
Phase 0 (Naming)       → Always first, fixes critical violations
Phase 1 (Foundation)    → Eliminate magic strings
Phase 2 (Code Org)     → Major refactor, do early
Phase 3 (Schema)       → Can do in parallel with Phase 2
Phase 4 (Components)   → After data layer is clean
Phase 5 (Error Handling) → Optional, based on needs
Phase 6 (Testing)      → Last, ensures stability
```

## How to Use This Roadmap

1. **Start with Phase 0** — rename all Spanish identifiers to English, no risk
2. **Run audit before each phase** — use `audit-skills-*` sub-skills
3. **Verify tests pass** — `npm test` after each phase
4. **Apply relevant skill** — load before starting each phase

## Skill Coverage

| Audit Skill | Used In |
|-------------|---------|
| `audit-skills-naming` | Phase 0 (mandatory) |
| `audit-skills-dry` | Phases 1, 3, 4 |
| `audit-skills-open-closed` | Phase 1 |
| `audit-skills-patterns` | Phase 2, 5 |
| `audit-skills-single-responsibility` | Phase 2 |
| `audit-skills-anti-patterns` | Initial audit, all phases |
| `audit-skills-solid` | All phases |

---

## Progress Tracking

After each phase, run a quick audit:

```bash
# Audit specific area
# Load audit-skills-naming → check for non-English identifiers
# Load audit-skills-dry → check for new DRY violations
# Load audit-skills-solid → verify SOLID compliance
```

| Phase | Status | Date Completed | Notes |
|-------|--------|----------------|-------|
| 0. Naming | ✅ Completed | 2026-04-27 | Rename Spanish → English |
| 1. Foundation | ✅ Completed | 2026-04-27 | Extract constants, theme |
| 2. Code Org | ✅ Completed | 2026-04-27 | Repository + Service pattern |
| 3. Schema | ✅ Completed | 2026-04-27 | Type consolidation |
| 4. Components | ✅ Completed | 2026-04-27 | Data-driven components |
| 5. Error Handling | ⚠️ Optional | - | Skipped unless needed |
| 6. Testing | ⚠️ Optional | - | Skipped unless needed |