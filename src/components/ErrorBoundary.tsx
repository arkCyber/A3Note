// Error Boundary Component - Aerospace Grade
// Catches React errors and displays friendly error page

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { log } from '../utils/logger';
import { ErrorHandler, ErrorSeverity } from '../utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches errors in child components and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    log.error('[ErrorBoundary] Component error caught:', error);
    log.error('[ErrorBoundary] Error info:', errorInfo);

    // Report to error handler
    ErrorHandler.handle(error, {
      severity: ErrorSeverity.HIGH,
      context: 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-secondary border border-border rounded-lg p-6 space-y-4">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            {/* Error Title */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                出错了
              </h2>
              <p className="text-sm text-foreground/60">
                应用遇到了一个错误，但不用担心，您的数据是安全的。
              </p>
            </div>

            {/* Error Details (in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-background rounded p-3 space-y-2">
                <div className="text-xs font-mono text-red-500">
                  {this.state.error.message}
                </div>
                {this.state.errorInfo && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-foreground/60 hover:text-foreground">
                      查看详细信息
                    </summary>
                    <pre className="mt-2 text-foreground/40 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>重试</span>
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary border border-border rounded hover:bg-background transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>重新加载</span>
              </button>
            </div>

            {/* Help Text */}
            <div className="text-xs text-center text-foreground/40">
              如果问题持续存在，请尝试重启应用
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
