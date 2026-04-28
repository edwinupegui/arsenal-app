---
name: audit-skills-dependency-inversion
description: >
  Deep dive into Dependency Inversion Principle. Check for hardcoded dependencies and tight coupling.
trigger: When auditing DIP compliance or refactoring towards dependency injection.
license: Apache-2.0
metadata:
  author: edwin-dev
  version: "1.0"
---

# Dependency Inversion Principle (DIP) — Deep Dive

## Definition

1. High-level modules should not depend on low-level modules. Both should depend on abstractions.
2. Abstractions should not depend on details. Details should depend on abstractions.

**High-level = business rules | Low-level = database, I/O, external services**

## What to Audit

### 1. Direct Instantiation (new ClassName())

**Red Flag:**
```typescript
// src/lib/resources.ts
import { db } from '../db/index';

export function createResource(data: NewResource): Resource {
  // Direct dependency on concrete db
  const result = db.insert(resources).values({ ... }).returning().all();
  return result[0];
}

// If we switch from SQLite to PostgreSQL, must modify this code
```

**Fix:**
```typescript
// ✅ Depend on abstraction (type/interface)
interface Database {
  insert<T>(table: Table, values: T): QueryResult;
  select(): SelectQuery;
  // ... minimal interface needed
}

// Now can swap implementations
class SQLiteDatabase implements Database { ... }
class PostgreSQLDatabase implements Database { ... }

// High-level doesn't care which low-level
export class ResourceService {
  constructor(private db: Database) {}

  createResource(data: NewResource): Resource {
    return this.db.insert(resources, data).returning().all()[0];
  }
}
```

### 2. Static Coupling

**Red Flag:**
```typescript
// Global state coupling
import { db } from './db';

// ResourceService bound to this specific db instance
export const resourceService = {
  create: (data) => db.insert(resources).values(data),
  // ...
};
```

**Fix:**
```typescript
// Constructor injection
export class ResourceService {
  constructor(private db: Database) {}

  create(data: NewResource): Resource {
    return this.db.insert(resources, data).returning().all()[0];
  }
}

// Composition root (where dependencies are wired)
const db = new SQLiteDatabase();
const resourceRepo = new ResourceRepository(db);
const resourceService = new ResourceService(resourceRepo);
```

### 3. Hardcoded Environment References

**Red Flag:**
```typescript
// File: src/config.ts
export const CONFIG = {
  dbPath: './resources.db', // Hardcoded
  apiUrl: 'http://localhost:4321', // Hardcoded
};

// Everywhere this is used, it's coupled
class ResourceRepository {
  private db = new Database(CONFIG.dbPath); // Direct coupling
}
```

**Fix:**
```typescript
// Environment abstraction
interface Config {
  get(key: string): string;
}

class EnvConfig implements Config {
  get(key: string): string {
    return process.env[key] ?? '';
  }
}

class ResourceRepository {
  constructor(private config: Config) {
    this.db = new Database(config.get('DB_PATH'));
  }
}
```

## Current State in recursos-app

### Issue: Direct `db` Import

```typescript
// src/lib/resources.ts
import { db } from '../db/index';

export function listResources() {
  return db.select().from(resources).where(...);
}
```

The `listResources` function directly imports and uses the concrete `db` instance. While acceptable for small projects, this creates tight coupling.

### Issue: No Dependency Injection

```typescript
// Currently hard to test because:
// 1. db is a global singleton
// 2. Functions are standalone, not class methods
// 3. No way to inject mock db for testing

// To test listResources, must have real database
import { listResources } from './resources';

test('filters resources', () => {
  // Can we mock db? No, it's imported
  const result = listResources({ categoryId: 1 });
  // This hits real database!
});
```

### Refactor Path (Optional for Small Projects)

For a project this size, direct imports are acceptable. But if it grows:

```typescript
// src/lib/types.ts
export interface ResourceRepository {
  findAll(filters?: ResourceFilters): Resource[];
  findById(id: number): Resource | null;
  create(data: NewResource): Resource;
  // ...
}

// src/repositories/SQLiteResourceRepository.ts
export class SQLiteResourceRepository implements ResourceRepository {
  constructor(private db: Database) {}

  findAll(filters?: ResourceFilters): Resource[] {
    return this.db.select().from(resources).where(...).all();
  }
}

// src/services/ResourceService.ts
export class ResourceService {
  constructor(private repo: ResourceRepository) {}

  listResources(filters?: ResourceFilters): Resource[] {
    return this.repo.findAll(filters);
  }
}
```

## When DIP Might Be Overkill

For small projects like recursos-app:
- Direct imports are simpler
- Changing database is unlikely
- Testing with real db is acceptable with current test count

**Recommendation:** Keep current structure but extract to classes if project grows beyond current scope.

## Audit Questions

1. Does this code directly instantiate concrete classes?
2. Can I swap a dependency without modifying the dependent code?
3. Are there global singletons that create coupling?
4. Is testing this code difficult due to hard dependencies?

## See Also

- **SOLID audit**: Main audit skill
- **Patterns audit**: Repository pattern
- **SRP audit**: Separation of concerns