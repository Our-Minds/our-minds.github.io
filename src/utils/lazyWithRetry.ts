import { lazy } from 'react';

// Retry React.lazy dynamic imports to mitigate transient chunk load failures
export default function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 1,
  retryDelay = 400
) {
  const load = () =>
    factory().catch((err) => {
      if (retries <= 0) throw err;
      return new Promise<{ default: T }>((resolve, reject) => {
        setTimeout(() => {
          factory().then(resolve).catch(reject);
        }, retryDelay);
      });
    });

  return lazy(load);
}
