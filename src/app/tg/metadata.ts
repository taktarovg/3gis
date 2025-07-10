import { Metadata } from 'next';

// ✅ Специальные метатеги для /tg страниц с Telegram Mini App интеграцией
export const metadata: Metadata = {
  title: '3GIS Mini App - Русскоязычный справочник в Telegram',
  description: 'Находите рестораны, врачей, юристов и другие русскоязычные услуги в США прямо в Telegram',
  
  // ✅ Ключевые метатеги для Telegram Deep Links
  other: {
    // Telegram Bot интеграция
    'telegram:bot': '@ThreeGIS_bot',
    'telegram:app': 'app',
    
    // Альтернативные ссылки для открытия в Telegram
    'al:android:url': 'https://t.me/ThreeGIS_bot/app',
    'al:android:app_name': 'Telegram',
    'al:android:package': 'org.telegram.messenger',
    
    'al:ios:url': 'https://t.me/ThreeGIS_bot/app',
    'al:ios:app_name': 'Telegram',
    'al:ios:app_store_id': '686449807',
    
    // Fallback для desktop
    'al:web:url': 'https://web.telegram.org/k/#@ThreeGIS_bot',
  },
  
  openGraph: {
    title: '3GIS - Русскоязычный справочник в Telegram',
    description: 'Откройте в Telegram для полного функционала Mini App',
    url: 'https://3gis.biz/tg',
    type: 'website',
    images: [
      {
        url: 'https://3gis.biz/og-telegram.png',
        width: 1200,
        height: 630,
        alt: '3GIS Telegram Mini App'
      }
    ],
  },
  
  // ✅ Предотвращаем индексацию /tg страниц поисковиками
  robots: {
    index: false,
    follow: false,
  },
};

// ✅ Принудительно рендерим на клиенте для правильной работы Telegram SDK
export const dynamic = 'force-dynamic';

// Экспортируем layout и страницу из соответствующих файлов
export { default } from './page';
export { default as layout } from './layout';
