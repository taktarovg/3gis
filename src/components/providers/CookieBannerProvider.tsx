'use client';

import dynamic from 'next/dynamic';

// ✅ РЕШЕНИЕ: Client Component может использовать ssr: false
const CookieBanner = dynamic(
  () => import('@/components/legal/CookieBanner').then(mod => ({ default: mod.CookieBanner })),
  { 
    ssr: false, // ✅ РАБОТАЕТ в Client Components
    loading: () => null 
  }
);

export function CookieBannerProvider() {
  return <CookieBanner />;
}
