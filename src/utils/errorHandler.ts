/**
 * Aerospace-grade error handling utility
 * Provides structured error handling with recovery strategies
 */

import { log } from './logger';

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ErrorContext {
  component: string;
  operation: string;
  severity: ErrorSeverity;
  recoverable: boolean;
  metadata?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly context: ErrorContext;
  public readonly timestamp: string;
  public readonly originalError?: Error;

  constructor(message: string, context: ErrorContext, originalError?: Error) {
    super(message);
    this.name = 'AppError';
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.originalError = originalError;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toString(): string {
    return `[${this.context.severity}] ${this.context.component}.${this.context.operation}: ${this.message}`;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
      originalError: this.originalError?.message,
    };
  }
}

export class ErrorHandler {
  private static errorCount: Map<string, number> = new Map();
  private static readonly MAX_ERRORS_PER_COMPONENT = 10;
  private static readonly ERROR_RESET_INTERVAL = 60000; // 1 minute

  /**
   * Handle an error with proper logging and recovery
   */
  static handle(error: Error | AppError, context: ErrorContext): void {
    const errorKey = `${context.component}.${context.operation}`;
    
    // Track error count
    const count = (this.errorCount.get(errorKey) || 0) + 1;
    this.errorCount.set(errorKey, count);

    // Log based on severity
    if (context.severity === ErrorSeverity.CRITICAL) {
      log.critical(context.component, `${context.operation} failed`, error, context.metadata);
    } else if (context.severity === ErrorSeverity.HIGH) {
      log.error(context.component, `${context.operation} failed`, error, context.metadata);
    } else {
      log.warn(context.component, `${context.operation} failed`, context.metadata);
    }

    // Check if component is failing too frequently
    if (count >= this.MAX_ERRORS_PER_COMPONENT) {
      log.critical(
        context.component,
        `Component failing repeatedly (${count} errors)`,
        error,
        { errorKey }
      );
    }

    // Reset error count after interval
    setTimeout(() => {
      this.errorCount.delete(errorKey);
    }, this.ERROR_RESET_INTERVAL);
  }

  /**
   * Wrap a function with error handling
   */
  static wrap<T extends (...args: unknown[]) => unknown>(
    fn: T,
    context: ErrorContext
  ): T {
    return ((...args: unknown[]) => {
      try {
        const result = fn(...args);
        
        // Handle async functions
        if (result instanceof Promise) {
          return result.catch((error) => {
            this.handle(error, context);
            if (!context.recoverable) {
              throw new AppError('Unrecoverable error', context, error);
            }
            return null;
          });
        }
        
        return result;
      } catch (error) {
        this.handle(error as Error, context);
        
        if (!context.recoverable) {
          throw new AppError('Unrecoverable error', context, error as Error);
        }
        
        return null;
      }
    }) as T;
  }

  /**
   * Safely execute a function with fallback
   */
  static safe<T>(
    fn: () => T,
    fallback: T,
    context: ErrorContext
  ): T {
    try {
      return fn();
    } catch (error) {
      this.handle(error as Error, context);
      return fallback;
    }
  }

  /**
   * Safely execute an async function with fallback
   */
  static async safeAsync<T>(
    fn: () => Promise<T>,
    fallback: T,
    context: ErrorContext
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error as Error, context);
      return fallback;
    }
  }

  /**
   * Assert a condition and throw if false
   */
  static assert(
    condition: boolean,
    message: string,
    context: ErrorContext
  ): asserts condition {
    if (!condition) {
      const error = new AppError(message, context);
      this.handle(error, context);
      throw error;
    }
  }

  /**
   * Validate input and throw if invalid
   */
  static validate<T>(
    value: T,
    validator: (value: T) => boolean,
    message: string,
    context: ErrorContext
  ): T {
    if (!validator(value)) {
      const error = new AppError(message, context);
      this.handle(error, context);
      throw error;
    }
    return value;
  }

  /**
   * Get error statistics
   */
  static getStats(): Record<string, number> {
    return Object.fromEntries(this.errorCount);
  }

  /**
   * Clear error statistics
   */
  static clearStats(): void {
    this.errorCount.clear();
  }
}

// Convenience exports
export const handleError = ErrorHandler.handle.bind(ErrorHandler);
export const wrapWithErrorHandler = ErrorHandler.wrap.bind(ErrorHandler);
export const safeExecute = ErrorHandler.safe.bind(ErrorHandler);
export const safeExecuteAsync = ErrorHandler.safeAsync.bind(ErrorHandler);
export const assertCondition = ErrorHandler.assert.bind(ErrorHandler);
export const validateInput = ErrorHandler.validate.bind(ErrorHandler);
