'use client';

import { useEffect, useState, useCallback } from 'react';

export type Platform = 'telegram-mobile' | 'telegram-desktop' | 'web-mobile' | 'web-desktop';

interface PlatformInfo {
  platform: Platform;
  isTelegram: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  canMakeCall: boolean;
  canOpenMaps: boolean;
  canUseHaptics: boolean;
}

/**
 * Хук для определения контекста запуска приложения
 * Безопасно работает в SSR и CSR окружениях
 */
export function usePlatformDetection(): PlatformInfo {
  const [platform, setPlatform] = useState<PlatformInfo>({
    platform: 'web-desktop',
    isTelegram: false,
    isMobile: false,
    isDesktop: true,
    canMakeCall: false,
    canOpenMaps: false,
    canUseHaptics: false,
  });

  const [isClient, setIsClient] = useState(false);

  // Определяем что мы на клиенте
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const detectPlatform = (): PlatformInfo => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // Проверяем наличие Telegram WebApp
      const hasTelegramWebApp = !!(window?.Telegram?.WebApp);
      const isTelegram = hasTelegramWebApp;
      
      // Определяем платформу
      let detectedPlatform: Platform = 'web-desktop';
      if (isTelegram && isMobile) {
        detectedPlatform = 'telegram-mobile';
      } else if (isTelegram && !isMobile) {
        detectedPlatform = 'telegram-desktop';
      } else if (!isTelegram && isMobile) {
        detectedPlatform = 'web-mobile';
      }

      // Возможности платформы
      const canMakeCall = isTelegram || isMobile;
      const canOpenMaps = true; // Все платформы могут открывать карты
      const canUseHaptics = isTelegram && isMobile && !!(window?.Telegram?.WebApp?.HapticFeedback);

      const result: PlatformInfo = {
        platform: detectedPlatform,
        isTelegram,
        isMobile,
        isDesktop: !isMobile,
        canMakeCall,
        canOpenMaps,
        canUseHaptics,
      };

      console.log('🔍 Platform Detection:', {
        userAgent: userAgent.substring(0, 100),
        hasTelegramWebApp,
        detectedPlatform,
        capabilities: {
          canMakeCall,
          canOpenMaps,
          canUseHaptics,
        }
      });

      return result;
    };

    const newPlatform = detectPlatform();
    setPlatform(newPlatform);
  }, [isClient]);

  return platform;
}

/**
 * Хук для smart действий с учетом платформы
 */
export function usePlatformActions() {
  const platform = usePlatformDetection();

  // ✅ ИСПРАВЛЕНО: Вынесли fallback функции наверх чтобы избежать циклических зависимостей
  const fallbackCopyToClipboard = useCallback((text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      alert('Ссылка скопирована в буфер обмена');
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      alert(`Ссылка: ${text}`);
    }
    document.body.removeChild(textArea);
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Ссылка скопирована в буфер обмена');
      }).catch(() => {
        fallbackCopyToClipboard(text);
      });
    } else {
      fallbackCopyToClipboard(text);
    }
  }, [fallbackCopyToClipboard]);

  const fallbackShare = useCallback((businessName: string, url: string) => {
    if (navigator.share) {
      // Web Share API
      navigator.share({
        title: businessName,
        text: `Посмотри это место: ${businessName}`,
        url: url
      }).catch(error => {
        console.error('Error sharing:', error);
        copyToClipboard(url);
      });
    } else {
      // Fallback - копирование в буфер
      copyToClipboard(url);
    }
  }, [copyToClipboard]);

  const makeCall = useCallback((phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (platform.isTelegram && window?.Telegram?.WebApp) {
      // В Telegram используем WebApp API
      window.Telegram.WebApp.openLink(`tel:+${cleanPhone}`);
    } else {
      // В обычном браузере
      window.location.href = `tel:+${cleanPhone}`;
    }
  }, [platform.isTelegram]);

  const openMaps = useCallback((address: string) => {
    const query = encodeURIComponent(address);
    const mapsUrl = `https://maps.google.com/?q=${query}`;
    
    if (platform.isTelegram && window?.Telegram?.WebApp) {
      // В Telegram открываем через WebApp API
      window.Telegram.WebApp.openLink(mapsUrl);
    } else {
      // В обычном браузере
      window.open(mapsUrl, '_blank');
    }
  }, [platform.isTelegram]);

  const shareLocation = useCallback((businessName: string, url: string) => {
    if (platform.isTelegram && window?.Telegram?.WebApp) {
      // В Telegram можем отправить сообщение
      try {
        window.Telegram.WebApp.sendData(JSON.stringify({
          type: 'share_business',
          name: businessName,
          url: url
        }));
      } catch (error) {
        console.error('Error sharing via Telegram:', error);
        // Fallback к обычному шерингу
        fallbackShare(businessName, url);
      }
    } else {
      fallbackShare(businessName, url);
    }
  }, [platform.isTelegram, fallbackShare]); // ✅ ИСПРАВЛЕНО: Добавили fallbackShare в зависимости

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (platform.canUseHaptics && window?.Telegram?.WebApp?.HapticFeedback) {
      try {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      } catch (error) {
        console.error('Error triggering haptic feedback:', error);
      }
    }
  }, [platform.canUseHaptics]);

  return {
    platform,
    makeCall,
    openMaps,
    shareLocation,
    triggerHaptic,
  };
}

/**
 * Хук для получения launch параметров безопасно
 */
export function useTelegramLaunchParams() {
  const [launchParams, setLaunchParams] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setLaunchParams(window.Telegram.WebApp.initDataUnsafe || null);
    }
    setIsLoading(false);
  }, []);

  return { launchParams, isLoading };
}
