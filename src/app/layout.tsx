import './globals.css';
import type { Metadata, Viewport } from 'next';
import { ClientProvider } from './ClientProvider';
import { inter } from './fonts';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://3gis.us'),
  title: '3GIS - Русскоговорящий справочник в США',
  description: 'Найди русскоговорящие услуги в Америке - рестораны, врачи, юристы и многое другое',
  openGraph: {
    title: '3GIS - Твой проводник в Америке',
    description: 'Русскоязычный справочник организаций в США. Найди врачей, юристов, рестораны и другие услуги на родном языке.',
    url: 'https://t.me/ThreeGIS_bot/app',
    images: [
      {
        url: 'https://3gis.us/og-image.png',
        width: 1200,
        height: 630,
        alt: '3GIS - Русский справочник в США'
      }
    ],
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#494b69',
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
        
        {/* Telegram WebApp script - КРИТИЧЕСКИ ВАЖНО для авторизации */}
        <Script 
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        {/* Единый провайдер для всех интерфейсов */}
        <ClientProvider>
          {children}
        </ClientProvider>
        
        {/* Глобальные уведомления */}
        <Toaster />
      </body>
    </html>
  );
}