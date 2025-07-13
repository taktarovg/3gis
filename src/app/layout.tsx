import './globals.css';
import type { Metadata, Viewport } from 'next';
import { ClientProvider } from './ClientProvider';
import { inter } from './fonts';
import { Toaster } from '@/components/ui/toaster';
import { CookieBanner } from '@/components/legal/CookieBanner';
import { GoogleAnalytics, PageViewTracker } from '@/components/analytics/GoogleAnalytics';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://3gis.biz'),
  title: {
    default: '3GIS - Русскоязычный справочник организаций в США',
    template: '%s | 3GIS - Твой проводник в Америке'
  },
  description: 'Находите рестораны, врачей, юристов, салоны красоты и другие русскоязычные услуги по всей Америке. Более 5.5 миллионов русскоговорящих доверяют 3GIS.',
  keywords: ['русский справочник США', 'русскоговорящие услуги', 'рестораны русские', 'врачи русские', 'юристы иммиграционные', 'справочник иммигрантов', 'русская америка'],
  authors: [{ name: '3GIS Team' }],
  creator: '3GIS',
  publisher: '3GIS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: '3GIS - Твой проводник в Америке',
    description: 'Русскоязычный справочник организаций в США. Найди врачей, юристов, рестораны и другие услуги на родном языке.',
    url: 'https://3gis.biz',
    siteName: '3GIS',
    images: [
      {
        url: 'https://3gis.biz/og-image.png',
        width: 1200,
        height: 630,
        alt: '3GIS - Русскоязычный справочник США'
      }
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '3GIS - Русскоязычный справочник США',
    description: 'Находите русскоговорящие услуги по всей Америке',
    images: ['https://3gis.biz/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3B82F6' },
    { media: '(prefers-color-scheme: dark)', color: '#1E40AF' }
  ],
  colorScheme: 'light',
};

// Отключаем статическую оптимизацию для динамического контента
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable}`}>
      <head>
        {/* Мета-теги для Next.js 15.3.3 кэширования */}
        <meta httpEquiv="Cache-Control" content="public, max-age=31536000, immutable" />
        <meta name="robots" content="index, follow" />
        
        {/* Favicon для Google Search */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        
        {/* Preconnect для улучшения производительности */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* УДАЛЕНО: telegram-web-app.js script - заменен на @telegram-apps/sdk v3.x в /tg/layout.tsx */}
        {/* Старый скрипт конфликтует с новым SDK v3.x, поэтому убираем глобальную загрузку */}
        
        {/* JSON-LD структурированные данные */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "3GIS",
              "alternateName": "3GIS - Русскоязычный справочник США",
              "description": "Справочник русскоязычных организаций в США",
              "url": "https://3gis.biz",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://t.me/ThreeGIS_bot/app?query={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "audience": {
                "@type": "Audience",
                "audienceType": "Russian-speaking Americans"
              },
              "inLanguage": "ru",
              "publisher": {
                "@type": "Organization",
                "name": "3GIS",
                "url": "https://3gis.biz"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Единый провайдер - но Telegram Provider будет только в /tg */}
        <ClientProvider>
          {children}
        </ClientProvider>
        
        {/* Глобальные уведомления */}
        <Toaster />
        
        {/* Cookie Banner - показывается только НЕ в Telegram Mini App */}
        <CookieBanner />
        
        {/* Google Analytics 4 - всегда включен для аналитики */}
        <GoogleAnalytics />
        
        {/* Page View Tracker - автоматическое отслеживание навигации */}
        <PageViewTracker />
      </body>
    </html>
  );
}
