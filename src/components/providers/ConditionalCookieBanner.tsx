'use client';

import { useEffect, useState } from 'react';
import { CookieBanner } from '@/components/legal/CookieBanner';

export function ConditionalCookieBanner() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Рендерим только на клиенте
  if (!isClient) return null;

  return <CookieBanner />;
}
