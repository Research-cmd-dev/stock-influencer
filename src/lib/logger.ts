/**
 * Minimal structured logger. Use this instead of bare `console.log` in app/server code.
 * Emits JSON lines so logs are machine-parseable in production, pretty in development.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = Record<string, unknown>;

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function currentMinLevel(): LogLevel {
  const fromEnv = process.env.LOG_LEVEL as LogLevel | undefined;
  if (fromEnv && fromEnv in LEVEL_PRIORITY) return fromEnv;
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...(err.cause ? { cause: String(err.cause) } : {}),
    };
  }
  return { value: String(err) };
}

function emit(level: LogLevel, message: string, context?: LogContext): void {
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[currentMinLevel()]) return;

  const normalizedContext: LogContext | undefined = context
    ? Object.fromEntries(
        Object.entries(context).map(([key, value]) =>
          value instanceof Error ? [key, serializeError(value)] : [key, value],
        ),
      )
    : undefined;

  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(normalizedContext ?? {}),
  };

  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (message: string, context?: LogContext) => emit("debug", message, context),
  info: (message: string, context?: LogContext) => emit("info", message, context),
  warn: (message: string, context?: LogContext) => emit("warn", message, context),
  error: (message: string, context?: LogContext) => emit("error", message, context),
  /** Create a child logger that merges `base` context into every call. */
  child(base: LogContext) {
    return {
      debug: (message: string, context?: LogContext) =>
        emit("debug", message, { ...base, ...context }),
      info: (message: string, context?: LogContext) =>
        emit("info", message, { ...base, ...context }),
      warn: (message: string, context?: LogContext) =>
        emit("warn", message, { ...base, ...context }),
      error: (message: string, context?: LogContext) =>
        emit("error", message, { ...base, ...context }),
    };
  },
};
