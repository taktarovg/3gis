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
  const { user, isAuthenticated, error, isReady, initData, launchParams, rawInitData } = useTelegram();
  
  return {
    user,
    isAuthenticated,
    error,
    isLoading: !isReady,
    initData: initData,
    webAppData: initData,
    launchParams: launchParams,
    rawInitData: rawInitData
  };
}
