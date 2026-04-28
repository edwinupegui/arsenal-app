---
name: audit-skills-performance
description: >
  Audit code for performance issues including N+1 queries, missing indexes, unoptimized queries, and unnecessary operations.
trigger: When auditing performance, reviewing database queries, or optimizing slow operations.
license: Apache-2.0
metadata:
  author: edwin-dev
  version: "1.0"
---

# Performance Audit

## Overview

Performance matters. Watch for N+1 queries, missing indexes, and unoptimized operations.

## What to Audit

### 1. N+1 Query Detection

**Red Flags:**
```typescript
// ❌ NEVER - N+1 query
const resources = db.select().from(resources).all();
const result = resources.map(r => {
  const category = db.select().from(categories)
    .where(eq(categories.id, r.categoryId)).get();
  return { ...r, category };
});

// ❌ NEVER - Query in loop
for (const id of ids) {
  const resource = db.select().from(resources).where(eq(resources.id, id)).get();
  // ...
}
```

**Safe Patterns:**
```typescript
// ✅ Use JOIN or relations for associated data
import { relations } from 'drizzle-orm';

// Define relations once
export const resourcesRelations = relations(resources, ({ one }) => ({
  category: one(categories, {
    fields: [resources.categoryId],
    references: [categories.id],
  }),
}));

// Query with relations
const resourcesWithCategory = await db.query.resources.findMany({
  with: { category: true },
});
```

### 2. Index Usage

**Red Flags:**
```typescript
// ❌ Query without index on filtered column
db.select().from(resources).where(eq(resources.url, value)); // url should be indexed

// ❌ LIKE search on large table without FTS
db.select().from(resources)
  .where(like(resources.title, `%${query}%`)); // Full table scan!
```

**Safe Patterns:**
```typescript
// ✅ Define indexes in schema
export const resources = sqliteTable('resources', {
  // ...
  url: text('url').notNull(), // Drizzle creates index for unique columns
}, (table) => ({
  // Explicit index for frequently queried columns
  categoryIdx: index('category_idx').on(table.categoryId),
  languageIdx: index('language_idx').on(table.language),
  typeIdx: index('type_idx').on(table.type),
}));
```

### 3. Query Optimization

**Red Flags:**
```typescript
// ❌ Selecting all columns when you need fewer
db.select().from(resources).where(...).all(); // SELECT *

// ❌ Multiple queries when one would do
const resource = db.select().from(resources).where(eq(resources.id, id)).get();
const category = db.select().from(categories).where(eq(categories.id, resource.categoryId)).get();

// ❌ Not using LIMIT for potentially large results
db.select().from(resources).where(...).all(); // Could return thousands!
```

**Safe Patterns:**
```typescript
// ✅ Select only needed columns
const result = db
  .select({
    id: resources.id,
    title: resources.title,
    url: resources.url,
  })
  .from(resources)
  .where(eq(resources.id, id))
  .get();

// ✅ Always paginate large result sets
const PAGE_SIZE = 20;
const result = db
  .select()
  .from(resources)
  .limit(PAGE_SIZE)
  .offset(page * PAGE_SIZE)
  .all();

// ✅ Use count for pagination
const total = db.$count(resources, whereClause);
```

### 4. Unnecessary Operations

**Red Flags:**
```typescript
// ❌ Double execution
db.select().from(resources).where(...).all(); // Executed
db.select().from(resources).where(...).all(); // Executed again

// ❌ Unnecessary array operations
const result = db.select().from(resources).all();
const sorted = result.sort((a, b) => a.title.localeCompare(b.title)); // DB should sort

// ❌ Creating objects just to destructure
const { id, title } = { id: 1, title: 'Test' };
```

**Safe Patterns:**
```typescript
// ✅ Execute once
const result = db.select().from(resources).where(...).all();

// ✅ Let the database sort
db.select()
  .from(resources)
  .orderBy(asc(resources.title)) // Database sorts efficiently
  .all();
```

### 5. Soft Delete Performance

**arsenal-app uses soft deletes** — watch for queries that don't filter deleted records.

**Red Flags:**
```typescript
// ❌ NOT filtering deleted records
db.select().from(resources).where(eq(resources.id, id)).get();

// ❌ Forgetting soft delete filter in search
db.select().from(resources)
  .where(like(resources.title, `%${query}%`))
  .all(); // Includes deleted records!
```

**Safe Patterns:**
```typescript
// ✅ Always filter deletedAt
import { isNull } from 'drizzle-orm';

db.select()
  .from(resources)
  .where(and(
    isNull(resources.deletedAt),
    eq(resources.id, id)
  ))
  .get();

// ✅ Extract to repository method
findById(id: number): Result<Resource, AppError> {
  return db.select()
    .from(resources)
    .where(and(
      isNull(resources.deletedAt),
      eq(resources.id, id)
    ))
    .get();
}
```

### 6. Connection Management

**Red Flags:**
```typescript
// ❌ Creating new connection per request
const db = new Database('sqlite.db'); // Per-request connection!

// ❌ Not using transactions for multi-step operations
await db.insert(resources).values(data);
await db.insert(tags).values(tagsData); // If this fails, inconsistent state!
```

**Safe Patterns:**
```typescript
// ✅ Use singleton connection (arsenal-app pattern)
import { db } from '../db/index'; // Single instance

// ✅ Use transactions for multi-step operations
await db.transaction(async (tx) => {
  await tx.insert(resources).values(data);
  await tx.insert(tags).values(tagsData);
  // Auto-rollback on error
});
```

### 7. FTS (Full-Text Search) for Text Search

**Red Flags:**
```typescript
// ❌ LIKE with wildcards on large tables
db.select().from(resources)
  .where(like(resources.title, `%${query}%`)); // Slow on 10k+ rows
```

**Safe Patterns:**
```typescript
// ✅ For small tables, LIKE is fine
// ✅ For large tables, use FTS5
// src/db/schema.ts
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const resourcesFts = sqliteTable('resources_fts', {
  title: text('title'),
  description: text('description'),
});

// Search using FTS
const results = db.execute(
  sql`SELECT * FROM resources_fts WHERE resources_fts MATCH ${query}`
);
```

## Performance Checklist

```
File: {path}
├── N+1: Any queries inside loops?
├── Indexes: Are filtered columns indexed?
├── SELECT: Selecting only needed columns?
├── Pagination: Large result sets paginated?
├── Soft delete: deletedAt filtered?
├── Transactions: Multi-step operations atomic?
└── LIKE: Full-text search on large tables?
```

## Severity Scale

| Severity | Impact | Example |
|----------|--------|---------|
| **Critical** | Performance degradation | N+1 in list of 1000 items |
| **Warning** | Scalability issues | Missing index on filtered column |
| **Suggestion** | Optimization | Selecting * when you need 2 columns |

## See Also

- **drizzle-orm/references/performance.md**: Drizzle-specific performance
- **drizzle-orm/references/query-patterns.md**: Query optimization patterns