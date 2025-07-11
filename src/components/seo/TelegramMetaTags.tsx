// src/components/seo/TelegramMetaTags.tsx
'use client';

import { useEffect } from 'react';

interface TelegramMetaTagsProps {
  startParam?: string;
}

/**
 * ✅ УЛУЧШЕННЫЙ компонент для добавления мета-тегов Telegram Deep Linking
 * Исправления для корректной работы с https://www.3gis.biz/tg:
 * - Правильные App Links для автоматического редиректа
 * - Intent URLs для Android
 * - Universal Links для iOS
 * - Open Graph теги для красивого превью при шеринге
 */
export function TelegramMetaTags({ startParam }: TelegramMetaTagsProps) {
  const telegramUrl = startParam 
    ? `https://t.me/ThreeGIS_bot/app?startapp=${encodeURIComponent(startParam)}`
    : `https://t.me/ThreeGIS_bot/app`;

  const webTelegramUrl = startParam
    ? `https://web.telegram.org/k/#@ThreeGIS_bot?startapp=${encodeURIComponent(startParam)}`
    : `https://web.telegram.org/k/#@ThreeGIS_bot`;

  useEffect(() => {
    // ✅ ИСПРАВЛЕНИЕ: Добавляем мета-теги для автоматического редиректа
    const metaTags = [
      // ✅ ОСНОВНЫЕ App Links для Telegram
      { property: 'al:android:url', content: telegramUrl },
      { property: 'al:android:app_name', content: 'Telegram' },
      { property: 'al:android:package', content: 'org.telegram.messenger' },
      
      { property: 'al:ios:url', content: telegramUrl },
      { property: 'al:ios:app_name', content: 'Telegram' },
      { property: 'al:ios:app_store_id', content: '686449807' },
      
      // ✅ НОВОЕ: Intent URLs для Android (более надежные)
      { name: 'google-play-app', content: 'app-id=org.telegram.messenger' },
      
      // ✅ Universal Links fallback
      { property: 'al:web:url', content: webTelegramUrl },
      
      // ✅ УЛУЧШЕННЫЕ Twitter App Cards
      { name: 'twitter:card', content: 'app' },
      { name: 'twitter:site', content: '@telegram' },
      { name: 'twitter:title', content: '3GIS - Русскоязычный справочник в США' },
      { name: 'twitter:description', content: 'Найдите русскоязычные услуги рядом с вами. Рестораны, врачи, юристы и многое другое.' },
      
      { name: 'twitter:app:name:iphone', content: 'Telegram' },
      { name: 'twitter:app:id:iphone', content: '686449807' },
      { name: 'twitter:app:url:iphone', content: telegramUrl },
      
      { name: 'twitter:app:name:googleplay', content: 'Telegram' },
      { name: 'twitter:app:id:googleplay', content: 'org.telegram.messenger' },
      { name: 'twitter:app:url:googleplay', content: telegramUrl },
      
      // ✅ НОВОЕ: Open Graph теги для красивого превью
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: '3GIS - Русскоязычный справочник организаций в США' },
      { property: 'og:description', content: 'Найдите русскоязычные услуги рядом с вами. Более 1000 проверенных заведений в вашем городе.' },
      { property: 'og:image', content: 'https://3gis.us/og-image.png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: '3GIS - Русскоязычные услуги в США' },
      { property: 'og:url', content: 'https://3gis.us/tg' },
      { property: 'og:site_name', content: '3GIS' },
      { property: 'og:locale', content: 'ru_RU' },
      
      // ✅ НОВОЕ: Telegram-специфичные теги
      { name: 'telegram:channel', content: '@threegis_news' },
      
      // ✅ Mobile app теги для лучшего определения
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: '3GIS' },
      { name: 'application-name', content: '3GIS' },
      { name: 'msapplication-TileColor', content: '#3B82F6' },
      { name: 'theme-color', content: '#3B82F6' },
      
      // ✅ НОВОЕ: Schema.org для поисковиков
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: '3GIS Team' },
      { name: 'keywords', content: 'русский, справочник, США, рестораны, врачи, юристы, услуги, telegram' },
    ];

    const addedTags: HTMLElement[] = [];

    metaTags.forEach(({ property, name, content }) => {
      // Проверяем, что тег еще не существует
      const selector = property 
        ? `meta[property="${property}"]` 
        : `meta[name="${name}"]`;
      const existingTag = document.querySelector(selector);
      
      if (!existingTag) {
        const metaTag = document.createElement('meta');
        if (property) {
          metaTag.setAttribute('property', property);
        } else if (name) {
          metaTag.setAttribute('name', name);
        }
        metaTag.setAttribute('content', content);
        document.head.appendChild(metaTag);
        addedTags.push(metaTag);
      } else {
        // Обновляем существующий тег
        existingTag.setAttribute('content', content);
      }
    });

    // ✅ НОВОЕ: Добавляем JSON-LD структурированные данные
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "MobileApplication",
      "name": "3GIS",
      "description": "Русскоязычный справочник организаций в США",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Telegram",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "creator": {
        "@type": "Organization",
        "name": "3GIS Team"
      },
      "url": telegramUrl,
      "sameAs": [
        "https://t.me/ThreeGIS_bot",
        "https://t.me/threegis_news"
      ]
    };

    const existingJsonLd = document.querySelector('script[type="application/ld+json"]');
    if (!existingJsonLd) {
      const jsonLdScript = document.createElement('script');
      jsonLdScript.type = 'application/ld+json';
      jsonLdScript.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(jsonLdScript);
      addedTags.push(jsonLdScript);
    }

    // ✅ НОВОЕ: Добавляем title и description если их нет
    if (!document.title || document.title === '') {
      document.title = '3GIS - Откройте в Telegram для полного функционала';
    }

    let descriptionMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.setAttribute('name', 'description');
      document.head.appendChild(descriptionMeta);
      addedTags.push(descriptionMeta);
    }
    
    const description = startParam 
      ? `Откройте 3GIS в Telegram для доступа к русскоязычным услугам в США. Специальная ссылка: ${startParam}`
      : 'Откройте 3GIS в Telegram для поиска русскоязычных услуг в США. Рестораны, врачи, юристы и многое другое.';
    
    descriptionMeta.setAttribute('content', description);

    // ✅ НОВОЕ: Добавляем canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
      addedTags.push(canonicalLink);
    }
    canonicalLink.setAttribute('href', 'https://3gis.us/tg');

    // ✅ НОВОЕ: Добавляем favicon если его нет
    if (!document.querySelector('link[rel="icon"]')) {
      const favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      favicon.setAttribute('type', 'image/x-icon');
      favicon.setAttribute('href', '/favicon.ico');
      document.head.appendChild(favicon);
      addedTags.push(favicon);
    }

    // ✅ НОВОЕ: Apple touch icons
    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.setAttribute('rel', 'apple-touch-icon');
      appleTouchIcon.setAttribute('sizes', '180x180');
      appleTouchIcon.setAttribute('href', '/apple-touch-icon.png');
      document.head.appendChild(appleTouchIcon);
      addedTags.push(appleTouchIcon);
    }

    console.log('✅ TelegramMetaTags: добавлено мета-тегов:', addedTags.length);
    console.log('🔗 Telegram URL:', telegramUrl);
    console.log('🌐 Web Telegram URL:', webTelegramUrl);

    // Cleanup при размонтировании
    return () => {
      addedTags.forEach(tag => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
    };
  }, [startParam, telegramUrl, webTelegramUrl]);

  // ✅ НОВОЕ: Добавляем специальные intent схемы для Android через data атрибуты
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Добавляем data атрибуты к body для Android intent handling
      document.body.setAttribute('data-telegram-url', telegramUrl);
      document.body.setAttribute('data-telegram-bot', 'ThreeGIS_bot');
      
      // Добавляем кастомные ссылки для улучшенного deep linking
      const intentUrls = [
        `intent://${telegramUrl.replace('https://', '')}#Intent;scheme=https;package=org.telegram.messenger;end`,
        `tg://resolve?domain=ThreeGIS_bot&start=${startParam || 'app'}`,
        `telegram://resolve?domain=ThreeGIS_bot&start=${startParam || 'app'}`
      ];

      intentUrls.forEach((url, index) => {
        document.body.setAttribute(`data-intent-${index}`, url);
      });

      return () => {
        document.body.removeAttribute('data-telegram-url');
        document.body.removeAttribute('data-telegram-bot');
        intentUrls.forEach((_, index) => {
          document.body.removeAttribute(`data-intent-${index}`);
        });
      };
    }
  }, [telegramUrl, startParam]);

  return null; // Компонент не рендерит ничего видимого
}
