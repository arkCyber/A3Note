/**
 * Performance Monitor - Aerospace-grade performance tracking
 */

import { log } from './logger';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface PerformanceStats {
  count: number;
  total: number;
  average: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
}

/**
 * Performance Monitor class
 */
export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private activeTimers: Map<string, number> = new Map();
  private maxMetricsPerOperation = 1000;

  /**
   * Start timing an operation
   */
  start(operationName: string): void {
    this.activeTimers.set(operationName, performance.now());
  }

  /**
   * End timing an operation
   */
  end(operationName: string, metadata?: Record<string, any>): number {
    const startTime = this.activeTimers.get(operationName);
    if (!startTime) {
      log.warn('PerformanceMonitor', `No start time found for ${operationName}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.activeTimers.delete(operationName);

    // Record metric
    this.record(operationName, duration, metadata);

    return duration;
  }

  /**
   * Record a metric
   */
  record(name: string, duration: number, metadata?: Record<string, any>): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push({
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    });

    // Limit metrics to prevent memory issues
    if (metrics.length > this.maxMetricsPerOperation) {
      metrics.shift();
    }

    // Log slow operations
    if (duration > 1000) {
      log.warn('PerformanceMonitor', `Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Measure a function execution
   */
  async measure<T>(
    operationName: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(operationName);
    try {
      const result = await fn();
      this.end(operationName, metadata);
      return result;
    } catch (error) {
      this.end(operationName, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Get statistics for an operation
   */
  getStats(operationName: string): PerformanceStats | null {
    const metrics = this.metrics.get(operationName);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const count = durations.length;
    const total = durations.reduce((sum, d) => sum + d, 0);
    const average = total / count;

    return {
      count,
      total,
      average,
      min: durations[0],
      max: durations[count - 1],
      p50: this.percentile(durations, 0.5),
      p95: this.percentile(durations, 0.95),
      p99: this.percentile(durations, 0.99),
    };
  }

  /**
   * Get all statistics
   */
  getAllStats(): Map<string, PerformanceStats> {
    const allStats = new Map<string, PerformanceStats>();
    
    for (const [name] of this.metrics) {
      const stats = this.getStats(name);
      if (stats) {
        allStats.set(name, stats);
      }
    }

    return allStats;
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(operationName: string, count: number = 10): PerformanceMetric[] {
    const metrics = this.metrics.get(operationName);
    if (!metrics) {
      return [];
    }

    return metrics.slice(-count);
  }

  /**
   * Clear metrics for an operation
   */
  clear(operationName?: string): void {
    if (operationName) {
      this.metrics.delete(operationName);
    } else {
      this.metrics.clear();
    }
  }

  /**
   * Export metrics
   */
  export(): string {
    const data: Record<string, any> = {};
    
    for (const [name, metrics] of this.metrics) {
      data[name] = {
        stats: this.getStats(name),
        recent: metrics.slice(-10),
      };
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Get summary report
   */
  getSummary(): string {
    const lines: string[] = ['Performance Summary', '='.repeat(50)];
    
    const allStats = this.getAllStats();
    const sortedStats = Array.from(allStats.entries())
      .sort((a, b) => b[1].average - a[1].average);

    for (const [name, stats] of sortedStats) {
      lines.push('');
      lines.push(`Operation: ${name}`);
      lines.push(`  Count: ${stats.count}`);
      lines.push(`  Average: ${stats.average.toFixed(2)}ms`);
      lines.push(`  Min: ${stats.min.toFixed(2)}ms`);
      lines.push(`  Max: ${stats.max.toFixed(2)}ms`);
      lines.push(`  P50: ${stats.p50.toFixed(2)}ms`);
      lines.push(`  P95: ${stats.p95.toFixed(2)}ms`);
      lines.push(`  P99: ${stats.p99.toFixed(2)}ms`);
    }

    return lines.join('\n');
  }

  /**
   * Calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Check if operation is slow
   */
  isSlow(operationName: string, threshold: number = 1000): boolean {
    const stats = this.getStats(operationName);
    return stats ? stats.average > threshold : false;
  }

  /**
   * Get slow operations
   */
  getSlowOperations(threshold: number = 1000): string[] {
    const slow: string[] = [];
    
    for (const [name] of this.metrics) {
      if (this.isSlow(name, threshold)) {
        slow.push(name);
      }
    }

    return slow;
  }
}

/**
 * Singleton instance
 */
let monitorInstance: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!monitorInstance) {
    monitorInstance = new PerformanceMonitor();
  }
  return monitorInstance;
}

export function resetPerformanceMonitor(): void {
  if (monitorInstance) {
    monitorInstance.clear();
  }
  monitorInstance = null;
}

/**
 * Decorator for measuring method performance
 */
export function measurePerformance(operationName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const name = operationName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const monitor = getPerformanceMonitor();
      return await monitor.measure(name, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}
