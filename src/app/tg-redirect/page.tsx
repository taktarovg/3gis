import { Metadata, Viewport } from 'next';
import TelegramRedirectClient from './TelegramRedirectClient';

/**
 * ✅ ИСПРАВЛЕНО: Убрано viewport из metadata (Next.js 15.3.3)
 * ✅ БЕЗОПАСНЫЙ Server Component для SEO и быстрой загрузки
 * - Без event handlers 
 * - Без useState/useEffect
 * - Только статичные метаданные и передача управления Client компоненту
 */

export const metadata: Metadata = {
  title: '3GIS Mini App - Перенаправление в Telegram',
  description: 'Русскоязычный справочник организаций в США. Откройте в Telegram для лучшего опыта.',
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
 * ✅ БЕЗОПАСНЫЙ Server Component - только статика и метаданные
 * Все интерактивные элементы переданы в Client компонент
 */
export default async function TelegramRedirectPage({ searchParams }: PageProps) {
  // ✅ Безопасно извлекаем searchParams на сервере
  const params = await searchParams;
  const startParam = (params.startapp as string) || (params.start as string) || '';
  
  console.log('🖥️ TG-Redirect Server Component загружен:', {
    startParam,
    hasParams: Object.keys(params).length > 0
  });
  
  // ✅ Передаем данные в Client компонент как props (сериализуемо)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ✅ Весь интерактивный функционал в Client компоненте */}
      <TelegramRedirectClient 
        startParam={startParam}
        botUsername="ThreeGIS_bot"
        appName="app"
      />
    </div>
  );
}
