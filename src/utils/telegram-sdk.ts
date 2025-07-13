// src/utils/telegram-sdk.ts
import type { TelegramUser } from '@/types/telegram';

/**
 * ✅ УПРОЩЕННАЯ версия для SDK v3.x
 */
export function extractUserSafely(source: unknown, sourceName: string): TelegramUser | null {
  try {
    if (!source) {
      console.log(`🔍 ${sourceName}: источник пустой`);
      return null;
    }
    
    // Ищем пользователя в любой структуре
    let user: TelegramUser | null = null;
    
    if (typeof source === 'object' && source !== null) {
      const obj = source as any;
      
      // SDK v3.x структура: tgWebAppData.user
      if (obj.tgWebAppData?.user) {
        user = obj.tgWebAppData.user;
      }
      // Прямая структура: user
      else if (obj.user) {
        user = obj.user;
      }
    }
    
    // Валидация
    if (user?.id && user?.first_name) {
      console.log(`✅ ${sourceName}: найден валидный user:`, user.first_name);
      return user;
    }
    
    return null;
  } catch (error) {
    console.error(`❌ ${sourceName}: ошибка:`, error);
    return null;
  }
}

export function checkTelegramEnvironment() {
  if (typeof window === 'undefined') {
    return { isLikelyTelegram: false, checks: { hasWebApp: false, hasInitData: false } };
  }

  const hasWebApp = !!(window as any)?.Telegram?.WebApp;
  const hasInitData = !!(window as any)?.Telegram?.WebApp?.initData;
  
  return { 
    isLikelyTelegram: hasWebApp || hasInitData,
    checks: { hasWebApp, hasInitData }
  };
}

export function createMockUser() {
  const mockUser: TelegramUser = {
    id: 123456789,
    first_name: 'Dev',
    last_name: 'User',
    username: 'dev_user',
    language_code: 'ru',
    is_premium: false,
    allows_write_to_pm: true
  };

  return { user: mockUser };
}

export function setupTelegramWebApp(): void {
  if (typeof window === 'undefined' || !(window as any)?.Telegram?.WebApp) {
    return;
  }

  const tg = (window as any).Telegram.WebApp;
  
  try {
    tg.ready?.();
    tg.expand?.();
    console.log('✅ WebApp настроен');
  } catch (err) {
    console.warn('⚠️ Ошибка настройки WebApp:', err);
  }
}
