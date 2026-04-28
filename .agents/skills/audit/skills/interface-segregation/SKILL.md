---
name: audit-skills-interface-segregation
description: >
  Deep dive into Interface Segregation Principle. Check for fat interfaces and unnecessary dependencies.
trigger: When auditing ISP compliance or refactoring large interfaces.
license: Apache-2.0
metadata:
  author: edwin-dev
  version: "1.0"
---

# Interface Segregation Principle (ISP) — Deep Dive

## Definition

Clients should not be forced to depend on methods they do not use.

**Prefer many small, specific interfaces over one large, general-purpose interface.**

## What to Audit

### 1. Fat Interfaces

**Red Flag:**
```typescript
// One interface to rule them all
interface IResourceOperations {
  create(data: NewResource): Resource;
  read(id: number): Resource | null;
  update(id: number, data: Partial<NewResource>): Resource | null;
  delete(id: number): boolean;
  search(query: string): Resource[];
  listByCategory(categoryId: number): Resource[];
  listByLanguage(language: string): Resource[];
  count(): number;
  // ... grows and grows
}

// A simple read-only utility has to implement all of this
class ResourceStats {
  // Only needs count() and search()
  // But forced to implement all other methods → ISP violation
}
```

**Fix:**
```typescript
// Segregated interfaces
interface ResourceReader {
  findById(id: number): Resource | null;
  findAll(filters: ResourceFilters): Resource[];
}

interface ResourceWriter {
  create(data: NewResource): Resource;
  update(id: number, data: Partial<NewResource>): Resource | null;
  delete(id: number): boolean;
}

interface ResourceSearch extends ResourceReader {
  search(query: string): Resource[];
}

// Compose as needed
class StatsService implements ResourceReader {
  count(filters: ResourceFilters): number { ... }
}
```

### 2. Classes Forced to Implement Unused Methods

**Red Flag:**
```typescript
interface IPersistable {
  save(): void;
  load(): void;
  delete(): void;
  backup(): void;
}

// Only needs save and load
class Logger implements IPersistable {
  save() { /* ... */ }
  load() { /* ... */ }
  delete() { throw new Error('Not implemented'); } // ISP violation
  backup() { throw new Error('Not implemented'); } // ISP violation
}
```

**Fix:**
```typescript
interface Saveable { save(): void }
interface Loadable { load(): void }

class Logger implements Saveable, Loadable {
  save() { /* ... */ }
  load() { /* ... */ }
}
```

### 3. Too Many Methods in TypeScript Interface

**Red Flag:**
```typescript
// src/lib/resources.ts - growing interface
interface ResourceOperations {
  listResources(filters?: ResourceFilters): Resource[];
  listDeletedResources(): Resource[];
  getResourceById(id: number): Resource | null;
  getResourceByUrl(url: string): Resource | null;
  createResource(data: NewResource): Resource;
  updateResource(id: number, data: Partial<NewResource>): Resource | null;
  softDeleteResource(id: number): boolean;
  restoreResource(id: number): boolean;
  permanentDeleteResource(id: number): boolean;
  // ... 11 methods
}
```

**Fix:** Split into focused interfaces:

```typescript
interface ResourceReader {
  findAll(filters: ResourceFilters): Resource[];
  findDeleted(): Resource[];
  findById(id: number): Resource | null;
  findByUrl(url: string): Resource | null;
}

interface ResourceWriter {
  create(data: NewResource): Resource;
  update(id: number, data: Partial<NewResource>): Resource | null;
}

interface ResourceDeleter {
  softDelete(id: number): boolean;
  restore(id: number): boolean;
  permanentDelete(id: number): boolean;
}

// Implementation chooses what to implement
class ResourceRepository implements ResourceReader, ResourceWriter, ResourceDeleter {
  // Full CRUD
}
```

## Current State in recursos-app

### No Explicit Interfaces

The current codebase uses plain functions in `src/lib/resources.ts`. While not an ISP violation per se, it's worth considering if the module grows.

### Potential Future ISP Issues

As features grow:
- Don't add `EmailService`, `SmsService`, `PushService` all to one `NotificationService`
- Don't add `generatePDF`, `generateCSV`, `generateHTML` to one `ReportGenerator`
- Don't add persistence, validation, and formatting to one `ResourceFormatter`

### The Power of Interfaces in TypeScript

```typescript
// TypeScript's implicit interface usage
// src/lib/types.ts
export interface ResourceRepository {
  findAll(filters?: ResourceFilters): Resource[];
  findById(id: number): Resource | null;
  create(data: NewResource): Resource;
  update(id: number, data: Partial<NewResource>): Resource | null;
  delete(id: number): boolean;
}

// Now services depend on interface, not implementation
class ResourceService {
  constructor(private repo: ResourceRepository) {}
}

// Easy to mock for testing
const mockRepo: ResourceRepository = {
  findAll: () => testData,
  // ...
};
```

## Audit Questions

1. Does this interface have methods that implementing classes don't use?
2. Could the interface be split into smaller, more focused interfaces?
3. Are there classes that implement an interface but throw "not implemented"?
4. Do clients depend on interfaces they don't use all methods of?

## See Also

- **SOLID audit**: Main audit skill
- **Dependency inversion**: Depend on interfaces, not implementations