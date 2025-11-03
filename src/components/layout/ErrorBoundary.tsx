import React from 'react';

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<ErrorBoundaryProps>, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy load error boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    // Try a soft reload first
    this.setState({ hasError: false, error: undefined });
    // Invalidate currently waiting service worker if any
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    // Force a hard reload to refresh chunks
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>;
      return (
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">A loading error occurred. Please try again.</p>
          <button onClick={this.handleRetry} className="inline-flex items-center rounded-md border px-4 py-2 text-sm">
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children as React.ReactNode;
  }
}
