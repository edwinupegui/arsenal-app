---
name: audit
description: >
  Code audit skill for arsenal-app. Analyzes code quality against Type Safety, SOLID, DRY, Error Handling, Security, Performance, Naming, Patterns, and Anti-patterns.
  Trigger: When auditing code, reviewing refactors, or applying the roadmap.
license: Apache-2.0
metadata:
  author: edwin-dev
  version: "2.0"
---

# Audit Skill — Code Quality Auditor

## Purpose

This skill orchestrates code audits for `arsenal-app` using specialized sub-skills.
Each sub-skill focuses on a specific quality dimension. Results are synthesized into actionable findings.

## Sub-Skills Architecture

```
audit/
├── SKILL.md              # This file — orchestrator
└── skills/
    ├── type-safety/           # TypeScript strict typing (any, unknown, etc.)
    ├── error-handling/        # Result pattern usage
    ├── security/             # SQL injection, XSS, input validation
    ├── performance/           # N+1 queries, indexes, pagination
    ├── dry/                  # Don't Repeat Yourself
    ├── naming/               # Naming conventions
    ├── patterns/             # Repository, Service, Factory usage
    ├── anti-patterns/        # God objects, shotgun surgery
    ├── solid/                # Single Responsibility, OCP, LSP, ISP, DIP
    ├── single-responsibility/ # SRP deep-dive
    ├── open-closed/          # OCP deep-dive
    ├── liskov/               # LSP deep-dive
    ├── interface-segregation/ # ISP deep-dive
    └── dependency-inversion/ # DIP deep-dive
```

## Audit Dimensions

### Priority Order (Precedence)

| Priority | Dimension | Sub-skill | What to Check |
|----------|-----------|-----------|---------------|
| **1** | **Type Safety** | `audit-skills-type-safety` | No `any`, strict typing, `unknown` for external data |
| **2** | **SOLID** | `audit-skills-solid` | All 5 principles |
| **3** | **DRY** | `audit-skills-dry` | Duplication, magic strings, repeated logic |
| **4** | **Error Handling** | `audit-skills-error-handling` | Result pattern, no silent failures |
| **5** | **Security** | `audit-skills-security` | SQL injection, XSS, Zod validation |
| **6** | **Performance** | `audit-skills-performance` | N+1 queries, indexes, pagination |
| **7** | **Naming** | `audit-skills-naming` | File names, variables, functions |
| **8** | **Patterns** | `audit-skills-patterns` | Repository, Service, Factory |
| **9** | **Anti-patterns** | `audit-skills-anti-patterns` | God objects, shotgun surgery |

### Type Safety (CRITICAL — No Exceptions)

```typescript
// ❌ NEVER
const anything: any = something;
const category: any = await getCategory();

// ✅ ALWAYS
const something: unknown = getSomething();
const category: Category = await getCategory();
```

### Error Handling (CRITICAL — Result Pattern)

```typescript
// ❌ NEVER
function getResource(): Resource | null { ... }
try { ... } catch (e) { console.error(e); }

// ✅ ALWAYS
function getResource(): Result<Resource, AppError> { ... }
```

### Security (CRITICAL)

```typescript
// ❌ NEVER - XSS vulnerable
element.innerHTML = userInput;

// ❌ NEVER - Raw SQL
db.execute(`SELECT * FROM ${table}`);

// ✅ ALWAYS - Safe DOM, parameterized queries
element.textContent = userInput;
db.select().from(resources).where(eq(resources.id, id));
```

## Audit Workflow

### 1. Scope the audit

Identify files to audit based on the task:
- **Full audit**: All `src/` files
- **Module audit**: Specific module (e.g., `src/lib/recursos.ts`)
- **Component audit**: Specific component (e.g., `ResourceCard.astro`)
- **API audit**: All API routes in `src/pages/api/`

### 2. Run dimension checks in priority order

```
1. Load audit-skills-type-safety → check for 'any', unknown usage
2. Load audit-skills-error-handling → check Result pattern
3. Load audit-skills-security → check SQL injection, XSS, validation
4. Load audit-skills-performance → check queries, indexes
5. Load audit-skills-solid → check all 5 principles
6. Load audit-skills-dry → check duplication
7. Load audit-skills-patterns → check pattern usage
8. Load audit-skills-anti-patterns → check code smells
9. Load audit-skills-naming → check conventions
```

### 3. Synthesize findings

Group findings by severity:

- **Critical**: Breaking patterns, security issues, type safety violations
- **Warning**: SOLID violations, significant duplication, performance issues
- **Suggestion**: Minor improvements, consistency updates

### 4. Report format

```markdown
## Audit Report: {scope}

### Summary
- Files audited: {N}
- Critical issues: {N}
- Warnings: {N}
- Suggestions: {N}

### Critical Issues

1. **{file:line}** — Type safety: `any` usage
   - Found: `const category: any = await getCategory()`
   - Fix: Use proper type or `unknown`

2. **{file:line}** — Error handling: Silent failure
   - Found: `catch (e) { console.error(e); return null; }`
   - Fix: Return `Result<T, AppError>` type

3. **{file:line}** — Security: Potential XSS
   - Found: `element.innerHTML = userInput`
   - Fix: Use `element.textContent = userInput`

### Warnings

1. **{file}** — DRY: Magic strings repeated 5 times
   - Fix: Extract to `src/lib/constants.ts`

2. **{file}** — Performance: N+1 query detected
   - Fix: Use JOIN or Drizzle relations

### Suggestions

1. **{file}** — Naming: `getResourceById` should be `findById`
2. **{file}** — Consider using `readonly` modifier

### Next Action
{Recommended first refactor step based on priority}
```

## Quick Reference

| Check | Command |
|-------|---------|
| List all sub-skills | `ls .agents/skills/audit/skills/` |
| Load specific skill | `Skill` tool → `audit-skills-{name}` |
| Run full audit | Delegate to `sdd-explore` with `audit` context |
| Type safety issues | Search: `:\s*any\b` in TypeScript files |
| Error handling | Search: `console\.error` or `catch.*return null` |
| Security | Search: `innerHTML` in codebase |

## Applying Audit Findings

When refactoring based on audit:

1. Start with Critical findings (type safety, error handling, security)
2. Follow the priority order listed above
3. Load relevant sub-skill before each refactor step
4. Verify each fix doesn't break existing tests

## Related Skills

- **sdd-* skills**: Use SDD workflow for implementing fixes found by audit
- **typescript-advanced-types**: For type-safe refactors
- **drizzle-orm**: For query optimization context
- **impeccable**: For UI component audits

---

**Sub-skills**: Load via Skill tool with `audit-skills-{name}` (e.g., `audit-skills-type-safety`).