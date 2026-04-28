---
name: audit-skills-type-safety
description: >
  Audit code for TypeScript type safety violations. Detect 'any' usage, missing types, and improper type inference.
trigger: When auditing code quality, reviewing TypeScript strictness, or ensuring type safety.
license: Apache-2.0
metadata:
  author: edwin-dev
  version: "1.0"
---

# Type Safety Audit

## Overview

Type safety is NON-NEGOTIABLE. TypeScript's strict mode must be respected at all times.

## Critical Rules

### 1. NEVER Use `any`

**Red Flags:**
```typescript
// ❌ NEVER
const anything: any = something;
const category: any = await getCategory();
function foo(x) { return x.value; }
const result: any = await fetchData();

// ❌ Don't use 'any' in catch blocks
catch (e: any) { ... }

// ❌ Don't use 'any' for untyped data
const data: any = JSON.parse(response);

// ❌ Don't use 'any' to bypass type checking
array.filter((item: any) => ...);

// ✅ ALWAYS - use unknown for truly unknown data
const something: unknown = getSomething();
const category = await getCategory() as Category; // Only with explicit reason

// ✅ For catch blocks, use 'unknown'
catch (e: unknown) {
  if (e instanceof Error) {
    // Handle error properly
  }
}

// ✅ For JSON parsing, use proper types
const data = JSON.parse(response) as ExpectedType;
```

### 2. Use `unknown` for External Data

**Red Flags:**
```typescript
// ❌ Assuming external data is typed
const user = JSON.parse(localStorage.getItem('user')); // returns any

// ❌ Assuming API response is typed
const data = await fetch('/api/resource').then(r => r.json());
```

**Fix:**
```typescript
// ✅ Always type external data
interface StoredUser {
  id: number;
  name: string;
}
const user = JSON.parse(localStorage.getItem('user') ?? 'null') as StoredUser | null;

// ✅ Use Zod for runtime validation
import { z } from 'zod';
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
});
const user = UserSchema.parse(JSON.parse(localStorage.getItem('user') ?? 'null'));
```

### 3. Explicit Return Types for Public APIs

**Red Flags:**
```typescript
// ❌ Missing return types on exported functions
export function getResourceById(id) { ... }
export async function fetchResources() { ... }

// ✅ Always explicit return types
export function getResourceById(id: number): Result<Resource, AppError> { ... }
export async function fetchResources(): Promise<Result<Resource[], AppError>> { ... }
```

### 4. Proper Type Inference

**Red Flags:**
```typescript
// ❌ Type is inferred as 'any'
const result = db.select().from(resources).where(...);

// ❌ Don't rely on inference for complex types
const filtered = items.filter(x => x.value > 10); // type could be any[]

// ✅ Always cast when inference is unclear
const result = db
  .select()
  .from(resources)
  .where(eq(resources.id, id))
  .all() as Resource[];

// ✅ Explicit generic types
const filtered = items.filter((x): x is Item => x.value > 10);
```

### 5. Zod Schema Type Safety

**Red Flags:**
```typescript
// ❌ Using 'any' in Zod schemas
const schema = z.object({
  name: z.any(),
  value: z.any(),
});

// ❌ Parsing without type annotation
const data = schema.parse(unknownData);

// ✅ Proper Zod typing
const CreateResourceSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url(),
  language: z.enum(['ES', 'EN']),
});

// ✅ Extract type from schema
type CreateResourceInput = z.infer<typeof CreateResourceSchema>;
```

### 6. Component Props Type Safety

**Red Flags:**
```astro
---
// ❌ No types on Astro props
const { title, items } = Astro.props;
const handleClick = (e) => { ... }; // 'any' event
---

// ✅ Proper Astro prop types
---
interface Props {
  title: string;
  items: Item[];
}
const { title, items } = Astro.props as Props;

// ✅ Event handler types
const handleClick = (e: MouseEvent) => { ... };
---
```

## Severity Scale

| Severity | Impact | Example |
|----------|--------|---------|
| **Critical** | Defeats TypeScript purpose | `any` in production code |
| **Warning** | Potential type issues | Missing return types on exports |
| **Suggestion** | Minor improvements | Using `unknown` instead of `any` |

## Audit Checklist

```
File: {path}
├── any usage → Replace with unknown or proper type?
├── unknown for external data?
├── Return types on exports?
├── Type assertions where needed?
├── Zod schemas typed properly?
└── Component props typed?
```

## Current State in arsenal-app

### Issues to Fix

```typescript
// ❌ FOUND in src/services/ResourceService.ts (lines 46, 50)
listCategories(): Result<any[], AppError> {
getCategoryById(id: number): Result<any, AppError> {

// ✅ Should be
listCategories(): Result<Category[], AppError> {
getCategoryById(id: number): Result<Category, AppError> {
```

## See Also

- **typescript-advanced-types**: Advanced TypeScript patterns
- **audit-skills-error-handling**: Result pattern usage