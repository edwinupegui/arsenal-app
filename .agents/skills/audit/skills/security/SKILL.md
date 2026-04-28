---
name: audit-skills-security
description: >
  Audit code for security vulnerabilities including SQL injection, XSS, CSRF, and input validation issues.
trigger: When auditing security, reviewing data validation, or ensuring safe data handling.
license: Apache-2.0
metadata:
  author: edwin-dev
  version: "1.0"
---

# Security Audit

## Overview

Security is NON-NEGOTIABLE. Every user input must be validated and sanitized.

## Critical Rules

### 1. SQL Injection Prevention

**arsenal-app uses Drizzle ORM** which provides parameterized queries by default. However, there are still patterns to avoid:

**Red Flags:**
```typescript
// ❌ NEVER - Raw SQL with template literals
const result = db.execute(sql`SELECT * FROM resources WHERE id = ${userInput}`);

// ❌ NEVER - String concatenation in SQL
const result = db.execute(`SELECT * FROM resources WHERE id = '${id}'`);

// ❌ NEVER - Dynamic column/table names
db.execute(`SELECT * FROM ${tableName}`);

// ❌ NEVER - Using user input in orderBy without validation
.orderBy(sql`${columnName}`); // Column name from user!
```

**Safe Patterns (Drizzle):**
```typescript
// ✅ SAFE - Parameterized by default
db.select().from(resources).where(eq(resources.id, userId));

// ✅ SAFE - Drizzle escapes values automatically
db.select().from(resources).where(like(resources.title, `%${searchQuery}%`));

// ✅ SAFE - Using Drizzle's sql helper for complex cases
import { sql } from 'drizzle-orm';
db.select().from(resources).where(sql`${resources.id} = ${userId}`);

// ✅ If you MUST use raw SQL, use parameterized queries
db.execute(sql`SELECT * FROM resources WHERE id = ${Number(userId)}`);
```

### 2. XSS Prevention

Astro/TypeScript projects must NEVER use user input in innerHTML.

**Red Flags:**
```typescript
// ❌ NEVER - innerHTML with user data
element.innerHTML = userInput;
document.getElementById('content').innerHTML = response.data;

// ❌ NEVER - dangerouslySetInnerHTML in React equivalents
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ❌ NEVER - Template literals with user data in HTML
const html = `<div>${userName}</div>`;
```

**Safe Patterns:**
```typescript
// ✅ ALWAYS - Use textContent for text
element.textContent = userInput;

// ✅ ALWAYS - Use Astro's interpolation for text
// In .astro files:
<span>{userName}</span>  // Safe - auto-escaped

// ✅ For HTML content from CMS/trusted sources, sanitize first
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(dirtyHTML);
```

### 3. Input Validation with Zod

All external input MUST be validated with Zod schemas.

**Red Flags:**
```typescript
// ❌ NEVER - Trusting user input
const { title, url } = await request.json();
db.insert(resources).values({ title, url }); // No validation!

// ❌ NEVER - Manual validation that can be bypassed
if (!body.title || !body.url) {
  throw new Error('Missing fields');
}

// ❌ NEVER - Validation in multiple places (DRY violation)
const isValid = validateResource(body); // Where does this come from?
```

**Safe Patterns:**
```typescript
// ✅ ALWAYS - Zod schema validation at API boundaries
import { z } from 'zod';

const CreateResourceSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url(),
  language: z.enum(['ES', 'EN']),
  type: z.enum(['video', 'article', 'tool', 'repo']),
  categoryId: z.number().int().positive(),
});

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  // Validate BEFORE processing
  const parsed = CreateResourceSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({
      error: 'Validation failed',
      details: parsed.error.flatten(),
    }), { status: 400 });
  }

  // Now use validated data
  const result = createResource(parsed.data);
  // ...
};
```

### 4. Type Coercion for IDs

URL parameters are strings. Always coerce to expected types.

**Red Flags:**
```typescript
// ❌ NEVER - Using string ID directly in database query
const resource = db.select().from(resources)
  .where(eq(resources.id, params.id)) // params.id is string!

// ❌ NEVER - Implicit coercion
const id = request.headers.get('x-user-id'); // string
db.select().from(resources).where(eq(resources.id, id)); // Type error but might work!
```

**Safe Patterns:**
```typescript
// ✅ ALWAYS - Explicit coercion
export const GET: APIRoute = async ({ params }) => {
  const id = Number(params.id);

  if (Number.isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid ID' }), { status: 400 });
  }

  const result = getResourceById(id);
  // ...
};
```

### 5. URL Validation

Validate URLs to prevent malicious data.

**Red Flags:**
```typescript
// ❌ NEVER - Accepting any URL without validation
const { website } = body;
db.insert(resources).values({ url: website }); // Could be javascript:alert()!

// ❌ NEVER - Using URL without protocol check
const url = new URL(website); // Could throw or be relative
```

**Safe Patterns:**
```typescript
// ✅ Using Zod URL validator
const ResourceSchema = z.object({
  url: z.string().url().startsWith('http'), // Must be HTTP(S)
});

// ✅ Manual validation with try/catch
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};
```

### 6. Rate Limiting (API Boundaries)

While not strictly code audit, note where rate limiting should exist.

**Places needing rate limiting:**
- `POST /api/resources` - Resource creation
- `GET /api/resources/search` - Search queries
- `POST /api/resources/:id/delete` - Deletions

### 7. Error Messages

Never leak internal details in error responses.

**Red Flags:**
```typescript
// ❌ NEVER - Leaking database errors
catch (e) {
  return new Response(JSON.stringify({
    error: `Database error: ${e.message}`,
    stack: e.stack, // NEVER!
  }));
}

// ❌ NEVER - Leaking file paths
error: 'Failed to open /app/src/config/secret.yaml'
```

**Safe Patterns:**
```typescript
// ✅ Generic error messages for clients
catch (e) {
  console.error('Internal error:', e); // Log internally
  return new Response(JSON.stringify({
    error: 'An unexpected error occurred',
  }), { status: 500 });
}
```

## Severity Scale

| Severity | Impact | Example |
|----------|--------|---------|
| **Critical** | Remote code execution, data breach | SQL injection, XSS |
| **Warning** | Information disclosure | Leaking error details |
| **Suggestion** | Hardening | URL validation |

## Audit Checklist

```
File: {path}
├── SQL: Using Drizzle parameterized queries?
├── XSS: No innerHTML with user data?
├── Validation: Zod schemas at API boundaries?
├── IDs: Explicit type coercion from strings?
├── URLs: Protocol validation?
├── Errors: Generic messages to clients?
└── Input: All external data validated before use?
```

## See Also

- **audit-skills-validation**: Zod schema patterns
- **drizzle-orm**: Safe query patterns