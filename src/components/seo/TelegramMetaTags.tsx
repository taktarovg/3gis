// src/components/seo/TelegramMetaTags.tsx
'use client';

import { useEffect } from 'react';

interface TelegramMetaTagsProps {
  startParam?: string;
}

/**
 * ✅ Компонент для добавления мета-тегов Telegram Deep Linking
 * Добавляет правильные теги для открытия в Telegram на мобильных устройствах
 */
export function TelegramMetaTags({ startParam }: TelegramMetaTagsProps) {
  useEffect(() => {
    // Добавляем мета-теги через DOM API для лучшей совместимости
    const metaTags = [
      // App Links для Android
      { property: 'al:android:url', content: `https://t.me/ThreeGIS_bot/app${startParam ? `?startapp=${startParam}` : ''}` },
      { property: 'al:android:app_name', content: 'Telegram' },
      { property: 'al:android:package', content: 'org.telegram.messenger' },
      
      // App Links для iOS
      { property: 'al:ios:url', content: `https://t.me/ThreeGIS_bot/app${startParam ? `?startapp=${startParam}` : ''}` },
      { property: 'al:ios:app_name', content: 'Telegram' },
      { property: 'al:ios:app_store_id', content: '686449807' },
      
      // Universal Links
      { property: 'al:web:url', content: 'https://web.telegram.org/k/#@ThreeGIS_bot' },
      
      // Twitter App Cards
      { name: 'twitter:app:name:iphone', content: 'Telegram' },
      { name: 'twitter:app:id:iphone', content: '686449807' },
      { name: 'twitter:app:url:iphone', content: `https://t.me/ThreeGIS_bot/app${startParam ? `?startapp=${startParam}` : ''}` },
      
      { name: 'twitter:app:name:googleplay', content: 'Telegram' },
      { name: 'twitter:app:id:googleplay', content: 'org.telegram.messenger' },
      { name: 'twitter:app:url:googleplay', content: `https://t.me/ThreeGIS_bot/app${startParam ? `?startapp=${startParam}` : ''}` },
      
      // Дополнительные теги для лучшего распознавания
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-title', content: '3GIS' },
    ];

    const addedTags: HTMLMetaElement[] = [];

    metaTags.forEach(({ property, name, content }) => {
      // Проверяем, что тег еще не существует
      const existingTag = document.querySelector(
        property ? `meta[property="${property}"]` : `meta[name="${name}"]`
      );
      
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
      }
    });

    // Cleanup при размонтировании
    return () => {
      addedTags.forEach(tag => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
    };
  }, [startParam]);

  return null; // Компонент не рендерит ничего видимого
}
