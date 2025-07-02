'use client';

import { useLaunchParams, useRawInitData } from '@telegram-apps/sdk-react';
import { useEffect, useState } from 'react';

// ✅ Правильные типы для Telegram SDK v3.x основанные на документации
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

// ✅ SDK v3.x возвращает объект с префиксом tgWebApp
interface LaunchParams {
  tgWebAppBotInline?: boolean;
  tgWebAppData?: {
    user?: TelegramUser;
    authDate?: Date;  // в v3.x authDate вместо auth_date
    queryId?: string; // в v3.x queryId вместо query_id  
    hash?: string;
  };
  tgWebAppStartParam?: string;
  tgWebAppThemeParams?: Record<string, string>;
  tgWebAppVersion?: string;
  tgWebAppPlatform?: string;
}

export function useTelegramAuth() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ SDK v3.x: Правильное безусловное использование хуков
  // В v3.x useLaunchParams не принимает SSR параметр - это обрабатывается автоматически
  const launchParams = useLaunchParams() as LaunchParams;
  const rawInitData = useRawInitData();
  
  useEffect(() => {
    try {
      // ✅ SDK v3.x: проверяем tgWebAppData 
      if (launchParams?.tgWebAppData?.user) {
        setUser(launchParams.tgWebAppData.user);
        setIsInitialized(true);
        console.log('✅ Telegram user loaded:', launchParams.tgWebAppData.user);
      } else if (typeof window !== 'undefined') {
        // Development mode - создаем mock пользователя
        if (process.env.NODE_ENV === 'development') {
          const mockUser: TelegramUser = {
            id: 123456789,
            first_name: 'Тест',
            last_name: 'Пользователь',
            username: 'test_user',
            language_code: 'ru'
          };
          setUser(mockUser);
          setIsInitialized(true);
          console.log('🔧 Development mode: Mock user created');
        } else {
          // Production без пользователя
          setIsInitialized(true);
          console.log('⚠️ No Telegram user data available');
        }
      }
    } catch (err) {
      console.error('Telegram Auth Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsInitialized(true);
    }
  }, [launchParams]);
  
  return {
    user,
    isInitialized,
    isLoading: !isInitialized, // ✅ Добавляем isLoading для совместимости
    error,
    rawInitData,
    isAuthenticated: !!user,
    userId: user?.id
  };
}

// ✅ Хук для проверки Telegram окружения
export function useTelegramEnvironment() {
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  const [isWebApp, setIsWebApp] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasTelegramWebApp = !!(window as any).Telegram?.WebApp;
      const hasInitData = !!new URLSearchParams(window.location.search).get('tgWebAppData');
      
      setIsTelegramEnvironment(hasTelegramWebApp || hasInitData);
      setIsWebApp(hasTelegramWebApp);
      
      console.log('🌐 Telegram Environment Check:', { 
        hasTelegramWebApp, 
        hasInitData, 
        isTelegramEnvironment: hasTelegramWebApp || hasInitData 
      });
    }
  }, []);
  
  return {
    isTelegramEnvironment,
    isWebApp,
    isDevelopment: process.env.NODE_ENV === 'development'
  };
}

// ✅ Утилиты для работы с Telegram данными
export function formatTelegramUser(user: TelegramUser | null): string {
  if (!user) return 'Гость';
  
  const parts = [user.first_name];
  if (user.last_name) parts.push(user.last_name);
  
  return parts.join(' ');
}

export function getTelegramAvatarUrl(user: TelegramUser | null): string | null {
  return user?.photo_url || null;
}
