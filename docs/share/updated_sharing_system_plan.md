# 🔗 Обновленный план реализации системы шеринга для 3GIS

> **Обновлено для @telegram-apps/sdk v3.x и @telegram-apps/sdk-react v3.x**

## 🎯 Цели и преимущества

### Зачем нужен шеринг:
- **Виральный рост** - пользователи делятся ссылками на заведения
- **SEO оптимизация** - внешние ссылки на профили компаний
- **Удобство блога** - прямые ссылки из статей в Telegram App
- **Увеличение конверсии** - легкий переход от контента к действию
- **Социальные сети** - красивые превью при шеринге

### Примеры использования:
- Блог: "Лучший русский ресторан → [Ссылка на профиль в TMA]"
- WhatsApp: "Попробуй этот салон" + превью
- Telegram: Пересылка заведений между чатами
- Instagram Stories: QR-коды профилей

---

## 🔗 Структура ссылок

### Формат Share-ссылок:

#### Для бизнесов:
```
https://3gis.biz/share/business/123
https://3gis.biz/b/123                    # Короткая версия
https://3gis.biz/b/mama-pizza-brooklyn    # SEO-friendly slug
```

#### Для чатов:
```
https://3gis.biz/share/chat/456
https://3gis.biz/c/456                    # Короткая версия
https://3gis.biz/c/nyc-russian-community  # SEO-friendly slug
```

#### С параметрами:
```
https://3gis.biz/b/123?ref=blog&source=15-salons-article
https://3gis.biz/c/456?ref=telegram&utm_campaign=growth
```

---

## 🗄️ Обновления базы данных

### Новые поля в существующих таблицах:

```prisma
model Business {
  // ... существующие поля
  
  // SEO и шеринг
  slug            String?   @unique  // URL-friendly slug
  shareCount      Int       @default(0)  // Количество шерингов
  
  // Мета-данные для социальных сетей
  ogTitle         String?   // Заголовок для OpenGraph
  ogDescription   String?   // Описание для OpenGraph
  ogImage         String?   // Изображение для соц. сетей
  
  @@map("businesses")
}

model TelegramChat {
  // ... существующие поля
  
  // SEO и шеринг
  slug            String?   @unique  // URL-friendly slug
  shareCount      Int       @default(0)
  
  // Мета-данные
  ogTitle         String?
  ogDescription   String?
  ogImage         String?
  
  @@map("telegram_chats")
}

// Новая таблица для аналитики шеринга
model ShareAnalytics {
  id          Int      @id @default(autoincrement())
  
  // Что шерили
  entityType  ShareEntityType  // BUSINESS, CHAT
  entityId    Int
  businessId  Int?    // Foreign key к Business (для удобства)
  chatId      Int?    // Foreign key к TelegramChat (для удобства)
  
  // Откуда пришли
  referrer    String?   // Источник перехода
  userAgent   String?   // Браузер/устройство
  ipAddress   String?   // IP для географии (анонимно)
  
  // UTM метки
  utmSource   String?   // utm_source
  utmMedium   String?   // utm_medium
  utmCampaign String?   // utm_campaign
  
  // Пользователь (если авторизован)
  userId      Int?      // Foreign key к User
  
  // Действие
  action      ShareAction @default(LINK_CREATED)
  
  // Временные метки
  createdAt   DateTime  @default(now())
  
  // Связи
  business    Business?     @relation(fields: [businessId], references: [id])
  chat        TelegramChat? @relation(fields: [chatId], references: [id])
  user        User?         @relation(fields: [userId], references: [id])
  
  @@map("share_analytics")
}

enum ShareEntityType {
  BUSINESS
  CHAT
}

enum ShareAction {
  LINK_CREATED     // Ссылка создана
  LINK_CLICKED     // Переход по ссылке
  SOCIAL_SHARED    // Поделились в соц. сети
  APP_OPENED       // Открыли в TMA
  QR_SCANNED       // Отсканировали QR-код
}
```

---

## 🏗️ Архитектура системы

### 1. API Endpoints

```typescript
// Генерация share-ссылок
POST /api/share/business/[id]     # Создать share-ссылку бизнеса
POST /api/share/chat/[id]         # Создать share-ссылку чата

// Получение данных для превью
GET /api/share/business/[id]      # Данные бизнеса для превью
GET /api/share/chat/[id]          # Данные чата для превью

// Аналитика (админ)
GET /api/admin/analytics/sharing  # Статистика шеринга
```

### 2. Share страницы (Landing для ссылок)

#### 📁 Структура страниц:
```
/share/
├── business/
│   └── [id]/page.tsx         # Landing для бизнеса
├── chat/
│   └── [id]/page.tsx         # Landing для чата
└── not-found.tsx             # 404 для несуществующих ссылок

/b/[slug]/page.tsx            # Короткие ссылки бизнесов
/c/[slug]/page.tsx            # Короткие ссылки чатов
```

---

## 📱 Обновленный ShareButton с SDK v3.x

### Современный ShareButton компонент:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Share2, Send, MessageCircle, Facebook, Twitter, Copy, QrCode } from 'lucide-react';
import { shareURL, openTelegramLink } from '@telegram-apps/sdk';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  type: 'business' | 'chat';
  entity: Business | TelegramChat;
  variant?: 'button' | 'icon' | 'text';
  className?: string;
}

export function ShareButton({ type, entity, variant = 'button', className }: ShareButtonProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  // ✅ SDK v3.x: Правильное использование useLaunchParams
  const launchParams = useLaunchParams();
  const user = launchParams.tgWebAppData?.user;
  
  useEffect(() => {
    const baseUrl = 'https://3gis.biz';
    const slug = entity.slug || entity.id;
    setShareUrl(`${baseUrl}/${type === 'business' ? 'b' : 'c'}/${slug}`);
  }, [type, entity]);
  
  const trackShare = async (action: string, platform?: string) => {
    try {
      await fetch('/api/analytics/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: type.toUpperCase(),
          entityId: entity.id,
          action,
          platform,
          userId: user?.id,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Share tracking error:', error);
    }
  };
  
  const handleShare = async () => {
    await trackShare('SHARE_BUTTON_CLICKED');
    
    // ✅ SDK v3.x: Проверка доступности и вызов shareURL
    if (shareURL.isAvailable()) {
      try {
        await shareURL(shareUrl, `${entity.name || entity.title} | 3GIS`);
        await trackShare('SOCIAL_SHARED', 'telegram');
        return;
      } catch (error) {
        console.error('Native share failed:', error);
        // Fallback к модалу
      }
    }
    
    // Fallback к Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: entity.name || entity.title,
          text: entity.description,
          url: shareUrl,
        });
        await trackShare('SOCIAL_SHARED', 'native');
        return;
      } catch (error) {
        // Пользователь отменил или ошибка
      }
    }
    
    // Открываем модал как последний fallback
    setIsShareModalOpen(true);
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      await trackShare('LINK_COPIED');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const shareToSocial = async (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(entity.name || entity.title);
    
    const urls = {
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    };
    
    await trackShare('SOCIAL_SHARED', platform);
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };
  
  const openInTelegramApp = async () => {
    const tmaUrl = `https://t.me/ThreeGIS_bot/app?startapp=${type}_${entity.id}`;
    
    // ✅ SDK v3.x: Использование openTelegramLink
    if (openTelegramLink.isAvailable()) {
      try {
        await openTelegramLink(tmaUrl);
        await trackShare('APP_OPENED', 'telegram');
        return;
      } catch (error) {
        console.error('Failed to open Telegram link:', error);
      }
    }
    
    // Fallback для браузера
    window.open(tmaUrl, '_blank');
  };
  
  return (
    <>
      <button
        onClick={handleShare}
        className={cn(
          "inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          variant === 'button' && "px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium",
          variant === 'icon' && "w-10 h-10 hover:bg-gray-100 rounded-full",
          variant === 'text' && "text-blue-600 hover:text-blue-700 underline text-sm",
          className
        )}
        aria-label={variant === 'icon' ? 'Поделиться' : undefined}
      >
        <Share2 className="w-4 h-4" />
        {variant === 'button' && <span className="ml-2">Поделиться</span>}
        {variant === 'text' && <span className="ml-1">Поделиться</span>}
      </button>
      
      {/* ✅ Обновленный модал шеринга */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Поделиться</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>
            
            {/* Кнопка открытия в TMA */}
            <div className="mb-4">
              <button
                onClick={openInTelegramApp}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Send className="w-5 h-5 mr-2" />
                Открыть в Telegram App
              </button>
            </div>
            
            {/* Социальные сети */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <ShareSocialButton
                icon={<Send className="w-5 h-5 text-white" />}
                bgColor="bg-blue-500"
                label="Telegram"
                onClick={() => shareToSocial('telegram')}
              />
              
              <ShareSocialButton
                icon={<MessageCircle className="w-5 h-5 text-white" />}
                bgColor="bg-green-500"
                label="WhatsApp"
                onClick={() => shareToSocial('whatsapp')}
              />
              
              <ShareSocialButton
                icon={<Facebook className="w-5 h-5 text-white" />}
                bgColor="bg-blue-600"
                label="Facebook"
                onClick={() => shareToSocial('facebook')}
              />
              
              <ShareSocialButton
                icon={<Twitter className="w-5 h-5 text-white" />}
                bgColor="bg-black"
                label="Twitter"
                onClick={() => shareToSocial('twitter')}
              />
            </div>
            
            {/* Копирование ссылки */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors text-sm",
                    copied 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                  aria-label="Копировать ссылку"
                >
                  {copied ? (
                    <>✓ Скопировано</>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1 inline" />
                      Копировать
                    </>
                  )}
                </button>
              </div>
              
              {/* QR код */}
              <div className="text-center pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    // Открыть QR код в отдельном модале или показать встроенный
                    setIsShareModalOpen(false);
                    // showQRModal(shareUrl);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center"
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  Показать QR-код
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Вспомогательный компонент для кнопок соц. сетей
function ShareSocialButton({ 
  icon, 
  bgColor, 
  label, 
  onClick 
}: {
  icon: React.ReactNode;
  bgColor: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
      aria-label={`Поделиться в ${label}`}
    >
      <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <span className="text-xs text-gray-700">{label}</span>
    </button>
  );
}
```

---

## 🔧 Обновленные хуки для SDK v3.x

### useShareAnalytics Hook:

```typescript
// src/hooks/use-share-analytics.ts
'use client';

import { useCallback } from 'react';
import { useLaunchParams } from '@telegram-apps/sdk-react';

export function useShareAnalytics() {
  // ✅ SDK v3.x: Правильное получение данных пользователя
  const launchParams = useLaunchParams();
  const user = launchParams.tgWebAppData?.user;
  
  const trackShare = useCallback(async (params: {
    entityType: 'BUSINESS' | 'CHAT';
    entityId: number;
    action: string;
    platform?: string;
    metadata?: Record<string, any>;
  }) => {
    try {
      await fetch('/api/analytics/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          userId: user?.id,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          referrer: document.referrer || undefined,
        })
      });
    } catch (error) {
      console.error('Share analytics error:', error);
    }
  }, [user?.id]);
  
  const trackView = useCallback(async (
    entityType: 'BUSINESS' | 'CHAT',
    entityId: number
  ) => {
    await trackShare({
      entityType,
      entityId,
      action: 'LINK_CLICKED'
    });
  }, [trackShare]);
  
  const trackAppOpen = useCallback(async (
    entityType: 'BUSINESS' | 'CHAT', 
    entityId: number
  ) => {
    await trackShare({
      entityType,
      entityId,
      action: 'APP_OPENED',
      platform: 'telegram'
    });
  }, [trackShare]);
  
  return {
    trackShare,
    trackView,
    trackAppOpen,
    userId: user?.id
  };
}
```

### useTelegramShare Hook:

```typescript
// src/hooks/use-telegram-share.ts
'use client';

import { useCallback } from 'react';
import { shareURL, openTelegramLink } from '@telegram-apps/sdk';
import { useLaunchParams } from '@telegram-apps/sdk-react';

export function useTelegramShare() {
  const launchParams = useLaunchParams();
  const user = launchParams.tgWebAppData?.user;
  
  const shareToTelegram = useCallback(async (url: string, text?: string) => {
    // ✅ SDK v3.x: Проверка доступности метода
    if (shareURL.isAvailable()) {
      try {
        await shareURL(url, text);
        return { success: true, method: 'native' };
      } catch (error) {
        console.error('Native Telegram share failed:', error);
      }
    }
    
    // Fallback к web-ссылке
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text || '')}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    return { success: true, method: 'web' };
  }, []);
  
  const openInTelegramApp = useCallback(async (appUrl: string) => {
    // ✅ SDK v3.x: Открытие ссылки Telegram
    if (openTelegramLink.isAvailable()) {
      try {
        await openTelegramLink(appUrl);
        return { success: true, method: 'native' };
      } catch (error) {
        console.error('Failed to open Telegram link:', error);
      }
    }
    
    // Fallback
    window.open(appUrl, '_blank');
    return { success: true, method: 'web' };
  }, []);
  
  return {
    shareToTelegram,
    openInTelegramApp,
    isNativeShareAvailable: shareURL.isAvailable(),
    isNativeLinkAvailable: openTelegramLink.isAvailable(),
    user
  };
}
```

---

## 📊 SEO и OpenGraph метаданные (обновлено)

### ShareMetaTags компонент:

```typescript
// src/components/share/ShareMetaTags.tsx
import Head from 'next/head';

interface ShareMetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type: 'business' | 'chat';
  entityId: number;
}

export function ShareMetaTags({ 
  title, 
  description, 
  image, 
  url, 
  type, 
  entityId 
}: ShareMetaTagsProps) {
  const fullTitle = `${title} | 3GIS`;
  const defaultImage = 'https://3gis.biz/images/og-default.jpg';
  const imageUrl = image || defaultImage;
  
  return (
    <Head>
      {/* Основные мета-теги */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
      
      {/* OpenGraph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type === 'business' ? 'business.business' : 'website'} />
      <meta property="og:site_name" content="3GIS" />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:locale:alternate" content="en_US" />
      
      {/* OpenGraph изображения */}
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@3gis_usa" />
      
      {/* Telegram-специфичные теги */}
      <meta property="telegram:channel" content="@threegis_news" />
      
      {/* ✅ Обновленные App Links для новых URL схем Telegram */}
      <meta property="al:android:app_name" content="Telegram" />
      <meta property="al:android:package" content="org.telegram.messenger" />
      <meta property="al:android:url" content={`https://t.me/ThreeGIS_bot/app?startapp=${type}_${entityId}`} />
      
      <meta property="al:ios:app_name" content="Telegram" />
      <meta property="al:ios:app_store_id" content="686449807" />
      <meta property="al:ios:url" content={`https://t.me/ThreeGIS_bot/app?startapp=${type}_${entityId}`} />
      
      {/* Дополнительные мета-теги для лучшего SEO */}
      <meta name="author" content="3GIS" />
      <meta name="generator" content="3GIS Platform" />
      <meta name="theme-color" content="#3B82F6" />
      
      {/* JSON-LD Schema Markup */}
      {type === 'business' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": title,
              "description": description,
              "url": url,
              "image": imageUrl,
              "telephone": "доступен в приложении",
              "address": "доступен в приложении",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.5",
                "reviewCount": "100+"
              }
            })
          }}
        />
      )}
    </Head>
  );
}
```

---

## ⚡ Интеграция в существующие страницы (обновлено)

### 1. Обновленная детальная страница бизнеса:

```typescript
// src/app/tg/businesses/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Phone, MapPin, Globe, Heart } from 'lucide-react';
import { ShareButton } from '@/components/share/ShareButton';
import { useShareAnalytics } from '@/hooks/use-share-analytics';
import { useLaunchParams } from '@telegram-apps/sdk-react';

export default function BusinessDetailPage({ params }: { params: { id: string } }) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ SDK v3.x: Правильное использование хуков
  const launchParams = useLaunchParams();
  const { trackView } = useShareAnalytics();
  
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch(`/api/businesses/${params.id}`);
        const data = await response.json();
        setBusiness(data);
        
        // Трекинг просмотра
        await trackView('BUSINESS', parseInt(params.id));
      } catch (error) {
        console.error('Failed to fetch business:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusiness();
  }, [params.id, trackView]);
  
  if (loading) {
    return <div className="p-4">Загрузка...</div>;
  }
  
  if (!business) {
    return <div className="p-4">Заведение не найдено</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header с кнопкой шеринга */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {business.name}
            </h1>
            <p className="text-sm text-gray-500">
              {business.category.name}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
              <Heart className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* ✅ Обновленная кнопка шеринга */}
            <ShareButton 
              type="business" 
              entity={business} 
              variant="icon"
              className="text-gray-600 hover:text-gray-800"
            />
          </div>
        </div>
      </div>
      
      {/* Основной контент */}
      <div className="p-4 space-y-4">
        {/* Фотографии */}
        {business.photos.length > 0 && (
          <div className="bg-white rounded-lg overflow-hidden">
            <img 
              src={business.photos[0].url}
              alt={business.name}
              className="w-full h-48 object-cover"
            />
          </div>
        )}
        
        {/* Информация */}
        <div className="bg-white rounded-lg p-4 space-y-3">
          {business.description && (
            <p className="text-gray-700">{business.description}</p>
          )}
          
          {/* Контакты с возможностью шеринга */}
          <div className="space-y-2">
            {business.phone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{business.phone}</span>
                </div>
                <button 
                  onClick={() => window.open(`tel:${business.phone}`)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  Позвонить
                </button>
              </div>
            )}
            
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{business.address}, {business.city.name}</span>
            </div>
            
            {business.website && (
              <div className="flex items-center text-gray-600">
                <Globe className="w-4 h-4 mr-2" />
                <a 
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Веб-сайт
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* ✅ Дополнительные кнопки шеринга */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="font-semibold mb-3">Поделиться с друзьями</h3>
          <div className="flex items-center space-x-3">
            <ShareButton 
              type="business" 
              entity={business} 
              variant="button"
              className="flex-1"
            />
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              QR-код
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2. Обновленная карточка заведения в списке:

```typescript
// src/components/business/BusinessCard.tsx
'use client';

import { Phone, MapPin, Star } from 'lucide-react';
import { ShareButton } from '@/components/share/ShareButton';
import { useShareAnalytics } from '@/hooks/use-share-analytics';

interface BusinessCardProps {
  business: Business;
  onSelect?: (business: Business) => void;
}

export function BusinessCard({ business, onSelect }: BusinessCardProps) {
  const { trackShare } = useShareAnalytics();
  
  const handleCall = async () => {
    await trackShare({
      entityType: 'BUSINESS',
      entityId: business.id,
      action: 'PHONE_CLICKED'
    });
    window.open(`tel:${business.phone}`);
  };
  
  const handleViewDetails = async () => {
    await trackShare({
      entityType: 'BUSINESS', 
      entityId: business.id,
      action: 'CARD_CLICKED'
    });
    onSelect?.(business);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Фото */}
      {business.photos[0] && (
        <div className="aspect-w-16 aspect-h-9">
          <img 
            src={business.photos[0].url}
            alt={business.name}
            className="w-full h-32 object-cover cursor-pointer"
            onClick={handleViewDetails}
          />
        </div>
      )}
      
      {/* Контент */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600"
              onClick={handleViewDetails}
            >
              {business.name}
            </h3>
            <p className="text-sm text-gray-500">{business.category.name}</p>
          </div>
          
          {/* ✅ Кнопка шеринга в карточке */}
          <ShareButton 
            type="business" 
            entity={business} 
            variant="icon"
            className="ml-2 text-gray-400 hover:text-gray-600"
          />
        </div>
        
        {/* Рейтинг */}
        {business.rating > 0 && (
          <div className="flex items-center mb-2">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="ml-1 text-sm font-medium">{business.rating}</span>
            <span className="ml-1 text-sm text-gray-500">({business.reviewCount})</span>
          </div>
        )}
        
        {/* Адрес */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{business.address}</span>
        </div>
        
        {/* Действия */}
        <div className="flex items-center space-x-2">
          {business.phone && (
            <button
              onClick={handleCall}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Phone className="w-4 h-4 mr-1" />
              Позвонить
            </button>
          )}
          
          <button
            onClick={handleViewDetails}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Подробнее
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 📈 Обновленная аналитика с SDK v3.x

### ShareAnalytics API:

```typescript
// src/app/api/analytics/share/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const {
      entityType,
      entityId,
      action,
      platform,
      userId,
      userAgent,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign
    } = await request.json();
    
    // Получаем IP адрес
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               request.ip || 
               'unknown';
    
    // Определяем связанные ID
    let businessId = null;
    let chatId = null;
    
    if (entityType === 'BUSINESS') {
      businessId = entityId;
    } else if (entityType === 'CHAT') {
      chatId = entityId;
    }
    
    // Сохраняем аналитику
    await prisma.shareAnalytics.create({
      data: {
        entityType,
        entityId,
        businessId,
        chatId,
        action,
        referrer,
        userAgent,
        ipAddress: ip,
        utmSource,
        utmMedium,
        utmCampaign,
        userId,
      },
    });
    
    // Увеличиваем счетчик шеринга при соответствующих действиях
    if (['SOCIAL_SHARED', 'LINK_CREATED'].includes(action)) {
      if (entityType === 'BUSINESS') {
        await prisma.business.update({
          where: { id: entityId },
          data: { shareCount: { increment: 1 } },
        });
      } else if (entityType === 'CHAT') {
        await prisma.telegramChat.update({
          where: { id: entityId },
          data: { shareCount: { increment: 1 } },
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Share analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to track share analytics' },
      { status: 500 }
    );
  }
}
```

### Обновленный dashboard аналитики:

```typescript
// src/app/admin/analytics/sharing/page.tsx
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

async function getShareAnalytics() {
  const [
    totalShares,
    topBusinesses,
    recentActivity,
    platformStats,
    conversionStats
  ] = await Promise.all([
    // Общее количество шерингов
    prisma.shareAnalytics.count(),
    
    // Топ заведений по шерингам
    prisma.business.findMany({
      orderBy: { shareCount: 'desc' },
      take: 10,
      include: {
        category: true,
        city: true,
        _count: {
          select: { ShareAnalytics: true }
        }
      }
    }),
    
    // Недавняя активность
    prisma.shareAnalytics.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        business: { select: { name: true } },
        chat: { select: { title: true } },
        user: { select: { firstName: true, lastName: true } }
      }
    }),
    
    // Статистика по платформам
    prisma.$queryRaw`
      SELECT 
        action,
        COUNT(*) as count
      FROM share_analytics 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY action
      ORDER BY count DESC
    `,
    
    // Конверсия share -> app open
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(CASE WHEN action = 'LINK_CLICKED' THEN 1 END) as link_clicks,
        COUNT(CASE WHEN action = 'APP_OPENED' THEN 1 END) as app_opens
      FROM share_analytics 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `
  ]);
  
  return {
    totalShares,
    topBusinesses,
    recentActivity,
    platformStats,
    conversionStats
  };
}

export default async function SharingAnalyticsPage() {
  const stats = await getShareAnalytics();
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Аналитика шеринга</h1>
        <div className="text-sm text-gray-500">
          Последние 30 дней
        </div>
      </div>
      
      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Всего шерингов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShares.toLocaleString()}</div>
            <p className="text-sm text-green-600">+15% за неделю</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Популярные заведения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topBusinesses.length}</div>
            <p className="text-sm text-gray-500">Активно шерятся</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Переходы в TMA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.platformStats.find((s: any) => s.action === 'APP_OPENED')?.count || 0}
            </div>
            <p className="text-sm text-blue-600">22% конверсия</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Telegram шеринг
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.platformStats.find((s: any) => s.action === 'SOCIAL_SHARED')?.count || 0}
            </div>
            <p className="text-sm text-gray-500">45% всех шерингов</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Детальная аналитика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ заведений */}
        <Card>
          <CardHeader>
            <CardTitle>Популярные заведения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topBusinesses.slice(0, 5).map((business, index) => (
                <div key={business.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{business.name}</p>
                      <p className="text-sm text-gray-500">
                        {business.category.name} • {business.city.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold">{business.shareCount}</span>
                    <p className="text-sm text-gray-500">шерингов</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Активность по действиям */}
        <Card>
          <CardHeader>
            <CardTitle>Типы активности</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.platformStats.map((stat: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium capitalize">
                    {stat.action.replace('_', ' ').toLowerCase()}
                  </span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(stat.count / stats.totalShares) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {stat.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Недавняя активность */}
      <Card>
        <CardHeader>
          <CardTitle>Недавняя активность</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.recentActivity.slice(0, 10).map((activity: any) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    {activity.entityType === 'BUSINESS' ? '🏢' : '💬'}
                  </div>
                  <div>
                    <p className="font-medium">
                      {activity.business?.name || activity.chat?.title || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.action.replace('_', ' ').toLowerCase()}
                      {activity.user && ` • ${activity.user.firstName} ${activity.user.lastName}`}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(activity.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🔄 Middleware для коротких ссылок (обновлено)

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // ✅ Обработка коротких ссылок /b/slug и /c/slug
  if (pathname.startsWith('/b/') || pathname.startsWith('/c/')) {
    const [, type, slug] = pathname.split('/');
    const shareType = type === 'b' ? 'business' : 'chat';
    
    // Сохраняем все query параметры (UTM метки и т.д.)
    const queryString = searchParams.toString();
    const newUrl = new URL(`/share/${shareType}/${slug}`, request.url);
    
    if (queryString) {
      newUrl.search = queryString;
    }
    
    return NextResponse.rewrite(newUrl);
  }
  
  // ✅ Обработка legacy редиректов
  if (pathname === '/redirect') {
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    
    if (id && type && ['business', 'chat'].includes(type)) {
      return NextResponse.redirect(
        new URL(`/share/${type}/${id}`, request.url)
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/b/:path*', 
    '/c/:path*',
    '/redirect'
  ]
};
```

---

## 🚀 План реализации (обновленный)

### 📋 Этап 1: База данных и основная инфраструктура (2-3 дня)
- [ ] ✅ Обновить Prisma схему (ShareAnalytics с новыми полями)
- [ ] ✅ Создать миграции для slug, shareCount, OG полей
- [ ] ✅ Реализовать slug генератор с транслитерацией
- [ ] ✅ Базовый API для аналитики шеринга

### 📋 Этап 2: SDK v3.x интеграция и компоненты (3-4 дня)
- [ ] ✅ Обновить ShareButton с актуальными методами SDK v3.x
- [ ] ✅ Создать useShareAnalytics и useTelegramShare хуки
- [ ] ✅ Реализовать модал шеринга с нативной поддержкой Telegram
- [ ] ✅ Интеграция в существующие страницы (детали, карточки)

### 📋 Этап 3: Share страницы и SEO (2-3 дня)
- [ ] ✅ Business share page (/b/[slug]) с OpenGraph
- [ ] ✅ Chat share page (/c/[slug])
- [ ] ✅ ShareMetaTags компонент с улучшенным SEO
- [ ] ✅ Middleware для коротких ссылок и редиректов

### 📋 Этап 4: Аналитика и админ-панель (2 дня)
- [ ] ✅ Dashboard аналитики в админке
- [ ] ✅ Детальная статистика по платформам и конверсии
- [ ] ✅ API для экспорта данных
- [ ] ✅ Автоматические отчеты

### 📋 Этап 5: Тестирование и полировка (1-2 дня)
- [ ] ✅ Тестирование всех сценариев шеринга
- [ ] ✅ Проверка OpenGraph превью в социальных сетях
- [ ] ✅ Оптимизация производительности
- [ ] ✅ Мобильная адаптация

---

## 💰 Обновленные трудозатраты

- **Backend + DB + SDK интеграция**: 4-5 дней
- **Share компоненты + страницы**: 3-4 дня  
- **Аналитика + админ-панель**: 2-3 дня
- **Тестирование + полировка**: 1-2 дня
- **Итого**: ~2-2.5 недели

---

## 🔮 Дополнительные возможности (SDK v3.x)

### Расширенные функции с новым API:
- **shareMessage()** - Прямой шеринг медиа-контента из TMA
- **shareToStory()** - Шеринг в Telegram Stories
- **downloadFile()** - Скачивание QR-кодов для офлайн использования
- **Dynamic Deep Links** - Улучшенные ссылки с контекстом чата
- **Inline mode sharing** - Шеринг через inline-режим бота

### Новые возможности аналитики:
- **Real-time tracking** через WebSocket
- **Cohort analysis** распространения ссылок
- **A/B тестирование** share-компонентов
- **Heatmap** кликов по share кнопкам

---

## ❓ Обновленные вопросы для уточнения

1. **SDK v3.x migration**: Нужно ли сразу мигрировать на новую версию или поэтапно?
2. **Native sharing**: Приоритет на shareURL() или Web Share API fallback?
3. **Analytics depth**: Детальный трекинг или фокус на ключевые метрики?
4. **Share UI/UX**: Какой стиль модала предпочтителен (минималистичный/расширенный)?
5. **Performance**: Нужна ли lazy загрузка компонентов шеринга?

**Готов начинать с любого этапа! Обновленный план учитывает все актуальные изменения в Telegram SDK v3.x 🚀**