import { logger, type LogContext } from "@/lib/logger";

/**
 * Application-level error with a stable code and optional structured context.
 * Use this (or subclasses) at boundaries so failures are typed and logged consistently.
 */
export class AppError extends Error {
  readonly code: string;
  readonly context?: LogContext;

  constructor(code: string, message: string, options?: { cause?: unknown; context?: LogContext }) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "AppError";
    this.code = code;
    this.context = options?.context;
  }
}

/** Validation failure at an external boundary (e.g. Zod parse failed). */
export class ValidationError extends AppError {
  constructor(message: string, options?: { cause?: unknown; context?: LogContext }) {
    super("VALIDATION_ERROR", message, options);
    this.name = "ValidationError";
  }
}

/** A requested resource does not exist. */
export class NotFoundError extends AppError {
  constructor(message: string, options?: { context?: LogContext }) {
    super("NOT_FOUND", message, options);
    this.name = "NotFoundError";
  }
}

/** A dependency (db, llm, external API) failed. */
export class ExternalServiceError extends AppError {
  constructor(message: string, options?: { cause?: unknown; context?: LogContext }) {
    super("EXTERNAL_SERVICE_ERROR", message, options);
    this.name = "ExternalServiceError";
  }
}

/**
 * Run an async operation, logging and re-wrapping any failure with context.
 * Never swallows errors — it logs then rethrows as an AppError.
 */
export async function withErrorContext<T>(
  operation: string,
  context: LogContext,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    logger.error(`${operation} failed`, { ...context, error: err });
    if (err instanceof AppError) throw err;
    throw new AppError("UNEXPECTED_ERROR", `${operation} failed`, { cause: err, context });
  }
}

/** Narrow an unknown caught value to a readable message. */
export function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
