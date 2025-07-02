// src/hooks/use-telegram-auth.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, Prisma } from '@prisma/client';
import { useAuthStore } from '@/store/auth-store';

// Telegram SDK v3.x imports - убираем условные вызовы
import { useRawInitData, useLaunchParams } from '@telegram-apps/sdk-react';

// Импортируем правильный тип пользователя с отношениями
const userWithRelationsPayload = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    city: true,
    businesses: {
      include: {
        category: true,
        city: true
      }
    },
    favorites: {
      include: {
        business: {
          include: {
            category: true
          }
        }
      }
    }
  }
});

type UserWithRelations = Prisma.UserGetPayload<typeof userWithRelationsPayload>;

interface AuthState {
  user: UserWithRelations | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateLocation: (latitude: number, longitude: number) => Promise<void>;
  clearError: () => void;
}

/**
 * ОПТИМИЗИРОВАННЫЙ ХУК АВТОРИЗАЦИИ ДЛЯ 3GIS SDK v3.x
 * ✅ Исправлены все React Hooks Rules ошибки
 * ✅ Убраны условные вызовы хуков
 * ✅ Совместимость с @telegram-apps/sdk-react v3.3.1
 * ✅ SSR поддержка для Next.js
 * ✅ Правильная типизация UserWithRelations
 */
export function useTelegramAuth(): AuthState & AuthActions {
  const { setAuth, setLoading, setError, updateUserLocation, logout: clearAuth } = useAuthStore();

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
  });

  // Безусловные вызовы хуков SDK v3.x согласно Rules of Hooks + SSR флаги
  const initDataRaw = useRawInitData(true); // ✅ SSR флаг для Next.js
  const launchParams = useLaunchParams(true); // ✅ В v3.x требуется SSR флаг для Next.js
  
  // Извлекаем пользовательские данные из launchParams для SDK v3.x
  // В v3 данные находятся в tgWebAppData
  const webAppData = launchParams?.tgWebAppData;
  const telegramUser = webAppData?.user || null;
  
  // В v3 доступны как camelCase, так и snake_case версии
  const authDate = webAppData?.authDate || webAppData?.auth_date || null;
  const queryId = webAppData?.queryId || webAppData?.query_id || null;
  const hash = webAppData?.hash || null;

  /**
   * Аутентификация через Telegram initData для SDK v3.x
   */
  const authenticateWithTelegram = useCallback(async (): Promise<{ user: UserWithRelations; token: string } | null> => {
    try {
      if (!initDataRaw) {
        throw new Error('No Telegram initData available');
      }

      console.log('🚀 Начинаем аутентификацию с initData (SDK v3.x):', {
        hasInitData: !!initDataRaw,
        initDataLength: initDataRaw.length,
        hasWebAppData: !!webAppData,
        hasUser: !!telegramUser,
        userId: telegramUser?.id,
        platform: launchParams?.tgWebAppPlatform || 'unknown'
      });

      // Аутентификация через API
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: initDataRaw,
          debug: {
            platform: launchParams?.tgWebAppPlatform,
            version: launchParams?.tgWebAppVersion,
            hasUser: !!telegramUser,
            userId: telegramUser?.id
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Authentication failed: ${response.status} ${errorData}`);
      }

      const authResult = await response.json();
      console.log('✅ Telegram authentication successful (SDK v3.x)');
      return authResult;
    } catch (error) {
      console.error('❌ Telegram authentication failed:', error);
      
      if (error instanceof Error) {
        throw new Error(`Ошибка авторизации: ${error.message}`);
      }
      
      throw new Error('Не удалось выполнить авторизацию через Telegram');
    }
  }, [initDataRaw, webAppData, telegramUser, launchParams]);

  /**
   * Загрузка пользователя по токену из localStorage
   */
  const loadUserFromToken = useCallback(async (authToken: string): Promise<UserWithRelations | null> => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        console.warn('Token invalid, user not found');
        return null;
      }

      const user = await response.json() as UserWithRelations;
      console.log('User loaded from token successfully');
      return user;
    } catch (error) {
      console.error('Error loading user from token:', error);
      return null;
    }
  }, []);

  /**
   * Обновление токена
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        return false;
      }

      const { token: newToken, user } = await response.json();
      
      // Сохраняем новый токен
      localStorage.setItem('authToken', newToken);
      
      setAuth(user, newToken);
      setAuthState(prev => ({
        ...prev,
        user,
        token: newToken,
        isAuthenticated: true,
        error: null,
        isLoading: false,
      }));
      
      console.log('Token refresh completed successfully');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Не удалось обновить токен авторизации',
        isLoading: false,
      }));
      return false;
    }
  }, [setAuth]);

  /**
   * Выход из системы
   */
  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('authToken');
      clearAuth();
      
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
      });
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [clearAuth]);

  /**
   * Обновление геолокации пользователя
   */
  const updateLocation = useCallback(async (latitude: number, longitude: number) => {
    if (!authState.token) {
      console.warn('Cannot update location: no auth token');
      return;
    }

    try {
      await fetch('/api/user/location', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      updateUserLocation(latitude, longitude);
      console.log('User location updated successfully');
    } catch (error) {
      console.error('Error updating user location:', error);
    }
  }, [authState.token, updateUserLocation]);

  /**
   * Очистка ошибок
   */
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
    setError(null);
  }, [setError]);

  /**
   * Основная логика инициализации аутентификации
   */
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
        setLoading(true);

        // Шаг 1: Проверяем существующий токен в localStorage
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
          console.log('Found stored token, loading user data');
          
          const user = await loadUserFromToken(storedToken);
          if (user && isMounted) {
            setAuth(user, storedToken);
            setAuthState({
              user,
              token: storedToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            console.log('Authentication restored from stored token');
            return;
          } else {
            // Токен недействителен, удаляем его
            localStorage.removeItem('authToken');
          }
        }

        // Шаг 2: Ждем получения Telegram данных
        if (!initDataRaw || !telegramUser) {
          // Даем время SDK инициализироваться
          const maxWaitTime = 5000; // 5 секунд
          const startTime = Date.now();
          
          const waitForTelegramData = () => {
            return new Promise<boolean>((resolve) => {
              const checkData = () => {
                if (initDataRaw && telegramUser) {
                  resolve(true);
                  return;
                }
                
                if (Date.now() - startTime > maxWaitTime) {
                  resolve(false);
                  return;
                }
                
                setTimeout(checkData, 100);
              };
              
              checkData();
            });
          };
          
          const hasData = await waitForTelegramData();
          
          if (!hasData) {
            if (isMounted) {
              setAuthState({
                user: null,
                token: null,
                isLoading: false,
                error: 'Ожидание данных Telegram... Убедитесь, что приложение открыто через бота @ThreeGIS_bot',
                isAuthenticated: false,
              });
            }
            return;
          }
        }

        // Шаг 3: Пытаемся авторизоваться через Telegram
        if (initDataRaw && telegramUser) {
          console.log('🔐 Пытаемся авторизоваться через Telegram', {
            hasInitData: !!initDataRaw,
            hasUser: !!telegramUser,
            userId: telegramUser?.id
          });
          
          const authResult = await authenticateWithTelegram();
          if (authResult && isMounted) {
            const { user, token: newToken } = authResult;
            
            // Сохраняем токен
            localStorage.setItem('authToken', newToken);
            
            setAuth(user, newToken);
            
            setAuthState({
              user,
              token: newToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            console.log('✅ Новая аутентификация завершена успешно');
            return;
          }
        }

        // Шаг 4: Аутентификация не удалась
        if (isMounted) {
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            error: 'Не удалось выполнить авторизацию через Telegram',
            isAuthenticated: false,
          });
          console.warn('❌ Authentication failed');
        }

      } catch (error) {
        console.error('Authentication initialization error:', error);
        
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Ошибка инициализации авторизации';
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          setError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Инициализируем только на клиенте
    if (typeof window !== 'undefined') {
      initializeAuth();
    }

    return () => {
      isMounted = false;
    };
  }, [
    initDataRaw,
    telegramUser,
    webAppData,
    setAuth,
    setLoading,
    setError,
    loadUserFromToken,
    authenticateWithTelegram,
  ]);

  /**
   * Логирование изменений состояния аутентификации
   */
  useEffect(() => {
    console.log(`Auth state changed: authenticated=${authState.isAuthenticated}, loading=${authState.isLoading}, hasError=${!!authState.error}`);
  }, [authState.isAuthenticated, authState.isLoading, authState.error]);

  return {
    // State
    ...authState,
    
    // Actions
    logout,
    refreshToken,
    updateLocation,
    clearError,
  };
}

/**
 * Утилиты для работы с аутентификацией
 */
export const AuthUtils = {
  /**
   * Проверка необходимости логина
   */
  requiresLogin(authState: AuthState): boolean {
    return !authState.isAuthenticated && !authState.isLoading;
  },

  /**
   * Получение приветственного сообщения
   */
  getWelcomeMessage(user: UserWithRelations | null): string {
    if (!user) return 'Добро пожаловать в 3GIS!';
    
    const name = user.firstName || user.username || 'Пользователь';
    return `Привет, ${name}!`;
  },

  /**
   * Проверка премиум статуса
   */
  isPremiumUser(user: UserWithRelations | null): boolean {
    return user?.isPremium || false;
  },

  /**
   * Форматирование времени последней активности
   */
  formatLastSeen(user: UserWithRelations | null): string {
    if (!user?.lastSeenAt) return 'Никогда';
    
    return new Date(user.lastSeenAt).toLocaleString('ru-RU');
  },
};
