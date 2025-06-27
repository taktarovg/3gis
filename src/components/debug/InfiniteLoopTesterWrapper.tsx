'use client';

import dynamic from 'next/dynamic';

// Client Component for dynamic import of InfiniteLoopTester
// This component can use ssr: false since it's a Client Component
const InfiniteLoopTester = dynamic(
  () => import('./InfiniteLoopTester').then(mod => ({ default: mod.InfiniteLoopTester })),
  { 
    ssr: false,
    loading: () => null
  }
);

/**
 * Wrapper for InfiniteLoopTester - Client Component
 * Loads tester only in development mode
 */
export function InfiniteLoopTesterWrapper() {
  // Don't show tester in production mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <InfiniteLoopTester />;
}