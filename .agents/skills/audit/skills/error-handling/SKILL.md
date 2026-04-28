---
name: audit-skills-error-handling
description: >
  Audit code for proper error handling using the Result pattern. Check for silent failures, unhandled exceptions, and missing error propagation.
trigger: When auditing error handling, reviewing exception management, or ensuring proper error propagation.
license: Apache-2.0
metadata:
  author: edwin-dev
  version: "1.0"
---

# Error Handling Audit

## Overview

arsenal-app uses the **Result pattern** for error handling. All errors must be explicitly typed and propagated, never silently caught.

## The Result Pattern (arsenal-app Standard)

```typescript
// src/lib/result.ts exports:
type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

// Helper types
type AppError =
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'VALIDATION_ERROR'; message: string; details?: unknown }
  | { type: 'DATABASE_ERROR'; message: string }
  | { type: 'DUPLICATE_ENTRY'; message: string }
  | { type: 'UNKNOWN'; message: string };

// Constructors
ok<T>(value: T): Result<T, AppError>
err<E>(error: E): Result<T, AppError>
```

## What to Audit

### 1. NEVER Return `null` or `undefined` for Errors

**Red Flags:**
```typescript
// ❌ NEVER - Silent failure
function getResourceById(id: number): Resource | null {
  const result = db.select().from(resources).where(eq(resources.id, id)).get();
  return result ?? null; // Silent failure!
}

// ❌ NEVER - null check without error
if (!resource) {
  return null; // Caller doesn't know why it failed
}

// ✅ ALWAYS - Use Result
function getResourceById(id: number): Result<Resource, AppError> {
  const result = db.select().from(resources).where(eq(resources.id, id)).get();
  if (!result) {
    return err(notFoundError('Resource', id));
  }
  return ok(result);
}
```

### 2. NEVER Catch Without Propagating

**Red Flags:**
```typescript
// ❌ NEVER - Silent catch
try {
  const result = await db.select().from(resources).all();
  return result;
} catch (e) {
  console.error('Database error:', e); // Silent failure!
  return null;
}

// ❌ NEVER - Catch without proper error type
catch (e) {
  return null;
}

// ❌ NEVER - Using console.error
catch (e) {
  console.error(e); // Anti-pattern!
  throw e; // Don't rethrow without context
}

// ✅ ALWAYS - Propagate via Result
try {
  const result = await db.select().from(resources).all();
  return ok(result);
} catch (e: unknown) {
  return err(databaseError(`Failed to fetch resources: ${e}`));
}
```

### 3. NEVER Use `console.error` in Catch

**Red Flags:**
```typescript
// ❌ NEVER
catch (e) {
  console.error('Error:', e);
}

// ❌ NEVER
catch (e) {
  console.error(e);
}
```

**Fix:**
```typescript
// ✅ Log at boundary layer only (API routes)
catch (e: unknown) {
  console.error('API Error:', e);
  return err(databaseError('Internal server error'));
}
```

### 4. Always Handle Result Types at Boundaries

**Red Flags:**
```typescript
// ❌ In API route - not checking Result
const resource = getResourceById(id);
return new Response(JSON.stringify(resource)); // Returns error object directly!

// ❌ Ignoring the error
const result = createResource(data);
doSomethingWithResource(result.value); // Crash if error!

// ❌ No error handling at all
const resources = listResources();
resources.forEach(r => render(r)); // What if error?
```

**Fix:**
```typescript
// ✅ In API route
const result = getResourceById(id);
if (!result.ok) {
  return new Response(JSON.stringify({ error: result.error.message }), {
    status: getStatusCode(result.error.type),
  });
}
return new Response(JSON.stringify(result.value));

// ✅ Using isOk/isErr guards
if (isErr(result)) {
  // Handle error case
  return err(result.error);
}
// Continue with result.value

// ✅ Using early return
const result = listResources();
if (isErr(result)) {
  return result; // Propagate error
}
```

### 5. Error Type Narrowing

**Red Flags:**
```typescript
// ❌ Using 'any' in catch
catch (e: any) {
  if (e.message.includes('UNIQUE')) {
    return err(duplicateError('url', data.url));
  }
}

// ❌ Type narrowing without proper checks
catch (e) {
  if (e.message) { // Error: 'e' is 'unknown'
    // ...
  }
}
```

**Fix:**
```typescript
// ✅ Using 'unknown' with proper narrowing
catch (e: unknown) {
  if (e instanceof Error) {
    if (e.message.includes('UNIQUE')) {
      return err(duplicateError('url', data.url));
    }
  }
  return err(databaseError(`Operation failed: ${e}`));
}

// ✅ Or use the tryCatch helper
const result = tryCatch(
  () => db.select().from(resources).all(),
  (e: unknown) => databaseError(`Failed: ${e}`)
);
```

### 6. API Route Error Handling

**Red Flags:**
```typescript
// ❌ Not handling errors in API
export const GET: APIRoute = async ({ params }) => {
  const resource = getResourceById(Number(params.id));
  return new Response(JSON.stringify(resource));
};

// ❌ Wrong status codes for errors
if (!resource) {
  return new Response('Not found', { status: 200 }); // Should be 404!
}
```

**Fix:**
```typescript
// ✅ Proper API error handling
export const GET: APIRoute = async ({ params }) => {
  const result = getResourceById(Number(params.id));

  if (isErr(result)) {
    const status = result.error.type === 'NOT_FOUND' ? 404 : 500;
    return new Response(JSON.stringify({ error: result.error.message }), {
      status,
    });
  }

  return new Response(JSON.stringify(result.value));
};

// ✅ Using switch for multiple error types
if (isErr(result)) {
  switch (result.error.type) {
    case 'NOT_FOUND':
      return notFound(res.result.error.message);
    case 'VALIDATION_ERROR':
      return badRequest(result.error.message);
    case 'DATABASE_ERROR':
      return serverError(result.error.message);
    default:
      return serverError('Unknown error');
  }
}
```

## Severity Scale

| Severity | Impact | Example |
|----------|--------|---------|
| **Critical** | Silent failures, data loss | `return null` instead of error |
| **Warning** | Unclear error flow | `catch (e: any)` without narrowing |
| **Suggestion** | Inconsistent patterns | Not using `isOk`/`isErr` guards |

## Current Issues in arsenal-app

```typescript
// ❌ FOUND in src/services/ResourceService.ts
listCategories(): Result<any[], AppError> { // 'any' type!
getCategoryById(id: number): Result<any, AppError> { // 'any' type!
```

## Audit Checklist

```
File: {path}
├── Return types use Result pattern?
├── No null returns for error cases?
├── No console.error in catch blocks?
├── Errors propagated to caller?
├── API routes handle Result errors?
├── Catch blocks use 'unknown' with narrowing?
└── No silent failures?
```

## See Also

- **audit-skills-type-safety**: Type safety in error handling
- **src/lib/result.ts**: Result pattern implementation