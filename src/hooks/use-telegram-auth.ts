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

// Telegram SDK v3.x imports
import { useRawInitData, useLaunchParams } from '@telegram-apps/sdk-react';
import { useTelegramApp } from '@telegram-apps/sdk-react';

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

  // Получаем Telegram данные через SDK v3.x хуки с защитой от ошибок
  let initDataRaw: string | undefined;
  let launchParams: any;
  let telegramApp: any;
  
  try {
    initDataRaw = useRawInitData();
  } catch (error) {
    console.warn('⚠️ useRawInitData error:', error);
    initDataRaw = undefined;
  }
  
  try {
    launchParams = useLaunchParams(true); // SSR-совместимый режим для Next.js
  } catch (error) {
    console.warn('⚠️ useLaunchParams error:', error);
    launchParams = null;
  }
  
  try {
    telegramApp = useTelegramApp();
  } catch (error) {
    console.warn('⚠️ useTelegramApp error:', error);
    telegramApp = null;
  }
  
  // Извлекаем пользовательские данные из launchParams для SDK v3.x
  // В v3.x структура изменилась: tgWebAppData содержит объект с полями user, authDate, queryId, hash
  const webAppData = launchParams?.tgWebAppData;
  const telegramUser = webAppData?.user || null;
  const authDate = webAppData?.authDate || webAppData?.auth_date || null;
  const queryId = webAppData?.queryId || webAppData?.query_id || null;
  const hash = webAppData?.hash || null;
  
  // Логируем получение данных с подробной структурой для отладки
  useEffect(() => {
    console.log('📊 Telegram SDK v3.x Data Debug:', {
      hasInitDataRaw: !!initDataRaw,
      initDataLength: initDataRaw?.length || 0,
      hasLaunchParams: !!launchParams,
      launchParamsKeys: launchParams ? Object.keys(launchParams) : [],
      hasWebAppData: !!webAppData,
      webAppDataKeys: webAppData ? Object.keys(webAppData) : [],
      hasUser: !!telegramUser,
      userDetails: telegramUser ? {
        id: telegramUser.id,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
        hasPhotoUrl: !!telegramUser.photo_url,
        languageCode: telegramUser.language_code
      } : null,
      authDate,
      queryId,
      hash: hash ? hash.substring(0, 10) + '...' : null
    });

    if (initDataRaw) {
      logger.logAuth('✅ Telegram initData получен через SDK v3.x:', {
        hasInitData: !!initDataRaw,
        hasUser: !!telegramUser,
        initDataLength: initDataRaw.length,
        userDetails: telegramUser ? {
          id: telegramUser.id,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          username: telegramUser.username,
          hasPhotoUrl: !!telegramUser.photo_url,
          photoUrl: telegramUser.photo_url
        } : null
      });
    } else {
      logger.warn('⚠️ Telegram initData пока не получен, ожидаем инициализации SDK...');
    }
  }, [initDataRaw, telegramUser, launchParams, webAppData, authDate, queryId, hash]);

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
   * Аутентификация через Telegram initData для SDK v3.x
   */
  const authenticateWithTelegram = useCallback(async (): Promise<{ user: UserWithRelations; token: string } | null> => {
    try {
      if (!initDataRaw) {
        throw new Error('No Telegram initData available');
      }

      logger.logAuth('🚀 Начинаем аутентификацию с initData (SDK v3.x):', {
        hasInitData: !!initDataRaw,
        initDataLength: initDataRaw.length,
        hasWebAppData: !!webAppData,
        hasUser: !!telegramUser,
        userId: telegramUser?.id,
        platform: launchParams?.tgWebAppPlatform || 'unknown'
      });

      // Аутентификация через API
      const response = await apiClient.post<{ user: UserWithRelations; token: string }>('/api/auth/telegram', {
        initData: initDataRaw,
        // Дополнительная информация для отладки
        debug: {
          platform: launchParams?.tgWebAppPlatform,
          version: launchParams?.tgWebAppVersion,
          hasUser: !!telegramUser,
          userId: telegramUser?.id
        }
      }, {
        skipAuth: true,
        skipAutoRefresh: true,
      });

      logger.logAuth('✅ Telegram authentication successful (SDK v3.x)');
      return response;
    } catch (error) {
      logger.error('❌ Telegram authentication failed:', error);
      
      if (error instanceof ApiError) {
        throw new Error(`Ошибка авторизации: ${error.message}`);
      }
      
      throw new Error('Не удалось выполнить авторизацию через Telegram');
    }
  }, [initDataRaw, webAppData, telegramUser, launchParams]);

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
        if (!token || !isValid || shouldRefreshToken()) {
          // Даем время SDK инициализироваться на мобильных устройствах
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
          
          if (hasData && initDataRaw && telegramUser) {
            logger.logAuth('🔐 Нет действительного токена, пытаемся авторизоваться через Telegram', {
              hasInitData: !!initDataRaw,
              hasUser: !!telegramUser,
              userId: telegramUser?.id
            });
            
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
          } else {
            logger.warn('⏳ Telegram данные не получены в течение 5 секунд');
          }
        }

        // Шаг 3: Если нет initData или пользователя, ждем их получения
        if ((!initDataRaw || !telegramUser) && isMounted) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Ожидание данных Telegram...',
          }));
          logger.warn('⏳ Ожидаем получение Telegram initData или пользователя', {
            hasInitData: !!initDataRaw,
            hasUser: !!telegramUser
          });
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
    telegramUser,
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
