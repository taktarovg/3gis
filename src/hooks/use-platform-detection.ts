// Добавляем объявление типов для Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        openLink: (url: string) => void;
        sendData: (data: string) => void;
        initData: string;
        ready: () => void;
      };
    };
  }
}'use client';

import { useLaunchParams } from '@telegram-apps/sdk-react';
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

  // Используем новый v3 хук для получения launch параметров
  let launchParams: any = null;
  try {
    launchParams = useLaunchParams();
  } catch (error) {
    // В случае ошибки считаем что это не Telegram окружение
    console.log('Not in Telegram environment:', error);
  }

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTelegram = !!launchParams || !!window?.Telegram?.WebApp;
    
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

    const newPlatform = {
      isTelegram,
      isMobile,
      isDesktop: !isMobile,
      canMakeCall,
      canOpenMaps,
      platform: detectedPlatform
    };

    // Обновляем только если изменилось
    if (JSON.stringify(platform) !== JSON.stringify(newPlatform)) {
      setPlatform(newPlatform);
    }

    // Логирование для отладки
    console.log('🔍 Platform Detection:', {
      userAgent: userAgent.substring(0, 100),
      isTelegram,
      isMobile,
      launchParamsAvailable: !!launchParams,
      telegramWebAppAvailable: !!window?.Telegram?.WebApp,
      platform: detectedPlatform
    });

  }, [launchParams, platform]); // Добавили platform в зависимости

  return platform;
}

/**
 * Хук для smart действий с учетом платформы
 */
export function usePlatformActions() {
  const platform = usePlatformDetection();
  let launchParams: any = null;
  
  try {
    launchParams = useLaunchParams();
  } catch (error) {
    // Игнорируем ошибку если не в Telegram окружении
  }

  const makeCall = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (platform.isTelegram && window?.Telegram?.WebApp) {
      // В Telegram используем WebApp API
      window.Telegram.WebApp.openLink(`tel:${cleanPhone}`);
    } else {
      // В обычном браузере
      window.open(`tel:${cleanPhone}`, '_self');
    }
  };

  const openMaps = (address: string) => {
    const query = encodeURIComponent(address);
    const mapsUrl = `https://maps.google.com/?q=${query}`;
    
    if (platform.isTelegram && window?.Telegram?.WebApp) {
      // В Telegram открываем через WebApp API
      window.Telegram.WebApp.openLink(mapsUrl);
    } else {
      // В обычном браузере
      window.open(mapsUrl, '_blank');
    }
  };

  const shareLocation = (businessName: string, url: string) => {
    if (platform.isTelegram && window?.Telegram?.WebApp) {
      // В Telegram можем отправить сообщение
      window.Telegram.WebApp.sendData(JSON.stringify({
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
