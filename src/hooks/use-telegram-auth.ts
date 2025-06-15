// src/hooks/use-telegram-auth.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { User } from '@prisma/client';
import { useAuthStore } from '@/store/auth-store';
import { useLaunchParams, useRawInitData } from '@telegram-apps/sdk-react';
import { telegramSDKService } from '@/services/telegram-sdk-service';
import { getHashFromUrl, getInitDataFromStorage, saveInitDataToStorage } from '@/lib/telegram';
import { logger } from '@/utils/logger';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * ХУК ДЛЯ АВТОРИЗАЦИИ ЧЕРЕЗ SDK V3.X ДЛЯ 3GIS
 * ✅ Адаптирован под 3GIS User модель
 * ✅ Поддержка геолокации пользователя
 * ✅ Использование AWS S3 для аватаров
 */
export function useTelegramAuth() {
  const { setAuth, setLoading, setError, updateUserLocation } = useAuthStore();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });
  
  // SDK v3.x хуки
  const launchParams = useLaunchParams(true); // SSR поддержка для Next.js
  const initDataRaw = useRawInitData();
  
  // Безопасное извлечение данных пользователя
  const initDataUser = launchParams?.tgWebAppData?.user || null;
  
  // Логируем состояние хуков после инициализации
  useEffect(() => {
    if (typeof window !== 'undefined') {
      logger.logAuth(`3GIS SDK Hooks state - launchParams: ${!!launchParams}, initDataRaw: ${!!initDataRaw}`);
      if (launchParams) {
        logger.logAuth('launchParams structure:', Object.keys(launchParams));
      }
    }
  }, [launchParams, initDataRaw]);
  
  // Функция для сохранения данных аутентификации
  const saveAuthData = useCallback((user: User, token: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setAuth(user, token);
      setAuthState({
        user,
        token,
        isLoading: false,
        error: null,
      });
      
      logger.logAuth('3GIS Authentication data saved successfully');
    } catch (error) {
      logger.error('Error saving authentication data:', error);
      setError(error instanceof Error ? error.message : 'Ошибка сохранения данных авторизации');
    }
  }, [setAuth, setError]);
  
  // Функция для обновления геолокации пользователя
  const updateLocation = useCallback(async (latitude: number, longitude: number) => {
    const { user, token } = useAuthStore.getState();
    
    if (user && token) {
      try {
        // Обновляем в БД
        const response = await fetch('/api/user/location', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ latitude, longitude }),
        });

        if (response.ok) {
          // Обновляем в store
          updateUserLocation(latitude, longitude);
          logger.logAuth('User location updated successfully');
        }
      } catch (error) {
        logger.error('Error updating user location:', error);
      }
    }
  }, [updateUserLocation]);
  
  // Функция для проверки существования токена в localStorage и его валидности
  const checkExistingAuth = useCallback(async () => {
    if (typeof window === 'undefined') return false;
    
    try {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');
      const initDataStorage = getInitDataFromStorage();

      if (!storedToken || !storedUser) {
        logger.logAuth('No stored authentication data found');
        return false;
      }
      
      // Проверяем валидность токена
      try {
        logger.logAuth('Validating stored token');
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (response.ok) {
          // Токен валидный
          const user = JSON.parse(storedUser);
          setAuth(user, storedToken);
          setAuthState({
            user,
            token: storedToken,
            isLoading: false,
            error: null,
          });
          logger.logAuth('Stored token is valid');
          return true;
        }
        
        // Токен невалидный или истек, пробуем перезапросить
        logger.logAuth('Token expired or invalid, attempting reauthorization');
        localStorage.removeItem('auth_token');
        
        // Если есть сохраненные данные Telegram, пробуем автоматически переавторизоваться
        if (initDataStorage) {
          try {
            logger.logAuth('Attempting to use stored Telegram data for reauthorization');
            const refreshResponse = await fetch('/api/auth/telegram', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ initData: initDataStorage }),
            });

            if (refreshResponse.ok) {
              const { user, token } = await refreshResponse.json();
              saveAuthData(user, token);
              logger.logAuth('Automatic reauthorization successful');
              return true;
            } else {
              const errorData = await refreshResponse.json();
              logger.error('Reauthorization failed:', errorData.error || 'Unknown error');
            }
          } catch (refreshError) {
            logger.error('Error during automatic reauthorization:', refreshError);
          }
        } else {
          logger.logAuth('No initData available for reauthorization');
        }
      } catch (error) {
        logger.error('Error validating stored token:', error);
        localStorage.removeItem('auth_token');
      }
      
      return false;
    } catch (error) {
      logger.error('Error reading authentication from localStorage:', error);
      return false;
    }
  }, [setAuth, saveAuthData]);

  // Функция для удаления данных аутентификации при выходе
  const logout = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('telegramInitData');
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
      
      // Сообщаем Telegram о выходе через SDK сервис
      if (telegramSDKService.isAvailable()) {
        telegramSDKService.sendData({ type: 'auth_logout' });
        logger.logAuth('Logout event sent to Telegram via SDK');
      }
      
      logger.logAuth('3GIS user logged out successfully');
    } catch (error) {
      logger.error('Error during logout:', error);
    }
  }, []);

  // Основная логика авторизации через SDK v3.x
  useEffect(() => {
    // Инициализируем SDK только на стороне клиента
    if (typeof window === 'undefined') return;

    let isMounted = true;
    logger.logAuth('3GIS Auth Hook initialized with SDK v3.x');

    // Проверяем наличие Telegram WebApp API через SDK сервис
    const isTelegramAvailable = telegramSDKService.isAvailable();
    logger.logAuth(`Telegram WebApp availability via SDK: ${isTelegramAvailable ? 'Available' : 'Not available'}`);

    // Инициализация SDK сервиса
    if (isTelegramAvailable) {
      telegramSDKService.initialize();
      logger.logAuth('Telegram SDK service initialized in 3GIS auth hook');
    }

    const authenticate = async () => {
      try {
        // Проверяем наличие существующего токена
        const hasValidToken = await checkExistingAuth();
        if (hasValidToken) {
          logger.logAuth('Valid token found, authentication successful');
          return;
        }

        // Получаем initData через SDK v3.x
        let initDataString = '';
        
        logger.logAuth(`SDK Hooks state - launchParams: ${!!launchParams}, initDataRaw: ${!!initDataRaw}`);
        
        // Приоритет 1: SDK v3.x useRawInitData()
        if (initDataRaw && typeof initDataRaw === 'string') {
          initDataString = initDataRaw;
          logger.logAuth('Got initData through SDK v3.x useRawInitData()');
        } 
        // Приоритет 2: SDK сервис (fallback)
        else if (telegramSDKService.isAvailable()) {
          const serviceInitData = telegramSDKService.getInitData();
          if (serviceInitData) {
            initDataString = serviceInitData;
            logger.logAuth('Got initData through SDK service fallback');
          }
        }
        
        // Приоритет 3: URL hash (для Desktop клиента)
        if (!initDataString) {
          const hashInitData = getHashFromUrl();
          if (hashInitData) {
            logger.logAuth('Got initData from URL hash');
            initDataString = hashInitData;
          }
        }

        // В режиме разработки всегда продолжаем даже без initData
        if (!initDataString && process.env.NODE_ENV !== 'development') {
          if (isMounted) {
            const errorMessage = 'Невозможно получить данные для авторизации. Пожалуйста, откройте приложение через Telegram.';
            setAuthState({
              user: null,
              token: null,
              isLoading: false,
              error: errorMessage,
            });
            setError(errorMessage);
            logger.error('Authentication failed: No initData available');
          }
          return;
        }

        // Сохраняем initData для возможного повторного использования
        if (initDataString) {
          saveInitDataToStorage(initDataString);
        }

        // Отправляем запрос на аутентификацию с данными
        await authenticateWithServer(initDataString);
        
      } catch (error) {
        logger.error('Authentication error:', error);
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка авторизации';
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            error: errorMessage,
          });
          setError(errorMessage);
        }
      }
    };

    // Функция для отправки запроса авторизации на сервер
    const authenticateWithServer = async (data: string) => {
      logger.logAuth('Sending authentication request to /api/auth/telegram');
      try {
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initData: data }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка аутентификации на сервере');
        }

        const { user, token } = await response.json();
        
        if (isMounted) {
          saveAuthData(user, token);
          logger.logAuth('3GIS Authentication successful via SDK v3.x');
        }
      } catch (error) {
        logger.error('Server authentication error:', error);
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Ошибка сервера при аутентификации';
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            error: errorMessage,
          });
          setError(errorMessage);
        }
      }
    };

    // Выполняем аутентификацию
    setLoading(true);
    authenticate().finally(() => {
      if (isMounted) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    // Очистка при размонтировании компонента
    return () => {
      isMounted = false;
    };
  }, [initDataRaw, launchParams, checkExistingAuth, saveAuthData, setError, setLoading]);

  return {
    ...authState,
    logout,
    updateLocation,
  };
}
