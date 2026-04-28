---
name: audit-skills-liskov
description: >
  Deep dive into Liskov Substitution Principle. Check if subtypes can replace base types.
trigger: When auditing LSP compliance or refactoring inheritance hierarchies.
license: Apache-2.0
metadata:
  author: edwin-dev
  version: "1.0"
---

# Liskov Substitution Principle (LSP) — Deep Dive

## Definition

Let q(x) be a property provable about objects x of type T.
Then q(y) should be provable for objects y of type S where S is a subtype of T.

**In simpler terms:** Objects of a superclass should be replaceable with objects of a subclass without breaking the application.

## What to Audit

### 1. Breaking Behavior

**Red Flag:**
```typescript
class Bird {
  fly(): void { /* ... */ }
}

class Penguin extends Bird {
  fly(): void {
    throw new Error('Penguins cannot fly'); // LSP VIOLATION!
  }
}

// If code expects Bird and gets Penguin, it will crash
function makeBirdFly(bird: Bird) {
  bird.fly(); // Throws for Penguin!
}
```

**Fix:**
```typescript
// Option 1: Don't inherit if behavior incompatible
class Bird {
  // Empty base, or common behavior
}

class FlyingBird extends Bird {
  fly(): void { /* ... */ }
}

class Penguin extends Bird {
  swim(): void { /* ... */ }
  // No fly() method at all
}

// Option 2: Use composition over inheritance
interface Flyable { fly(): void }
class FlyingBird implements Flyable { fly(): void { /* ... */ } }
```

### 2. Strengthening Preconditions

**Red Flag:**
```typescript
class Rectangle {
  setWidth(w: number): void { this.width = w; }
  setHeight(h: number): void { this.height = h; }
}

class Square extends Rectangle {
  setWidth(w: number): void {
    this.width = w;
    this.height = w; // Stronger precondition: w must equal h
  }
  // LSP violation: caller expects width to be independent
}
```

### 3. Weakening Postconditions

**Red Flag:**
```typescript
class FileOperation {
  close(): void { /* closes and flushes */ }
}

class InMemoryOperation extends FileOperation {
  close(): void {
    // Weakens postcondition: no flush needed
    // but caller might expect flush
  }
}
```

### 4. Type Guards and instanceof

**Red Flag:**
```typescript
function processBird(bird: Bird) {
  if (bird instanceof Penguin) {
    // Penguin-specific logic
    // This suggests inheritance is wrong
  }
  // ...
}
```

## Current State in recursos-app

### No Inheritance Hierarchies

Currently recursos-app doesn't have class inheritance:
- Schema uses Drizzle Table objects
- Functions operate on plain data
- No polymorphic behavior

This is actually fine — simpler is better.

### What to Watch For

When adding new features, avoid:

```typescript
// ❌ Don't add inheritance that violates LSP
class BaseRecurso {
  validate(): boolean { ... }
}

class VideoRecurso extends BaseRecurso {
  validate(): boolean {
    // Cannot validate if no video URL
    // LSP violation if parent allows no URL
  }
}
```

### Prefer Composition

```typescript
// ✅ LSP-safe pattern
interface Validatable {
  validate(): ValidationResult;
}

interface Timestampable {
  createdAt: Date;
  updatedAt: Date;
}

// Compose as needed
type VideoRecurso = Validatable & Timestampable & {
  videoUrl: string;
};
```

## Audit Questions

1. Can I use any derived class where the base class is expected?
2. Do derived classes strengthen preconditions?
3. Do derived classes weaken postconditions?
4. Are there instanceof checks that signal wrong abstraction?

## See Also

- **SOLID audit**: Main audit skill
- **Interface segregation**: Small interfaces prevent LSP issues