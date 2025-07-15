// src/hooks/useTelegramHooks.ts
import { useRawInitData } from '@telegram-apps/sdk-react';
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
 * ИСПРАВЛЕНО: Используем отдельный хук useRawInitData из SDK v3.x
 */
export function useTelegramAuth() {
  // ✅ ИСПРАВЛЕНИЕ: Убираем rawInitData из useTelegram() - его там нет в TelegramContextValue
  const { user, isAuthenticated, error, isReady, launchParams } = useTelegram();
  
  // ✅ ИСПРАВЛЕНИЕ: Используем отдельный хук для rawInitData согласно SDK v3.x документации
  const rawInitData = useRawInitData();
  
  return {
    user,
    isAuthenticated,
    error,
    isLoading: !isReady,
    // ✅ ИСПРАВЛЕНО: Теперь используем правильный источник rawInitData
    initData: rawInitData,
    webAppData: rawInitData,
    launchParams: launchParams,
    rawInitData: rawInitData
  };
}
