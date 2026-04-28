/**
 * Result/Either type for structured error handling.
 * Avoids null returns and provides type-safe error propagation.
 */

/** Success variant */
export type Ok<T> = { ok: true; value: T };

/** Error variant with typed error */
export type Err<E> = { ok: false; error: E };

/** Result type - either success with value or failure with error */
export type Result<T, E = string> = Ok<T> | Err<E>;

// Constructor functions
export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

// Type guards
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> =>
  result.ok === true;

export const isErr = <T, E>(result: Result<T, E>): result is Err<E> =>
  result.ok === false;

// Map success value
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> =>
  isOk(result) ? ok(fn(result.value)) : result;

// Map error value
export const mapErr = <T, E, U>(
  result: Result<T, E>,
  fn: (error: E) => U
): Result<T, U> =>
  isErr(result) ? err(fn(result.error)) : result;

// Flatten nested Result
export const flatten = <T, E>(result: Result<Result<T, E>, E>): Result<T, E> =>
  isErr(result) ? result : result.value;

// Execute a function that might throw, converting to Result
export const tryCatch = <T, E>(
  fn: () => T,
  catchFn: (e: unknown) => E
): Result<T, E> => {
  try {
    return ok(fn());
  } catch (e) {
    return err(catchFn(e));
  }
};

// Common error types for this app
export type AppError =
  | { type: 'NOT_FOUND'; message: string }
  | { type: 'VALIDATION_ERROR'; message: string; details?: unknown }
  | { type: 'DATABASE_ERROR'; message: string }
  | { type: 'DUPLICATE_ENTRY'; message: string }
  | { type: 'UNKNOWN'; message: string };

export const notFoundError = (entity: string, id?: number | string): AppError => ({
  type: 'NOT_FOUND',
  message: id ? `${entity} with id ${id} not found` : `${entity} not found`,
});

export const validationError = (message: string, details?: unknown): AppError => ({
  type: 'VALIDATION_ERROR',
  message,
  details,
});

export const databaseError = (message: string): AppError => ({
  type: 'DATABASE_ERROR',
  message,
});

export const duplicateError = (field: string, value: string): AppError => ({
  type: 'DUPLICATE_ENTRY',
  message: `${field} '${value}' already exists`,
});