// src/utils/telegram-sdk.ts
import type { TelegramUser, TelegramInitData, EnvironmentChecks } from '@/types/telegram';

/**
 * ✅ ИСПРАВЛЕНО: Безопасная функция для извлечения пользователя из разных источников SDK v3.x
 */
export function extractUserSafely(source: unknown, sourceName: string): TelegramUser | null {
  try {
    let user: TelegramUser | null = null;
    
    if (!source) {
      console.log(`🔍 ${sourceName}: источник пустой`);
      return null;
    }
    
    // Источник 1: Прямой объект пользователя
    if (typeof source === 'object' && source !== null && 'user' in source) {
      const sourceObj = source as { user?: unknown };
      if (sourceObj.user && typeof sourceObj.user === 'object') {
        user = sourceObj.user as TelegramUser;
        console.log(`✅ ${sourceName}: найден user объект напрямую`);
      }
    }
    // Источник 2: tgWebAppData с пользователем
    else if (typeof source === 'object' && source !== null && 'tgWebAppData' in source) {
      const sourceObj = source as { tgWebAppData?: { user?: unknown } };
      if (sourceObj.tgWebAppData?.user && typeof sourceObj.tgWebAppData.user === 'object') {
        user = sourceObj.tgWebAppData.user as TelegramUser;
        console.log(`✅ ${sourceName}: найден user в tgWebAppData`);
      }
    }
    // Источник 3: Строковый формат initData
    else if (typeof source === 'string') {
      const params = new URLSearchParams(source);
      const userStr = params.get('user');
      if (userStr) {
        user = JSON.parse(userStr) as TelegramUser;
        console.log(`✅ ${sourceName}: user извлечен из строки`);
      }
    }
    // Источник 4: Объект с данными параметров
    else if (typeof source === 'object' && source !== null) {
      // Ищем user в любом месте объекта
      const findUserInObject = (obj: Record<string, unknown>): TelegramUser | null => {
        if (obj.user && typeof obj.user === 'object') return obj.user as TelegramUser;
        if (obj.initData && typeof obj.initData === 'object') {
          const initDataObj = obj.initData as Record<string, unknown>;
          if (initDataObj.user && typeof initDataObj.user === 'object') {
            return initDataObj.user as TelegramUser;
          }
        }
        if (obj.webAppData && typeof obj.webAppData === 'object') {
          const webAppDataObj = obj.webAppData as Record<string, unknown>;
          if (webAppDataObj.user && typeof webAppDataObj.user === 'object') {
            return webAppDataObj.user as TelegramUser;
          }
        }
        
        // Поиск в глубину
        for (const key in obj) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            const found = findUserInObject(obj[key] as Record<string, unknown>);
            if (found) return found;
          }
        }
        return null;
      };
      
      user = findUserInObject(source as Record<string, unknown>);
      if (user) {
        console.log(`✅ ${sourceName}: user найден в объекте (глубокий поиск)`);
      }
    }
    
    // Валидация найденного пользователя
    if (user && typeof user === 'object' && user !== null) {
      const userObj = user as unknown as Record<string, unknown>;
      if (userObj.id && userObj.first_name) {
        console.log(`✅ ${sourceName}: валидный user:`, {
          id: userObj.id,
          name: userObj.first_name,
          username: userObj.username
        });
        return user;
      }
    }
    
    if (user) {
      console.warn(`⚠️ ${sourceName}: найден user но он невалидный:`, user);
    }
    
    return null;
  } catch (error) {
    console.error(`❌ ${sourceName}: ошибка извлечения user:`, error);
    return null;
  }
}

/**
 * ✅ ИСПРАВЛЕНО: Проверка среды Telegram с правильной типизацией
 */
export function checkTelegramEnvironment(): { 
  isLikelyTelegram: boolean; 
  checks: EnvironmentChecks; 
  positiveChecks: number 
} {
  if (typeof window === 'undefined') {
    const emptyChecks: EnvironmentChecks = {
      hasWebApp: false,
      hasInitData: false,
      hasWebAppInUrl: false,
      hasTelegramUA: false,
      hasTelegramReferrer: false,
      hasWebAppObject: false
    };
    return { isLikelyTelegram: false, checks: emptyChecks, positiveChecks: 0 };
  }

  const environmentChecks: EnvironmentChecks = {
    hasWebApp: !!(window as any)?.Telegram?.WebApp,
    hasInitData: !!(window as any)?.Telegram?.WebApp?.initData,
    hasWebAppInUrl: window.location.href.includes('tgWebApp'),
    hasTelegramUA: navigator.userAgent.includes('TelegramBot') || 
                   navigator.userAgent.includes('Telegram') ||
                   navigator.userAgent.includes('tgWebApp'),
    hasTelegramReferrer: document.referrer.includes('telegram'),
    hasWebAppObject: typeof (window as any)?.Telegram?.WebApp?.ready === 'function'
  };
  
  const positiveChecks = Object.values(environmentChecks).filter(Boolean).length;
  const isLikelyTelegram = positiveChecks >= 2;
  
  return { isLikelyTelegram, checks: environmentChecks, positiveChecks };
}

/**
 * ✅ ИСПРАВЛЕНО: Создание mock пользователя для fallback
 */
export function createMockUser(): { user: TelegramUser; initData: TelegramInitData; rawInitData: string } {
  const mockUser: TelegramUser = {
    id: Math.floor(Math.random() * 1000000000),
    first_name: 'Георгий',
    last_name: 'Тактаров',
    username: 'taktarovgv',
    language_code: 'ru',
    is_premium: false,
    allows_write_to_pm: true,
    photo_url: 'https://t.me/i/userpic/320/4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg'
  };

  const initData: TelegramInitData = {
    user: mockUser,
    auth_date: Math.floor(Date.now() / 1000),
    hash: '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31',
    start_param: 'debug',
    chat_type: 'sender',
    chat_instance: '8428209589180549439',
    isMock: true,
    isDevFallback: true
  };
  
  const rawInitData = new URLSearchParams([
    ['user', JSON.stringify(mockUser)],
    ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
    ['auth_date', Math.floor(Date.now() / 1000).toString()],
    ['start_param', 'debug'],
    ['chat_type', 'sender'],
    ['chat_instance', '8428209589180549439'],
  ]).toString();

  return { user: mockUser, initData, rawInitData };
}

/**
 * ✅ ИСПРАВЛЕНО: Безопасная настройка Telegram WebApp
 */
export function setupTelegramWebApp(): void {
  if (typeof window === 'undefined' || !(window as any)?.Telegram?.WebApp) {
    return;
  }

  const tg = (window as any).Telegram.WebApp;
  console.log('🎯 Настройка Telegram WebApp...');
  
  try {
    // Основные настройки
    if (typeof tg.ready === 'function') {
      tg.ready();
      console.log('✅ WebApp.ready() выполнен');
    }
    
    if (typeof tg.expand === 'function') {
      tg.expand();
      console.log('✅ WebApp.expand() выполнен');
    }
    
    // Безопасные дополнительные настройки
    const safeFunctions = [
      { name: 'disableVerticalSwipes', fn: () => tg.disableVerticalSwipes?.() },
      { name: 'setHeaderColor', fn: () => tg.setHeaderColor?.('#ffffff') },
      { name: 'setBottomBarColor', fn: () => tg.setBottomBarColor?.('#ffffff') },
      { name: 'enableClosingConfirmation', fn: () => tg.enableClosingConfirmation?.() }
    ];

    safeFunctions.forEach(({ name, fn }) => {
      try {
        fn();
        console.log(`✅ ${name} настроено`);
      } catch (err) {
        console.log(`ℹ️ ${name} недоступно (это нормально для старых версий)`);
      }
    });
  } catch (err) {
    console.warn('⚠️ Ошибка настройки Telegram WebApp:', err);
  }
}
