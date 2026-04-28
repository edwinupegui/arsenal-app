# Arsenal App — Agent System

## Project Overview

**Arsenal** es un sistema de gestión de recursos de desarrollo (videos, artículos, herramientas, repositorios) con una interfaz web construida en Astro y SQLite como base de datos.

## Tech Stack

- **Framework**: Astro 6 con modo SSR
- **Database**: SQLite via Drizzle ORM
- **Styling**: Tailwind CSS 4
- **Validation**: Zod 4
- **Testing**: Vitest
- **Language**: TypeScript strict mode

## Architecture

```
src/
├── components/     # .astro UI components
├── layouts/        # Layout components
├── pages/
│   ├── api/        # API routes (backend)
│   │   └── resources/
│   ├── recursos/  # Spanish page dirs (mirrors URLs)
│   └── index.astro
├── repositories/   # Data access layer (Drizzle queries)
├── services/       # Business logic
├── lib/            # Utilities (result, types, constants, theme)
└── db/             # Schema, migrations, seed
```

## Entry Point — How I Work

### SDD Workflow (Spec-Driven Development)

Cuando me pides algo, sigo este flujo:

```
1. EXPLORE    → Investigar el código existente, entender el contexto
2. PROPOSE    → Crear propuesta con intent, scope, y approach
3. SPEC       → Escribir especificaciones con scenarios
4. DESIGN     → Crear diseño técnico (si aplica)
5. TASKS      → Descomponer en tasks ejecutables
6. APPLY      → Implementar el código
7. VERIFY     → Validar contra specs
8. ARCHIVE    → Sincronizar delta specs al main
```

### When to Use Each Skill

| Context | Skill to Load |
| ------- | ------------- |
| Analizando código, auditando | `audit` (y sus sub-skills) |
| Escribiendo código nuevo | `sdd-apply` con el workflow completo |
| Explorando ideas | `sdd-explore` |
| Escribiendo specs | `sdd-spec` |
|Frontend UI | `impeccable` o `frontend-design` |
| TypeScript advanced types | `typescript-advanced-types` |
| Drizzle ORM patterns | `drizzle-orm` |
| Accesibilidad | `accessibility` |
| SEO | `seo` |
| CSS/Tailwind | `tailwind-css-patterns` |

## Audit System

Las auditorías son SERIAS. Cada archivo de código debe cumplir con estos estándares:

### Audit Dimensions (Orden de precedencia)

1. **Type Safety** — No `any`, tipos estrictos, inference correcta
2. **SOLID Principles** — Single responsibility, OCP, LSP, ISP, DIP
3. **DRY** — Sin duplicación, magic strings extraídos
4. **Error Handling** — Result pattern usado consistentemente
5. **Security** — SQL injection prevention, XSS prevention, input validation
6. **Performance** — Queries optimizadas, índices, no N+1
7. **Naming** — kebab-case archivos, camelCase vars, PascalCase types
8. **Patterns** — Repository/Service separation, composition over inheritance

### Audit Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| **Critical** | Bug de runtime o security vulnerability | Arreglar inmediatamente |
| **Warning** | SOLID violation o deuda técnica | Refactor en siguiente sprint |
| **Suggestion** | Mejora de naming o style | Nice to have |

## Critical Rules

### Type Safety (NO EXCEPTIONS)

```typescript
// ❌ NEVER
const anything: any = something;
const category: any = await getCategory();
function foo(x) { return x.value; }

// ✅ ALWAYS
const something: unknown = getSomething();
const category: Category = await getCategory();
function foo(x: { value: string }): string { return x.value; }
```

### Error Handling

```typescript
// ❌ NEVER
function getResource(): Resource | null { ... }
try { ... } catch (e) { console.error(e); }

// ✅ ALWAYS - Use Result type
function getResource(): Result<Resource, AppError> { ... }
// Errors propagate up, never silently caught
```

### Security

```typescript
// ❌ NEVER - SQL injection vulnerable
db.select().from(resources).where(eq(resources.id, userInput));

// ✅ ALWAYS - Parameterized (Drizzle does this by default)
db.select().from(resources).where(eq(resources.id, Number(userInput)));

// ❌ NEVER - XSS vulnerable
element.innerHTML = userInput;

// ✅ ALWAYS - Safe DOM manipulation
element.textContent = userInput;
```

### Validation (Zod)

```typescript
// All API inputs MUST be validated with Zod schemas
const CreateResourceSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url(),
  language: z.enum(['ES', 'EN']),
  type: z.enum(['video', 'article', 'tool', 'repo']),
  categoryId: z.number().int().positive(),
});
```

## Skill Registry

### Available Skills

| Skill | Purpose |
|-------|---------|
| `audit` | Orchestrator de auditoría de código |
| `audit-skills-*` | Sub-skills para cada principio SOLID, DRY, naming, etc. |
| `typescript-advanced-types` | TypeScript advanced patterns |
| `drizzle-orm` | Drizzle ORM best practices |
| `frontend-design` | UI creation |
| `impeccable` | UI critique y polish |
| `accessibility` | WCAG 2.2 compliance |
| `seo` | Search engine optimization |
| `tailwind-css-patterns` | Tailwind utility patterns |
| `emil-design-eng` | UI polish philosophy |
| `sdd-*` | Spec-Driven Development workflow |

### How to Load Skills

```
When the context matches a skill's trigger, load it FIRST via Skill tool:
- Skill: audit → run audit with relevant sub-skills
- Skill: typescript-advanced-types → check type safety
- etc.
```

## Conventions

### File Naming

- Components: `kebab-case.astro` (e.g., `resource-card.astro`)
- Utilities: `kebab-case.ts` (e.g., `result.ts`, `constants.ts`)
- Page directories: Spanish, mirrors URL (e.g., `pages/recursos/`)

### Code Style

- 2 spaces indentation
- Semicolons: no
- Quotes: single for strings
- Trailing commas: yes

### Git Commits

Conventional commits ONLY:

```
feat: add resource filtering
fix: resolve N+1 query in listResources
refactor: extract Result type to lib
docs: update API documentation
```

## Quality Gates

Antes de marcar un PR como "listo", verifico:

- [ ] No hay `any` en el código
- [ ] Todos los endpoints tienen validación Zod
- [ ] Los errores usan Result pattern
- [ ] Las queries usan índices apropiados
- [ ] Los componentes tienen tipos definidos
- [ ] Los tests pasan (`npm test`)
- [ ] El build compila (`npm run build`)

## Anti-Patterns (Stop Doing)

1. **`any` type** — Type safety es innegociable
2. **`console.error` en catch** — Usa Result pattern
3. **Global `db` singleton** — Pass como dependency
4. **Mixed concerns** — No lógica de negocio en pages/API
5. **Magic strings** — Extraer a constantes
6. **Inline styles** — Usar Tailwind classes
7. **`innerHTML` con datos de usuario** — XSS risk

---

**Este archivo es la fuente de verdad para el comportamiento de los agents.**
Actualizado: 2026-04-27