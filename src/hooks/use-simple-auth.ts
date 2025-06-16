// src/hooks/use-simple-auth.ts
'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { logger } from '@/utils/logger';

interface SimpleAuthState {
  user: any | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

/**
 * Упрощенный хук авторизации для 3GIS без JWT_SECRET на клиенте
 * Все JWT операции выполняются на сервере
 */
export function useSimpleAuth(): SimpleAuthState {
  const { user, setAuth, setLoading, setError, logout } = useAuthStore();
  const [authState, setAuthState] = useState<SimpleAuthState>({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
  });

  // Получение Telegram initData
  const getTelegramInitData = (): string | null => {
    if (typeof window === 'undefined') return null;

    try {
      // Используем нативный Telegram WebApp API
      if (window.Telegram?.WebApp?.initData) {
        const initData = window.Telegram.WebApp.initData;
        if (initData && initData.length > 0) {
          return initData;
        }
      }

      // В режиме разработки используем моковые данные
      if (process.env.NODE_ENV === 'development' && process.env.SKIP_TELEGRAM_VALIDATION === 'true') {
        return 'user=%7B%22id%22%3A80954049%2C%22first_name%22%3A%22%D0%93%D0%B5%D0%BE%D1%80%D0%B3%D0%B8%D0%B9%22%2C%22last_name%22%3A%22%D0%A2%D0%B0%D0%BA%D1%82%D0%B0%D1%80%D0%BE%D0%B2%22%2C%22username%22%3A%22taktarovgv%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%7D&chat_instance=-5589427974171859100&chat_type=channel&auth_date=1750039687&hash=c63cba3a76e34bc0657631612fff5422b8f9e9a82ff1d972e4eaf20428a1f9ad';
      }

      return null;
    } catch (error) {
      logger.error('Error getting Telegram initData:', error);
      return null;
    }
  };

  // Авторизация через Telegram API
  const authenticateWithTelegram = async (initData: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ initData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const { user, token } = await response.json();
      
      // Сохраняем в store
      setAuth(user, token);
      
      setAuthState({
        user,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      });

      logger.logAuth('✅ Authentication successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      logger.error('❌ Authentication error:', error);
      
      setError(errorMessage);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
      }));
    }
  };

  // Проверка существующего токена
  const checkExistingAuth = async () => {
    try {
      // Проверяем оба возможных ключа для токена
      const token = localStorage.getItem('3gis_auth_token') || localStorage.getItem('auth_token');
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Проверяем токен на сервере
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        setAuth(user, token);
        setAuthState({
          user,
          isLoading: false,
          error: null,
          isAuthenticated: true,
        });
        logger.logAuth('✅ Existing auth restored');
      } else {
        // Токен недействителен, очищаем
        localStorage.removeItem('3gis_auth_token');
        localStorage.removeItem('auth_token');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      logger.error('Error checking existing auth:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Инициализация авторизации
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // Сначала проверяем существующую авторизацию
        await checkExistingAuth();
        
        if (!isMounted) return;

        // Если не авторизованы, пытаемся авторизоваться через Telegram
        const currentState = useAuthStore.getState();
        if (!currentState.user) {
          const initData = getTelegramInitData();
          if (initData) {
            await authenticateWithTelegram(initData);
          } else {
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
              error: 'Telegram data not available',
            }));
          }
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: errorMessage,
          }));
        }
      }
    };

    // Инициализация только на клиенте
    if (typeof window !== 'undefined') {
      initAuth();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Синхронизация с store
  useEffect(() => {
    if (user) {
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        error: null,
      }));
    }
  }, [user]);

  return authState;
}
