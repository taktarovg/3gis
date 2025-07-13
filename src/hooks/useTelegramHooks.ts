// src/hooks/useTelegramHooks.ts
import { useTelegram } from '@/components/providers/TelegramProvider';

/**
 * ✅ Хук для обратной совместимости с проверкой среды
 */
export function useTelegramEnvironment() {
  const { isTelegramEnvironment } = useTelegram();
  
  return {
    isTelegramEnvironment,
    isWebApp: isTelegramEnvironment,
    isDevelopment: process.env.NODE_ENV === 'development'
  };
}

/**
 * ✅ Хук для обратной совместимости с авторизацией
 */
export function useTelegramAuth() {
  // ✅ ИСПРАВЛЕНИЕ: Убираем несуществующее свойство initData
  const { user, isAuthenticated, error, isReady, launchParams, rawInitData } = useTelegram();
  
  return {
    user,
    isAuthenticated,
    error,
    isLoading: !isReady,
    // ✅ ИСПРАВЛЕНО: Используем rawInitData вместо несуществующего initData
    initData: rawInitData,
    webAppData: rawInitData,
    launchParams: launchParams,
    rawInitData: rawInitData
  };
}
