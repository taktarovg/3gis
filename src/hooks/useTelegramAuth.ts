// src/hooks/useTelegramAuth.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, Prisma } from '@prisma/client';
import { useAuthStore } from '@/store/auth-store';
import { useRawInitData } from '@telegram-apps/sdk-react';

// ✅ ИСПРАВЛЕНО: Убираем конфликтующие импорты хуков
// Теперь используем наш обновленный TelegramProvider
import { useTelegram } from '@/components/providers/TelegramProvider';

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
 * ✅ УПРОЩЕННЫЙ ХУК АВТОРИЗАЦИИ ДЛЯ 3GIS (совместимый с новым TelegramProvider)
 * Теперь использует данные из обновленного TelegramProvider вместо прямых хуков SDK
 */
export function useTelegramAuth(): AuthState & AuthActions {
  const { setAuth, setLoading, setError, updateUserLocation, logout: clearAuth } = useAuthStore();
  
  // ✅ ИСПРАВЛЕНИЕ: Используем только существующие свойства из TelegramContextValue
  const { user: telegramUser, isAuthenticated: isTelegramAuth, isReady } = useTelegram();
  
  // ✅ Используем отдельный хук для rawInitData
  const rawInitData = useRawInitData();

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
  });

  /**
   * Аутентификация через Telegram initData
   */
  const authenticateWithTelegram = useCallback(async (): Promise<{ user: UserWithRelations; token: string } | null> => {
    try {
      if (!rawInitData) {
        throw new Error('No Telegram rawInitData available');
      }

      console.log('🚀 Начинаем аутентификацию с rawInitData (новый Provider):', {
        hasRawInitData: !!rawInitData,
        hasUser: !!telegramUser,
        userId: telegramUser?.id
      });

      // Аутентификация через API
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initData: rawInitData,
          debug: {
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
      console.log('✅ Telegram authentication successful (новый Provider)');
      return authResult;
    } catch (error) {
      console.error('❌ Telegram authentication failed:', error);
      
      if (error instanceof Error) {
        throw new Error(`Ошибка авторизации: ${error.message}`);
      }
      
      throw new Error('Не удалось выполнить авторизацию через Telegram');
    }
  }, [rawInitData, telegramUser]);

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
   * ✅ УПРОЩЕННАЯ логика инициализации - основана на TelegramProvider
   */
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
        setLoading(true);

        // Ждем готовности TelegramProvider
        if (!isReady) {
          return;
        }

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

        // Шаг 2: Пытаемся авторизоваться через Telegram (если есть данные)
        if (isTelegramAuth && telegramUser && rawInitData) {
          console.log('🔐 Пытаемся авторизоваться через Telegram (новый Provider)');
          
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

        // Шаг 3: Нет данных для аутентификации
        if (isMounted) {
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            error: telegramUser ? null : 'Ожидание данных Telegram...',
            isAuthenticated: false,
          });
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

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [
    isReady,
    isTelegramAuth,
    telegramUser,
    rawInitData,
    setAuth,
    setLoading,
    setError,
    loadUserFromToken,
    authenticateWithTelegram,
  ]);

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

// ✅ Сохраняем хуки для обратной совместимости
export function useTelegramEnvironment() {
  const { isTelegramEnvironment } = useTelegram();
  
  return {
    isTelegramEnvironment,
    isWebApp: isTelegramEnvironment,
    isDevelopment: process.env.NODE_ENV === 'development'
  };
}

export function formatTelegramUser(user: UserWithRelations | null): string {
  if (!user) return 'Гость';
  
  const parts = [user.firstName];
  if (user.lastName) parts.push(user.lastName);
  
  return parts.join(' ');
}

export function getTelegramAvatarUrl(user: UserWithRelations | null): string | null {
  return user?.avatar || null;
}