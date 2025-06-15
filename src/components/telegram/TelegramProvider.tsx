'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/utils/logger';

interface TelegramProviderProps {
  children: React.ReactNode;
  debug?: boolean;
}

/**
 * ОБНОВЛЕННЫЙ TELEGRAM PROVIDER ДЛЯ 3GIS
 * ✅ Использует нативный Telegram WebApp API
 * ✅ SSR совместимость для Next.js
 * ✅ Обработка ошибок инициализации
 * ✅ Graceful fallback для разработки
 */
export function TelegramProvider({
  children,
  debug = process.env.NODE_ENV === 'development',
}: TelegramProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeWebApp = async () => {
      try {
        if (debug) {
          logger.log('🚀 Initializing Telegram WebApp...');
        }
        
        // Проверяем доступность Telegram WebApp
        if (typeof window !== 'undefined') {
          if (window.Telegram?.WebApp) {
            const webApp = window.Telegram.WebApp;
            
            // Инициализируем WebApp
            webApp.ready();
            
            // Настройки интерфейса для 3GIS
            try {
              webApp.expand();
              
              // Цвета для 3GIS
              if (typeof webApp.setHeaderColor === 'function') {
                webApp.setHeaderColor('#1f2937'); // gray-800
              }
              
              if (typeof webApp.setBackgroundColor === 'function') {
                webApp.setBackgroundColor('#f9fafb'); // gray-50
              }
              
              if (debug) {
                logger.log('✅ Telegram WebApp configured for 3GIS');
              }
            } catch (configError) {
              if (debug) {
              logger.warn('⚠️ Some WebApp features not available:', configError);
              }
            }
          } else {
            // Для разработки без Telegram
            if (debug) {
              logger.warn('⚠️ Telegram WebApp not available - running in development mode');
            }
          }
        }
        
        if (isMounted) {
          setIsInitialized(true);
          if (debug) {
            logger.log('✅ 3GIS Telegram initialization completed');
          }
        }
      } catch (error) {
        logger.error('❌ Telegram WebApp initialization failed:', error);
        
        if (isMounted) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Unknown WebApp initialization error';
          setInitError(errorMessage);
        }
      }
    };

    // Инициализируем WebApp только на клиенте
    if (typeof window !== 'undefined') {
      // Небольшая задержка для загрузки Telegram script
      setTimeout(initializeWebApp, 100);
    } else {
      // На сервере считаем инициализированным для SSR
      setIsInitialized(true);
    }

    return () => {
      isMounted = false;
    };
  }, [debug]);

  // Показываем ошибку инициализации
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Ошибка инициализации Telegram
          </h2>
          <p className="text-gray-600 mb-6">
            {initError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // Показываем загрузку пока WebApp инициализируется
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl">🚀</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                3<span className="text-yellow-500">GIS</span>
              </h2>
              <p className="text-gray-600">
                Инициализация приложения...
              </p>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Возвращаем приложение с инициализированным WebApp
  return <>{children}</>;
}

/**
 * HOC для оборачивания компонентов в TelegramProvider
 */
export function withTelegramProvider<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  options?: { debug?: boolean }
) {
  const WrappedComponent = (props: T) => (
    <TelegramProvider {...options}>
      <Component {...props} />
    </TelegramProvider>
  );

  WrappedComponent.displayName = `withTelegramProvider(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Утилиты для работы с Telegram WebApp
 */
export const TelegramUtils = {
  /**
   * Проверка доступности Telegram WebApp
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
  },

  /**
   * Получение данных пользователя из WebApp
   */
  getUser() {
    if (!this.isAvailable()) return null;
    return window.Telegram!.WebApp.initDataUnsafe?.user || null;
  },

  /**
   * Получение initData для аутентификации
   */
  getInitData(): string | null {
    if (!this.isAvailable()) return null;
    return window.Telegram!.WebApp.initData || null;
  },

  /**
   * Закрытие приложения
   */
  close(): void {
    if (this.isAvailable()) {
      window.Telegram!.WebApp.close();
    }
  },

  /**
   * Показ алерта
   */
  showAlert(message: string): void {
    if (this.isAvailable()) {
      window.Telegram!.WebApp.showAlert(message);
    } else {
      alert(message);
    }
  },

  /**
   * Haptic feedback
   */
  hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
    if (this.isAvailable()) {
      window.Telegram!.WebApp.HapticFeedback?.impactOccurred(type);
    }
  },
};
