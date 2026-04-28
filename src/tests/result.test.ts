import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr, map, mapErr, flatten, tryCatch } from '../lib/result';

describe('Result types', () => {
  describe('ok', () => {
    it('should create a success result', () => {
      const result = ok(42);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(42);
    });
  });

  describe('err', () => {
    it('should create an error result', () => {
      const result = err('something went wrong');
      expect(result.ok).toBe(false);
      expect(result.error).toBe('something went wrong');
    });
  });

  describe('isOk', () => {
    it('should return true for ok results', () => {
      expect(isOk(ok(42))).toBe(true);
    });
    it('should return false for err results', () => {
      expect(isOk(err('oops'))).toBe(false);
    });
  });

  describe('isErr', () => {
    it('should return false for ok results', () => {
      expect(isErr(ok(42))).toBe(false);
    });
    it('should return true for err results', () => {
      expect(isErr(err('oops'))).toBe(true);
    });
  });

  describe('map', () => {
    it('should transform the value of an ok result', () => {
      const result = map(ok(5), (n) => n * 2);
      expect(result).toEqual(ok(10));
    });
    it('should not transform an err result', () => {
      const result = map(err('error'), (n: number) => n * 2);
      expect(result).toEqual(err('error'));
    });
  });

  describe('mapErr', () => {
    it('should not transform an ok result', () => {
      const result = mapErr(ok(5), (e) => `Error: ${e}`);
      expect(result).toEqual(ok(5));
    });
    it('should transform the error of an err result', () => {
      const result = mapErr(err('error'), (e) => `Error: ${e}`);
      expect(result).toEqual(err('Error: error'));
    });
  });

  describe('flatten', () => {
    it('should flatten nested ok results', () => {
      const nested = ok(ok(42));
      expect(flatten(nested)).toEqual(ok(42));
    });
    it('should return err when outer is err', () => {
      const nested = err('outer');
      expect(flatten(nested)).toEqual(err('outer'));
    });
  });

  describe('tryCatch', () => {
    it('should return ok when function succeeds', () => {
      const result = tryCatch(() => 42, (e) => e);
      expect(result).toEqual(ok(42));
    });
    it('should return err when function throws', () => {
      const result = tryCatch(
        () => { throw new Error('fail'); },
        (e) => (e as Error).message
      );
      expect(result).toEqual(err('fail'));
    });
  });
});

describe('AppError factory functions', () => {
  it('should create notFoundError', () => {
    const error = { type: 'NOT_FOUND' as const, message: 'Resource with id 5 not found' };
    expect(error.type).toBe('NOT_FOUND');
    expect(error.message).toContain('5');
  });

  it('should create validationError', () => {
    const error = { type: 'VALIDATION_ERROR' as const, message: 'Invalid input', details: { field: 'email' } };
    expect(error.type).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual({ field: 'email' });
  });

  it('should create databaseError', () => {
    const error = { type: 'DATABASE_ERROR' as const, message: 'Connection failed' };
    expect(error.type).toBe('DATABASE_ERROR');
  });

  it('should create duplicateError', () => {
    const error = { type: 'DUPLICATE_ENTRY' as const, message: "url 'http://test.com' already exists" };
    expect(error.type).toBe('DUPLICATE_ENTRY');
    expect(error.message).toContain('url');
  });
});