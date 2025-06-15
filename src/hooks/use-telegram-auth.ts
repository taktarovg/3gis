// src/hooks/use-telegram-auth.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { User } from '@prisma/client';
import { useAuthStore } from '@/store/auth-store';
import { useLaunchParams, useRawInitData } from '@telegram-apps/sdk-react';
import { useTokenManager } from '@/hooks/use-token-manager';
import { TokenRefreshService } from '@/services/token-refresh-service';
import { apiClient, ApiError } from '@/lib/api-client';
import { AUTH_CONSTANTS } from '@/lib/auth';
import { logger } from '@/utils/logger';

interface AuthState {
  user: User | null;
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
  const { setAuth, setLoading, setError, updateUserLocation, clearAuth } = useAuthStore();
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

  // SDK v3.x хуки - правильное использование без параметров
  const launchParams = useLaunchParams(); // v3.x: без параметров, возвращает правильную структуру
  const initDataRaw = useRawInitData(); // v3.x: без параметров, возвращает строку initData

  /**
   * Загрузка пользователя по токену из БД
   */
  const loadUserFromToken = useCallback(async (authToken: string): Promise<User | null> => {
    try {
      const user = await apiClient.get<User>('/api/auth/me', {
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
  const authenticateWithTelegram = useCallback(async (): Promise<{ user: User; token: string } | null> => {
    try {
      // Получаем initData из SDK v3.x
      let initDataString = '';

      if (initDataRaw && typeof initDataRaw === 'string') {
        initDataString = initDataRaw;
        logger.logAuth('Using initData from useRawInitData hook');
      } else if (launchParams?.tgWebAppData) {
        // В SDK v3.x tgWebAppData уже содержит правильную структуру
        // Нужно правильно сериализовать в формат Telegram initData
        const webAppData = launchParams.tgWebAppData;
        
        // Создаем initData строку в правильном формате
        const initDataParts: string[] = [];
        
        if (webAppData.user) {
          initDataParts.push(`user=${encodeURIComponent(JSON.stringify(webAppData.user))}`);
        }
        if (webAppData.auth_date) {
          initDataParts.push(`auth_date=${webAppData.auth_date}`);
        }
        if (webAppData.query_id) {
          initDataParts.push(`query_id=${encodeURIComponent(webAppData.query_id)}`);
        }
        if (webAppData.hash) {
          initDataParts.push(`hash=${encodeURIComponent(webAppData.hash)}`);
        }
        
        initDataString = initDataParts.join('&');
        logger.logAuth('Properly formatted initData from tgWebAppData');
      }

      if (!initDataString) {
        throw new Error('No Telegram initData available');
      }

      // Аутентификация через API
      const response = await apiClient.post<{ user: User; token: string }>('/api/auth/telegram', {
        initData: initDataString,
      }, {
        skipAuth: true,
        skipAutoRefresh: true,
      });

      logger.logAuth('Telegram authentication successful');
      return response;
    } catch (error) {
      logger.error('Telegram authentication failed:', error);
      
      if (error instanceof ApiError) {
        throw new Error(`Ошибка авторизации: ${error.message}`);
      }
      
      throw new Error('Не удалось выполнить авторизацию через Telegram');
    }
  }, [initDataRaw, launchParams]);

  /**
   * Обновление токена
   */
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
      await logout();
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
  }, [setToken, markRefreshTime, loadUserFromToken, setAuth]);

  /**
   * Выход из системы
   */
  const logout = useCallback(async () => {
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

        // Шаг 2: Токен недействителен или отсутствует, авторизуемся через Telegram
        if (!token || !isValid || shouldRefreshToken()) {
          logger.logAuth('No valid token, attempting Telegram authentication');
          
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
            
            logger.logAuth('New authentication completed successfully');
            return;
          }
        }

        // Шаг 3: Аутентификация не удалась
        if (isMounted) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Не удалось выполнить авторизацию',
          }));
          logger.warn('Authentication failed');
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

    // Инициализируем только на клиенте и при наличии необходимых данных
    if (typeof window !== 'undefined') {
      initializeAuth();
    }

    return () => {
      isMounted = false;
    };
  }, [
    token,
    isValid,
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
  getWelcomeMessage(user: User | null): string {
    if (!user) return 'Добро пожаловать в 3GIS!';
    
    const name = user.firstName || user.username || 'Пользователь';
    return `Привет, ${name}!`;
  },

  /**
   * Проверка премиум статуса
   */
  isPremiumUser(user: User | null): boolean {
    return user?.isPremium || false;
  },

  /**
   * Форматирование времени последней активности
   */
  formatLastSeen(user: User | null): string {
    if (!user?.lastSeenAt) return 'Никогда';
    
    return new Date(user.lastSeenAt).toLocaleString('ru-RU');
  },
};
