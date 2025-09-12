
import { Suspense } from 'react';
import { PageLoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorBoundary } from './ErrorBoundary';

interface LazyPageWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
}

export function LazyPageWrapper({ 
  children, 
  fallback: FallbackComponent = PageLoadingSkeleton 
}: LazyPageWrapperProps) {
  return (
    <ErrorBoundary fallback={<FallbackComponent />}>
      <Suspense fallback={<FallbackComponent />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
