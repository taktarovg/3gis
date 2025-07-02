'use client';

import { useLaunchParams, useRawInitData } from '@telegram-apps/sdk-react';
import { useEffect, useState } from 'react';

// Правильные типы для Telegram SDK v3.x
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

interface LaunchParams {
  tgWebAppBotInline?: boolean;
  tgWebAppData?: {
    user?: TelegramUser;
    auth_date?: number;
    query_id?: string;
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
  
  // Правильное использование хуков с SSR поддержкой для Next.js 15.3.3
  const launchParams = useLaunchParams(true) as LaunchParams; // SSR = true для Next.js
  const rawInitData = useRawInitData();
  
  useEffect(() => {
    try {
      if (launchParams?.tgWebAppData?.user) {
        setUser(launchParams.tgWebAppData.user);
        setIsInitialized(true);
      } else if (typeof window !== 'undefined' && !window.Telegram?.WebApp) {
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
    error,
    rawInitData,
    isAuthenticated: !!user,
    userId: user?.id
  };
}

// Хук для проверки Telegram окружения
export function useTelegramEnvironment() {
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  const [isWebApp, setIsWebApp] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasTelegramWebApp = !!(window as any).Telegram?.WebApp;
      const hasInitData = !!new URLSearchParams(window.location.search).get('tgWebAppData');
      
      setIsTelegramEnvironment(hasTelegramWebApp || hasInitData);
      setIsWebApp(hasTelegramWebApp);
    }
  }, []);
  
  return {
    isTelegramEnvironment,
    isWebApp,
    isDevelopment: process.env.NODE_ENV === 'development'
  };
}

// Утилиты для работы с Telegram данными
export function formatTelegramUser(user: TelegramUser | null): string {
  if (!user) return 'Гость';
  
  const parts = [user.first_name];
  if (user.last_name) parts.push(user.last_name);
  
  return parts.join(' ');
}

export function getTelegramAvatarUrl(user: TelegramUser | null): string | null {
  return user?.photo_url || null;
}
