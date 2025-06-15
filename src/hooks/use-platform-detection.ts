'use client';

import { useTelegramWebApp } from '@telegram-apps/sdk-react';
import { useEffect, useState } from 'react';

/**
 * Хук для определения контекста запуска приложения
 */
export function usePlatformDetection() {
  const [platform, setPlatform] = useState<{
    isTelegram: boolean;
    isMobile: boolean;
    isDesktop: boolean;
    canMakeCall: boolean;
    canOpenMaps: boolean;
    platform: 'telegram-mobile' | 'telegram-desktop' | 'web-mobile' | 'web-desktop';
  }>({
    isTelegram: false,
    isMobile: false,
    isDesktop: false,
    canMakeCall: false,
    canOpenMaps: false,
    platform: 'web-desktop'
  });

  const webApp = useTelegramWebApp();

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTelegram = !!webApp && !!webApp.initData;
    
    // Более точное определение Telegram контекста
    const isTelegramMobile = isTelegram && isMobile;
    const isTelegramDesktop = isTelegram && !isMobile;
    
    // Возможности платформы
    const canMakeCall = isTelegramMobile || (isMobile && 'tel:' in navigator);
    const canOpenMaps = isTelegramMobile || isMobile;

    let detectedPlatform: typeof platform.platform = 'web-desktop';
    if (isTelegramMobile) detectedPlatform = 'telegram-mobile';
    else if (isTelegramDesktop) detectedPlatform = 'telegram-desktop';
    else if (isMobile) detectedPlatform = 'web-mobile';

    setPlatform({
      isTelegram,
      isMobile,
      isDesktop: !isMobile,
      canMakeCall,
      canOpenMaps,
      platform: detectedPlatform
    });

    // Логирование для отладки
    console.log('🔍 Platform Detection:', {
      userAgent: userAgent.substring(0, 100),
      isTelegram,
      isMobile,
      webAppAvailable: !!webApp,
      initDataAvailable: !!webApp?.initData,
      platform: detectedPlatform
    });

  }, [webApp]);

  return platform;
}

/**
 * Хук для smart действий с учетом платформы
 */
export function usePlatformActions() {
  const platform = usePlatformDetection();
  const webApp = useTelegramWebApp();

  const makeCall = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (platform.isTelegram && webApp) {
      // В Telegram используем WebApp API
      webApp.openLink(`tel:${cleanPhone}`);
    } else {
      // В обычном браузере
      window.open(`tel:${cleanPhone}`, '_self');
    }
  };

  const openMaps = (address: string) => {
    const query = encodeURIComponent(address);
    const mapsUrl = `https://maps.google.com/?q=${query}`;
    
    if (platform.isTelegram && webApp) {
      // В Telegram открываем через WebApp API
      webApp.openLink(mapsUrl);
    } else {
      // В обычном браузере
      window.open(mapsUrl, '_blank');
    }
  };

  const shareLocation = (businessName: string, url: string) => {
    if (platform.isTelegram && webApp) {
      // В Telegram можем отправить сообщение
      webApp.sendData(JSON.stringify({
        type: 'share_business',
        name: businessName,
        url: url
      }));
    } else if (navigator.share) {
      // Web Share API
      navigator.share({
        title: businessName,
        text: `Посмотри это место: ${businessName}`,
        url: url
      });
    } else {
      // Fallback - копирование в буфер
      navigator.clipboard.writeText(url);
      alert('Ссылка скопирована в буфер обмена');
    }
  };

  return {
    platform,
    makeCall,
    openMaps,
    shareLocation
  };
}
