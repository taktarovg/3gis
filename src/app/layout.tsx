import './globals.css';
import type { Metadata, Viewport } from 'next';
import { ClientProvider } from './ClientProvider';
import { inter } from './fonts';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://3gis.vercel.app'),
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
    url: 'https://3gis.vercel.app',
    siteName: '3GIS',
    images: [
      {
        url: 'https://3gis.vercel.app/og-image.png',
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
    images: ['https://3gis.vercel.app/og-image.png'],
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
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
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
        {/* Мета-теги для запрета кэширования динамического контента */}
        <meta httpEquiv="Cache-Control" content="no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* Preconnect для улучшения производительности */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Telegram WebApp script - загружается только для /tg маршрутов */}
        <Script 
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
          id="telegram-web-app"
        />
        
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
              "url": "https://3gis.vercel.app",
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
                "url": "https://3gis.vercel.app"
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
        
        {/* Analytics (если понадобится) */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'GA_MEASUREMENT_ID');
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
