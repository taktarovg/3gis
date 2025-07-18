import { Metadata, Viewport } from 'next';
import TelegramRedirectClientFixed from './TelegramRedirectClientFixed';

/**
 * ✅ ОБНОВЛЕНО ДЛЯ HYBRID MIDDLEWARE v15
 * ✅ ПОЛНОСТЬЮ ИСПРАВЛЕНО: Убрано viewport из metadata (Next.js 15.3.3)
 * ✅ БЕЗОПАСНЫЙ Server Component для SEO и быстрой загрузки
 * ✅ Поддержка новых флагов детекции от middleware v15
 */

export const metadata: Metadata = {
  title: '3GIS - Откройте в Telegram для лучшего опыта',
  description: 'Русскоязычный справочник организаций в США. Лучше всего работает в Telegram Mini App.',
  keywords: ['3GIS', 'Telegram Mini App', 'русскоязычный справочник', 'организации США'],
  robots: 'noindex, nofollow', // Не индексируем страницу редиректа
  
  // Open Graph для социальных сетей
  openGraph: {
    title: '3GIS Mini App',
    description: 'Русскоязычный справочник организаций в США',
    images: ['/images/3gis-social-preview.jpg'],
    type: 'website',
  },
  
  // Telegram-специфичные метатеги  
  other: {
    'telegram:card': 'app',
    'telegram:site': '@ThreeGIS_bot',
    'telegram:app:name:iphone': '3GIS',
    'telegram:app:name:android': '3GIS',
    'telegram:app:url:iphone': 'https://t.me/ThreeGIS_bot/app',
    'telegram:app:url:android': 'https://t.me/ThreeGIS_bot/app',
  }
};

// ✅ ИСПРАВЛЕНО: Viewport вынесен в отдельный export (Next.js 15.3.3)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * ✅ ОБНОВЛЕННЫЙ Server Component v15 - совместимо с Hybrid Middleware v15
 * ✅ Поддержка новых флагов детекции (_detected=browser)
 * ✅ Улучшенная обработка параметров от системы детекции
 */
export default async function TelegramRedirectPage({ searchParams }: PageProps) {
  // ✅ Безопасно извлекаем searchParams на сервере
  const params = await searchParams;
  const startParam = (params.startapp as string) || (params.start as string) || '';
  const detectedAs = (params._detected as string) || 'unknown';
  const wasRedirected = (params._redirected as string) === 'true';
  
  console.log('🖥️ TG-Redirect Server Component v15 загружен:', {
    startParam,
    detectedAs,
    wasRedirected,
    hasParams: Object.keys(params).length > 0,
    middlewareVersion: 'v15-hybrid'
  });
  
  // ✅ Передаем ТОЛЬКО сериализуемые данные - не функции!
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ✅ Весь интерактивный функционал в ИСПРАВЛЕННОМ Client компоненте БЕЗ SDK ошибок */}
      <TelegramRedirectClientFixed 
        startParam={startParam}
        botUsername="ThreeGIS_bot"
        appName="app"
        detectedAs={detectedAs}
        wasRedirected={wasRedirected}
      />
    </div>
  );
}
