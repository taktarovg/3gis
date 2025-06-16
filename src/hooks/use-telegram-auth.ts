// src/hooks/use-telegram-auth.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, Prisma } from '@prisma/client';
import { useAuthStore } from '@/store/auth-store';
import { useTokenManager } from '@/hooks/use-token-manager';
import { TokenRefreshService } from '@/services/token-refresh-service';
import { apiClient, ApiError } from '@/lib/api-client';
import { AUTH_CONSTANTS } from '@/lib/auth';
import { logger } from '@/utils/logger';

// Используем Prisma.UserGetPayload для правильного типирования
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

// Правильный тип пользователя с отношениями
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
 * СОВРЕМЕННЫЙ ХУК АВТОРИЗАЦИИ ДЛЯ 3GIS
 * ✅ Интегрирован с системой управления токенами
 * ✅ Автоматическое обновление истекающих токенов
 * ✅ Безопасная обработка ошибок
 * ✅ Поддержка @telegram-apps/sdk v3.x
 * ✅ SSR совместимость для Next.js
 */
export function useTelegramAuth(): AuthState & AuthActions {
  const { setAuth, setLoading, setError, updateUserLocation, logout: clearAuth } = useAuthStore();
  const {
    token,
    payload,
    isValid,
    needsRefresh,
    setToken,
    clearToken,
    shouldRefreshToken,
    markRefreshTime,
  } = useTokenManager();

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
  });

  // Получаем Telegram данные через нативный WebApp API
  const [initDataRaw, setInitDataRaw] = useState<string | null>(null);
  const [webAppData, setWebAppData] = useState<any>(null);

  // Инициализация Telegram данных
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Используем нативный Telegram WebApp API
        if (window.Telegram?.WebApp) {
          const webApp = window.Telegram.WebApp;
          
          // Получаем initData в сыром формате
          const rawInitData = webApp.initData;
          
          if (rawInitData && rawInitData.length > 0) {
            setInitDataRaw(rawInitData);
            setWebAppData(webApp.initDataUnsafe);
            logger.logAuth('✅ Telegram WebApp initData получен:', {
              hasInitData: !!rawInitData,
              hasUser: !!webApp.initDataUnsafe?.user
            });
          } else {
            logger.warn('⚠️ Telegram WebApp initData пустой');
            
            // В режиме разработки создаем мок данные
            if (process.env.NODE_ENV === 'development' && process.env.SKIP_TELEGRAM_VALIDATION === 'true') {
              const mockInitData = 'user=%7B%22id%22%3A80954049%2C%22first_name%22%3A%22%D0%93%D0%B5%D0%BE%D1%80%D0%B3%D0%B8%D0%B9%22%2C%22last_name%22%3A%22%D0%A2%D0%B0%D0%BA%D1%82%D0%B0%D1%80%D0%BE%D0%B2%22%2C%22username%22%3A%22taktarovgv%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%7D&chat_instance=-5589427974171859100&chat_type=channel&auth_date=1750039687&hash=c63cba3a76e34bc0657631612fff5422b8f9e9a82ff1d972e4eaf20428a1f9ad';
              setInitDataRaw(mockInitData);
              setWebAppData({
                user: {
                  id: 80954049,
                  first_name: "Георгий",
                  last_name: "Тактаров",
                  username: "taktarovgv",
                  language_code: "ru",
                  is_premium: true
                }
              });
              logger.logAuth('🧪 Используем мок данные для разработки');
            }
          }
        } else {
          logger.warn('❌ Telegram WebApp API недоступен');
        }
      } catch (error) {
        logger.error('❌ Ошибка получения Telegram данных:', error);
      }
    }
  }, []);

  /**
   * Загрузка пользователя по токену из БД
   */
  const loadUserFromToken = useCallback(async (authToken: string): Promise<UserWithRelations | null> => {
    try {
      const user = await apiClient.get<UserWithRelations>('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
        skipAutoRefresh: true, // Избегаем рекурсии
      });
      
      logger.logAuth('User loaded from token successfully');
      return user;
    } catch (error) {
      if (error instanceof ApiError && error.isAuthError) {
        logger.warn('Token invalid, user not found');
        return null;
      }
      
      logger.error('Error loading user from token:', error);
      throw error;
    }
  }, []);

  /**
   * Аутентификация через Telegram initData
   */
  const authenticateWithTelegram = useCallback(async (): Promise<{ user: UserWithRelations; token: string } | null> => {
    try {
      if (!initDataRaw) {
        throw new Error('No Telegram initData available');
      }

      logger.logAuth('🚀 Начинаем аутентификацию с initData:', {
        hasInitData: !!initDataRaw,
        initDataLength: initDataRaw.length,
        hasWebAppData: !!webAppData?.user
      });

      // Аутентификация через API
      const response = await apiClient.post<{ user: UserWithRelations; token: string }>('/api/auth/telegram', {
        initData: initDataRaw,
      }, {
        skipAuth: true,
        skipAutoRefresh: true,
      });

      logger.logAuth('✅ Telegram authentication successful');
      return response;
    } catch (error) {
      logger.error('❌ Telegram authentication failed:', error);
      
      if (error instanceof ApiError) {
        throw new Error(`Ошибка авторизации: ${error.message}`);
      }
      
      throw new Error('Не удалось выполнить авторизацию через Telegram');
    }
  }, [initDataRaw, webAppData]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const newToken = await TokenRefreshService.refreshToken();
      
      if (newToken) {
        setToken(newToken);
        markRefreshTime();
        
        // Загружаем обновленные данные пользователя
        const user = await loadUserFromToken(newToken);
        if (user) {
          setAuth(user, newToken);
          setAuthState(prev => ({
            ...prev,
            user,
            token: newToken,
            isAuthenticated: true,
            error: null,
          }));
          
          logger.logAuth('Token refresh completed successfully');
          return true;
        }
      }
      
      // Если обновление не удалось, очищаем данные
      try {
        clearToken();
        clearAuth();
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          error: null,
          isAuthenticated: false,
        });
      } catch (logoutError) {
        logger.error('Error during logout:', logoutError);
      }
      
      return false;
    } catch (error) {
      logger.error('Token refresh failed:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Не удалось обновить токен авторизации',
        isLoading: false,
      }));
      return false;
    }
  }, [setToken, markRefreshTime, loadUserFromToken, setAuth, clearToken, clearAuth]);

  /**
   * Выход из системы
   */
  const logoutUser = useCallback(async () => {
    try {
      clearToken();
      clearAuth();
      
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
      });
      
      logger.logAuth('User logged out successfully');
    } catch (error) {
      logger.error('Error during logout:', error);
    }
  }, [clearToken, clearAuth]);

  /**
   * Выход из системы (псевдоним для совместимости)
   */
  const logout = logoutUser;

  /**
   * Обновление геолокации пользователя
   */
  const updateLocation = useCallback(async (latitude: number, longitude: number) => {
    if (!authState.token) {
      logger.warn('Cannot update location: no auth token');
      return;
    }

    try {
      await apiClient.patch('/api/user/location', {
        latitude,
        longitude,
      });

      updateUserLocation(latitude, longitude);
      logger.logAuth('User location updated successfully');
    } catch (error) {
      logger.error('Error updating user location:', error);
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
   * Проактивное обновление токена при необходимости
   */
  useEffect(() => {
    if (token && needsRefresh && isValid) {
      logger.logAuth('Token needs refresh, initiating proactive refresh');
      refreshToken();
    }
  }, [token, needsRefresh, isValid, refreshToken]);

  /**
   * Основная логика инициализации аутентификации
   */
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
        setLoading(true);

        // Шаг 1: Проверяем существующий токен
        if (token && isValid) {
          logger.logAuth('Valid token found, loading user data');
          
          const user = await loadUserFromToken(token);
          if (user && isMounted) {
            setAuth(user, token);
            setAuthState(prev => ({
              ...prev,
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            }));
            logger.logAuth('Authentication restored from stored token');
            return;
          }
        }

        // Шаг 2: Проверяем наличие initData для авторизации через Telegram
        if ((!token || !isValid || shouldRefreshToken()) && initDataRaw) {
          logger.logAuth('🔐 Нет действительного токена, пытаемся авторизоваться через Telegram');
          
          const authResult = await authenticateWithTelegram();
          if (authResult && isMounted) {
            const { user, token: newToken } = authResult;
            
            setToken(newToken);
            setAuth(user, newToken);
            markRefreshTime();
            
            setAuthState(prev => ({
              ...prev,
              user,
              token: newToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            }));
            
            logger.logAuth('✅ Новая аутентификация завершена успешно');
            return;
          }
        }

        // Шаг 3: Если нет initData, ждем его получения
        if (!initDataRaw && isMounted) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Ожидание данных Telegram...',
          }));
          logger.warn('⏳ Ожидаем получение Telegram initData');
          return;
        }

        // Шаг 4: Аутентификация не удалась
        if (isMounted) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Не удалось выполнить авторизацию',
          }));
          logger.warn('❌ Authentication failed');
        }

      } catch (error) {
        logger.error('Authentication initialization error:', error);
        
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Ошибка инициализации авторизации';
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: errorMessage,
          }));
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
    token,
    isValid,
    initDataRaw,
    webAppData,
    setToken,
    setAuth,
    setLoading,
    setError,
    loadUserFromToken,
    authenticateWithTelegram,
    shouldRefreshToken,
    markRefreshTime,
  ]);

  /**
   * Логирование изменений состояния аутентификации
   */
  useEffect(() => {
    logger.logAuth(`Auth state changed: authenticated=${authState.isAuthenticated}, loading=${authState.isLoading}, hasError=${!!authState.error}`);
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
