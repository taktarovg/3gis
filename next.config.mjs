/** @type {import('next').NextConfig} */

/**
 * 3GIS - Russian Business Directory for USA
 * Конфигурация адаптирована для справочника организаций
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Получаем __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  // Генерация уникального ID сборки
  generateBuildId: () => {
    return `3gis-build-${Date.now()}`;
  },

  reactStrictMode: process.env.NODE_ENV === 'development',

  // Редиректы для 3GIS
  async redirects() {
    return [
      // Редирект с /app на /tg для Telegram App
      {
        source: '/app',
        destination: '/tg',
        permanent: false,
      },
      {
        source: '/app/:path*',
        destination: '/tg/:path*',
        permanent: false,
      },
    ];
  },

  // Заголовки для кэширования и безопасности
  async headers() {
    return [
      // Статические ресурсы - агрессивное кэширование
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      
      // Для сайта - умеренное кэширование
      {
        source: '/((?!tg|admin|api|_next).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400'
          }
        ]
      },

      // Для Telegram App - без кэширования
      {
        source: '/tg/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate'
          },
          {
            key: 'X-Content-Type',
            value: 'telegram-app'
          }
        ]
      },

      // Для админки - строгая безопасность
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ];
  },

  // Настройки изображений для заведений
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '3gis-photos.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatar.iran.liara.run',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 't.me',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '3gis.us',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        port: '',
        pathname: '/maps/api/staticmap**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128],
    dangerouslyAllowSVG: false,
  },

  // Webpack оптимизация
  webpack: (config, { dev, webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve(__dirname, 'src'),
    };

    return config;
  },

  // Переменные окружения для 3GIS
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://3gis.us',
    NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://3gis.us',
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ThreeGIS_bot',
    NEXT_PUBLIC_WEBSITE_NAME: '3GIS',
    NEXT_PUBLIC_WEBSITE_DESCRIPTION: 'Russian Business Directory for USA',
  },

  // Компилятор
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn', 'info'],
    } : false,
  },

  // Настройки для продакшна
  ...(process.env.NODE_ENV === 'production' && {
    compress: true,
    poweredByHeader: false,
  }),

  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  skipTrailingSlashRedirect: true,
  staticPageGenerationTimeout: 180,
  productionBrowserSourceMaps: false,
  crossOrigin: 'anonymous',
};

// Логирование
if (process.env.NODE_ENV === 'production') {
  console.log('🚀 3GIS конфигурация загружена для ПРОДАКШНА!');
} else {
  console.log('🔧 3GIS конфигурация загружена для РАЗРАБОТКИ!');
}

console.log(`📦 3GIS v1.0.0-${Date.now()}`);
console.log(`🕐 Время сборки: ${new Date().toISOString()}`);

export default nextConfig;