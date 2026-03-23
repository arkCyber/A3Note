/**
 * Aerospace-grade logging utility
 * Provides structured logging with levels, timestamps, and context
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: unknown;
  error?: Error;
  stackTrace?: string;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private enabled: boolean = true;

  private constructor() {
    // Singleton pattern
    if (typeof window !== 'undefined') {
      // Enable debug mode in development
      this.logLevel = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO;
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enabled && level >= this.logLevel;
  }

  private createLogEntry(
    level: LogLevel,
    component: string,
    message: string,
    data?: unknown,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data,
      error,
    };

    if (error && error.stack) {
      entry.stackTrace = error.stack;
    }

    return entry;
  }

  private storeLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Maintain max logs limit
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    return `[${entry.timestamp}] [${levelName}] [${entry.component}] ${entry.message}`;
  }

  debug(component: string, message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry = this.createLogEntry(LogLevel.DEBUG, component, message, data);
    this.storeLog(entry);
    console.debug(this.formatMessage(entry), data || '');
  }

  info(component: string, message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry = this.createLogEntry(LogLevel.INFO, component, message, data);
    this.storeLog(entry);
    console.info(this.formatMessage(entry), data || '');
  }

  warn(component: string, message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry = this.createLogEntry(LogLevel.WARN, component, message, data);
    this.storeLog(entry);
    console.warn(this.formatMessage(entry), data || '');
  }

  error(component: string, message: string, error?: Error, data?: unknown): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry = this.createLogEntry(LogLevel.ERROR, component, message, data, error);
    this.storeLog(entry);
    console.error(this.formatMessage(entry), error || '', data || '');
  }

  critical(component: string, message: string, error?: Error, data?: unknown): void {
    if (!this.shouldLog(LogLevel.CRITICAL)) return;

    const entry = this.createLogEntry(LogLevel.CRITICAL, component, message, data, error);
    this.storeLog(entry);
    console.error(`🚨 CRITICAL: ${this.formatMessage(entry)}`, error || '', data || '');
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Performance monitoring
  startTimer(component: string, operation: string): () => void {
    const startTime = performance.now();
    this.debug(component, `Starting: ${operation}`);

    return () => {
      const duration = performance.now() - startTime;
      this.debug(component, `Completed: ${operation}`, { duration: `${duration.toFixed(2)}ms` });
      
      // Warn if operation takes too long
      if (duration > 100) {
        this.warn(component, `Slow operation: ${operation}`, { duration: `${duration.toFixed(2)}ms` });
      }
    };
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const log = {
  debug: (component: string, message: string, data?: unknown) => logger.debug(component, message, data),
  info: (component: string, message: string, data?: unknown) => logger.info(component, message, data),
  warn: (component: string, message: string, data?: unknown) => logger.warn(component, message, data),
  error: (component: string, message: string, error?: Error, data?: unknown) => logger.error(component, message, error, data),
  critical: (component: string, message: string, error?: Error, data?: unknown) => logger.critical(component, message, error, data),
  timer: (component: string, operation: string) => logger.startTimer(component, operation),
};
