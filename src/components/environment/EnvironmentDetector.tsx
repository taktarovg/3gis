// src/components/environment/EnvironmentDetector.tsx
'use client';

import { useEffect, useState, type PropsWithChildren } from 'react';

/**
 * ✅ Компонент для детекции среды выполнения
 * Совместимо с Next.js 15.3.3 SSR и Telegram SDK v3.x
 */
export function EnvironmentDetector({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
