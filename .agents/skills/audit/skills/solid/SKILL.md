---
name: audit-skills-solid
description: >
  Audit code against SOLID principles. Use when auditing, refactoring, or reviewing code quality.
trigger: When reviewing code for SOLID compliance or refactoring towards SOLID.
license: Apache-2.0
metadata:
  author: edwin-dev
  version: "1.0"
---

# SOLID Principles Audit

## Overview

SOLID is an acronym for five design principles intended to make software more maintainable and scalable.

| Principle | Acronym | Core Idea |
|-----------|---------|-----------|
| **S**ingle Responsibility | SRP | One class, one reason to change |
| **O**pen/Closed | OCP | Open for extension, closed for modification |
| **L**iskov Substitution | LSP | Subtypes must be substitutable for base types |
| **I**nterface Segregation | ISP | Prefer small, specific interfaces |
| **D**ependency Inversion | DIP | Depend on abstractions, not concretions |

## What to Audit

### 1. Single Responsibility Principle (SRP)

**Check:**
- Does each module/class have a single, well-defined purpose?
- Are there hidden responsibilities (e.g., a `ResourceService` that also sends emails)?
- Can you describe what a module does in one sentence without "and"?

**Red Flags:**
```typescript
// ❌ God module - multiple responsibilities
class ResourceManager {
  createResource() { ... }
  deleteResource() { ... }
  sendEmail() { ... }      // Email responsibility?
  generateReport() { ... } // Reporting responsibility?
  validateInput() { ... }  // Validation responsibility?
}

// ✅ Focused module
class ResourceRepository { create, read, update, delete }
class ResourceService { business logic only }
class EmailService { send emails only }
```

### 2. Open/Closed Principle (OCP)

**Check:**
- Can you add new features without modifying existing code?
- Are there switch/if-else chains that need modification for new types?
- Is logic scattered across multiple places for similar features?

**Red Flags:**
```typescript
// ❌ Must modify when adding new resource type
function getResourceTypeIcon(type: string): string {
  if (type === 'video') return '...';
  if (type === 'article') return '...';
  if (type === 'tool') return '...';
  if (type === 'repo') return '...';
  // Must add new case when new type added
}

// ✅ Open for extension via config/data
const RESOURCE_TYPE_CONFIG = {
  video: { icon: '...', label: 'Video' },
  article: { icon: '...', label: 'Article' },
  tool: { icon: '...', label: 'Tool' },
  repo: { icon: '...', label: 'Repo' },
};
// Add new type by adding entry, no code change
```

### 3. Liskov Substitution Principle (LSP)

**Check:**
- Can derived classes be used wherever base classes are expected?
- Are there type guards or instanceof checks that break substitution?
- Do derived classes strengthen preconditions or weaken postconditions?

**Red Flags:**
```typescript
// ❌ Violates LSP - subtype can't be used where base is expected
class Bird {
  fly() { /* ... */ }
}
class Penguin extends Bird {
  fly() { throw new Error('Cannot fly'); } // Breaks LSP!
}

// ✅ LSP compliant
interface Flyable { fly(): void }
class Bird implements Flyable { ... }
class Penguin {
  // Doesn't implement Flyable
  swim() { /* ... */ }
}
```

### 4. Interface Segregation Principle (ISP)

**Check:**
- Are there classes with methods they don't use?
- Is there a "fat interface" that forces implementation of unnecessary methods?

**Red Flags:**
```typescript
// ❌ Fat interface - implementing class forced to define unused methods
interface IMachine {
  print(): void;
  scan(): void;
  fax(): void;
}
class SimplePrinter implements IMachine {
  print() { /* ... */ }
  scan() { /* Not implemented */ } // ISP violation
  fax() { /* Not implemented */ } // ISP violation
}

// ✅ Segregated interfaces
interface Printer { print(): void }
interface Scanner { scan(): void }
class SimplePrinter implements Printer { ... }
```

### 5. Dependency Inversion Principle (DIP)

**Check:**
- Do high-level modules depend on low-level modules?
- Are there direct instantiations of concrete classes (new ClassName())?
- Would swapping a module require modifying the dependent code?

**Red Flags:**
```typescript
// ❌ High-level depends on low-level concrete
class ResourceService {
  private db = new SQLiteDatabase(); // Direct instantiation
  save() {
    const db = new SQLiteDatabase(); // Hard dependency
    // ...
  }
}

// ✅ DIP - depend on abstractions
interface Database {
  query(sql: string): Result;
}
class ResourceService {
  constructor(private db: Database) {} // Injected dependency
  // Can swap SQLite for PostgreSQL without changing ResourceService
}
```

## Audit Checklist

Run through each file and check:

```
File: src/lib/resources.ts
├── SRP: Does this module have single responsibility?
│   └── Functions: listResources, createResource, getResourceById, etc.
│       → Business: YES (data access)
│       → Email/validation/reporting: NO
├── OCP: Is this open for extension?
│   └── Can I add new filters without modifying existing code?
│       → Currently: if/else chain for each filter → NOT OCP
├── LSP: N/A (no inheritance hierarchies)
├── ISP: N/A (no interfaces defined)
├── DIP: Does this depend on abstractions?
│   └── db imported directly → LOW-LEVEL CONCRETE
└── Issues found: [list]
```

## Finding Severity

| Severity | Description | Example |
|----------|-------------|---------|
| **Critical** | Breaks the principle, causes bugs | Penguin.fly() throwing |
| **Warning** | Violation detected, refactor recommended | typeIcons Record instead of config |
| **Suggestion** | Could be more SOLID | Better naming, small refactors |

## References

See `../references/` for detailed examples and diagrams.