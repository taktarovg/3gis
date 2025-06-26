'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { track3GISEvents } from '@/lib/analytics';

// Целевые ключевые слова для SEO отслеживания
export const TARGET_KEYWORDS = [
  'русскоязычные заведения США',
  'русские рестораны америка',
  'русские врачи США',
  'русские юристы америка',
  'русскоязычные услуги США',
  'русский справочник америка',
  'найти русскоязычного врача',
  'русские магазины США',
  'русская община америка',
  'иммиграция в США',
  'русскоязычный бизнес США'
];

/**
 * Проверяет является ли ключевое слово целевым для SEO
 */
export function isTargetKeyword(keyword: string): boolean {
  if (!keyword) return false;
  
  const normalizedKeyword = keyword.toLowerCase();
  return TARGET_KEYWORDS.some(target => 
    normalizedKeyword.includes(target.toLowerCase()) ||
    target.toLowerCase().includes(normalizedKeyword)
  );
}

/**
 * Хук для автоматического отслеживания источников трафика на лендинге
 * Анализирует UTM параметры и referrer для определения источника
 */
export function useTrafficTracking() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Анализируем UTM параметры
    const utmSource = searchParams.get('utm_source');
    const utmMedium = searchParams.get('utm_medium');
    const utmCampaign = searchParams.get('utm_campaign');
    const utmKeyword = searchParams.get('utm_term') || searchParams.get('q');
    
    // Анализируем referrer
    const referrer = typeof window !== 'undefined' ? document.referrer : '';
    let trafficSource = 'direct';
    let searchKeyword = utmKeyword || '';
    
    // Определяем источник трафика
    if (utmSource) {
      trafficSource = utmSource;
    } else if (referrer) {
      // Google поиск
      if (referrer.includes('google.')) {
        trafficSource = 'google_organic';
        const url = new URL(referrer);
        searchKeyword = url.searchParams.get('q') || 'unknown';
      }
      // Yandex поиск
      else if (referrer.includes('yandex.')) {
        trafficSource = 'yandex_organic';
        const url = new URL(referrer);
        searchKeyword = url.searchParams.get('text') || 'unknown';
      }
      // Bing поиск
      else if (referrer.includes('bing.')) {
        trafficSource = 'bing_organic';
        const url = new URL(referrer);
        searchKeyword = url.searchParams.get('q') || 'unknown';
      }
      // Facebook
      else if (referrer.includes('facebook.')) {
        trafficSource = 'facebook';
      }
      // Telegram
      else if (referrer.includes('t.me') || referrer.includes('telegram')) {
        trafficSource = 'telegram';
      }
      // VKontakte
      else if (referrer.includes('vk.com')) {
        trafficSource = 'vkontakte';
      }
      // Другие соцсети
      else if (referrer.includes('instagram.') || referrer.includes('twitter.') || referrer.includes('linkedin.')) {
        trafficSource = 'social_media';
      }
      // Другие сайты
      else {
        try {
          const referrerDomain = new URL(referrer).hostname;
          trafficSource = `referral_${referrerDomain.replace('www.', '')}`;
        } catch {
          trafficSource = 'referral_unknown';
        }
      }
    }
    
    // Отправляем событие с информацией об источнике трафика
    track3GISEvents.landingView(
      trafficSource,
      utmCampaign || 'none',
      searchKeyword || 'none'
    );
    
    // Сохраняем в localStorage для дальнейшего использования
    if (typeof window !== 'undefined') {
      const trafficData = {
        source: trafficSource,
        campaign: utmCampaign || 'none',
        keyword: searchKeyword || 'none',
        medium: utmMedium || 'none',
        timestamp: new Date().toISOString(),
        referrer: referrer
      };
      localStorage.setItem('3gis_traffic_source', JSON.stringify(trafficData));
    }
    
  }, [searchParams]);
}

/**
 * Хук для получения сохраненной информации об источнике трафика
 */
export function useStoredTrafficSource() {
  const getTrafficSource = () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem('3gis_traffic_source');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  return getTrafficSource();
}
