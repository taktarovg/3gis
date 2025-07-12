// src/hooks/useTelegramDetection.ts
'use client';

import { useEffect, useState } from 'react';

/**
 * Хук для определения среды и получения данных Telegram WebApp
 * Совместим с @telegram-apps/sdk v3.x и Next.js 15.3.3
 * 
 * ИЗМЕНЕНИЯ В SDK v3.x:
 * - useLaunchParams() теперь возвращает объект с префиксом tgWebApp
 * - tgWebAppData содержит данные пользователя (вместо initData.user)
 * - Нет initDataRaw в результате useLaunchParams
 * - Нужно использовать useRawInitData() для получения сырых данных
 */

interface TelegramDetectionState {
  // Состояние загрузки
  isLoading: boolean;
  
  // Определение среды
  isTelegramWebApp: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  
  // Платформа и браузер
  platform: 'ios' | 'android' | 'windows' | 'mac' | 'linux' | 'unknown';
  userAgent: string;
  isTelegramBrowser: boolean;
  
  // Данные Telegram (SDK v3.x структура)
  telegramData: {
    user: any | null;
    initDataRaw: string | null;
    startParam: string | null;
    platform: string | null;
    version: string | null;
    colorScheme: string | null;
    themeParams: any | null;
  } | null;
  
  // Методы для взаимодействия
  canUseHapticFeedback: boolean;
  canUseNativeFeatures: boolean;
  
  // Ошибки
  errors: string[];
}

/**
 * Основной хук для определения Telegram окружения
 */
export function useTelegramDetection(): TelegramDetectionState {
  const [state, setState] = useState<TelegramDetectionState>({
    isLoading: true,
    isTelegramWebApp: false,
    isMobile: false,
    isDesktop: false,
    platform: 'unknown',
    userAgent: '',
    isTelegramBrowser: false,
    telegramData: null,
    canUseHapticFeedback: false,
    canUseNativeFeatures: false,
    errors: []
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent;
    const errors: string[] = [];
    
    // Определение платформы
    let platform: TelegramDetectionState['platform'] = 'unknown';
    if (/iPhone|iPad|iPod/i.test(userAgent)) platform = 'ios';
    else if (/Android/i.test(userAgent)) platform = 'android';
    else if (/Windows/i.test(userAgent)) platform = 'windows';
    else if (/Mac/i.test(userAgent)) platform = 'mac';
    else if (/Linux/i.test(userAgent)) platform = 'linux';
    
    // Определение мобильного устройства
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isDesktop = !isMobile;
    
    // Определение Telegram браузера
    const isTelegramBrowser = userAgent.includes('Telegram') || userAgent.includes('TelegramBot');
    
    // Проверка наличия Telegram WebApp API
    const isTelegramWebApp = !!(window as any).Telegram?.WebApp;
    
    let telegramData: TelegramDetectionState['telegramData'] = null;
    let canUseHapticFeedback = false;
    let canUseNativeFeatures = false;
    
    if (isTelegramWebApp) {
      try {
        const webApp = (window as any).Telegram.WebApp;
        
        // Получаем данные в формате, совместимом с SDK v3.x
        telegramData = {
          user: webApp.initDataUnsafe?.user || null,
          initDataRaw: webApp.initData || null,
          startParam: webApp.initDataUnsafe?.start_param || null,
          platform: webApp.platform || null,
          version: webApp.version || null,
          colorScheme: webApp.colorScheme || null,
          themeParams: webApp.themeParams || null
        };
        
        // Проверка доступности нативных функций
        canUseHapticFeedback = !!(webApp.HapticFeedback?.impactOccurred);
        canUseNativeFeatures = !!(webApp.ready && webApp.expand && webApp.close);
        
        // Вызываем ready() если доступно
        if (typeof webApp.ready === 'function') {
          webApp.ready();
        }
        
      } catch (error) {
        errors.push(`Failed to initialize Telegram WebApp: ${error}`);
        console.error('[TelegramDetection] WebApp initialization error:', error);
      }
    } else if (process.env.NODE_ENV === 'development') {
      // Мок данные для разработки (аналогично SDK v3.x)
      telegramData = {
        user: {
          id: 99281932,
          first_name: 'Георгий',
          last_name: 'Тактаров',
          username: 'taktarovgv',
          language_code: 'ru',
          is_premium: false,
          allows_write_to_pm: true
        },
        initDataRaw: 'user=%7B%22id%22%3A99281932%2C%22first_name%22%3A%22%D0%93%D0%B5%D0%BE%D1%80%D0%B3%D0%B8%D0%B9%22%7D&auth_date=1640995200&hash=abc123',
        startParam: 'debug',
        platform: 'tdesktop',
        version: '7.0',
        colorScheme: 'light',
        themeParams: {
          bg_color: '#ffffff',
          text_color: '#000000',
          hint_color: '#999999',
          link_color: '#3390ec',
          button_color: '#3390ec',
          button_text_color: '#ffffff'
        }
      };
      
      canUseNativeFeatures = false;
      canUseHapticFeedback = false;
    }
    
    setState({
      isLoading: false,
      isTelegramWebApp,
      isMobile,
      isDesktop,
      platform,
      userAgent,
      isTelegramBrowser,
      telegramData,
      canUseHapticFeedback,
      canUseNativeFeatures,
      errors
    });
  }, []);

  return state;
}

/**
 * Хук для получения только данных пользователя Telegram
 */
export function useTelegramUser() {
  const detection = useTelegramDetection();
  
  return {
    user: detection.telegramData?.user || null,
    isLoading: detection.isLoading,
    isAvailable: detection.isTelegramWebApp,
    errors: detection.errors
  };
}

/**
 * Хук для работы с Telegram WebApp методами
 */
export function useTelegramWebApp() {
  const detection = useTelegramDetection();
  
  const methods = {
    // Haptic feedback
    hapticFeedback: (type: 'light' | 'medium' | 'heavy' = 'medium') => {
      if (detection.canUseHapticFeedback && (window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    },
    
    // Показать алерт
    showAlert: (message: string) => {
      if (detection.isTelegramWebApp && (window as any).Telegram?.WebApp?.showAlert) {
        (window as any).Telegram.WebApp.showAlert(message);
      } else {
        alert(message);
      }
    },
    
    // Закрыть приложение
    close: () => {
      if (detection.canUseNativeFeatures && (window as any).Telegram?.WebApp?.close) {
        (window as any).Telegram.WebApp.close();
      }
    },
    
    // Расширить окно
    expand: () => {
      if (detection.canUseNativeFeatures && (window as any).Telegram?.WebApp?.expand) {
        (window as any).Telegram.WebApp.expand();
      }
    },
    
    // Получить данные для авторизации
    getAuthData: () => {
      return {
        initData: detection.telegramData?.initDataRaw || null,
        user: detection.telegramData?.user || null,
        startParam: detection.telegramData?.startParam || null
      };
    }
  };
  
  return {
    ...methods,
    isAvailable: detection.isTelegramWebApp,
    canUseNativeFeatures: detection.canUseNativeFeatures,
    canUseHapticFeedback: detection.canUseHapticFeedback,
    telegramData: detection.telegramData,
    isLoading: detection.isLoading
  };
}

/**
 * Утилиты для работы с Telegram URLs и редиректами
 */
export const TelegramUtils = {
  /**
   * Создает ссылку для открытия Mini App в Telegram
   */
  createTelegramLink: (botUsername: string, startParam?: string): string => {
    const baseUrl = `https://t.me/${botUsername}/app`;
    return startParam ? `${baseUrl}?startapp=${startParam}` : baseUrl;
  },
  
  /**
   * Создает deep link для мобильных устройств
   */
  createDeepLink: (botUsername: string, startParam?: string): string => {
    const baseUrl = `tg://resolve?domain=${botUsername}&appname=app`;
    return startParam ? `${baseUrl}&startapp=${startParam}` : baseUrl;
  },
  
  /**
   * Пытается открыть Mini App в Telegram
   */
  openInTelegram: (botUsername: string, startParam?: string, isMobile: boolean = false) => {
    const telegramUrl = TelegramUtils.createTelegramLink(botUsername, startParam);
    
    // Основная попытка через web link
    window.open(telegramUrl, '_blank');
    
    // Для мобильных устройств также пробуем deep link
    if (isMobile) {
      setTimeout(() => {
        const deepLink = TelegramUtils.createDeepLink(botUsername, startParam);
        window.location.href = deepLink;
      }, 1000);
    }
  },
  
  /**
   * Проверяет, поддерживается ли Telegram в текущем браузере
   */
  isTelegramSupported: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent;
    
    // Telegram поддерживается в большинстве современных браузеров
    // Исключения: очень старые браузеры и некоторые embedded webviews
    const isOldBrowser = /MSIE|Trident/i.test(userAgent);
    const isEmbeddedWebView = /Instagram|FBAN|FBAV/i.test(userAgent);
    
    return !isOldBrowser && !isEmbeddedWebView;
  },
  
  /**
   * Получает инструкции для ручного открытия в зависимости от платформы
   */
  getInstructions: (botUsername: string, platform: string, isMobile: boolean): string[] => {
    if (isMobile) {
      return [
        'Нажмите кнопку "Открыть в Telegram" выше',
        'Выберите "Открыть в Telegram" во всплывающем окне',
        `Найдите бота @${botUsername}`,
        'Нажмите "Запустить" и выберите "Открыть приложение"'
      ];
    } else {
      return [
        'Откройте приложение Telegram на компьютере',
        `Найдите бота @${botUsername}`,
        'Отправьте команду /start',
        'Нажмите кнопку "Открыть приложение" в меню бота'
      ];
    }
  }
};
