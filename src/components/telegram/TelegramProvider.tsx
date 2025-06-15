'use client';

import { useEffect, useState } from 'react';
import { init } from '@telegram-apps/sdk-react';
import { logger } from '@/utils/logger';

interface TelegramProviderProps {
  children: React.ReactNode;
  debug?: boolean;
}

/**
 * СОВРЕМЕННЫЙ TELEGRAM SDK PROVIDER ДЛЯ 3GIS
 * ✅ Поддержка @telegram-apps/sdk-react v3.3.1
 * ✅ Правильная инициализация SDK без SDKProvider
 * ✅ Debug режим для разработки
 * ✅ Обработка ошибок инициализации
 */
export function TelegramProvider({
  children,
  debug = process.env.NODE_ENV === 'development',
}: TelegramProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeSDK = async () => {
      try {
        if (debug) {
          logger.info('🚀 Initializing Telegram SDK v3.x...');
        }
        
        // Инициализация SDK v3.x - без SDKProvider
        await init();
        
        if (isMounted) {
          setIsInitialized(true);
          if (debug) {
            logger.info('✅ Telegram SDK initialized successfully');
          }
        }
      } catch (error) {
        logger.error('❌ Telegram SDK initialization failed:', error);
        
        if (isMounted) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Unknown SDK initialization error';
          setInitError(errorMessage);
        }
      }
    };

    // Инициализируем SDK только на клиенте
    if (typeof window !== 'undefined') {
      initializeSDK();
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
            Ошибка инициализации Telegram SDK
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

  // Показываем загрузку пока SDK инициализируется
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Инициализация Telegram SDK
          </h2>
          <p className="text-gray-500">
            Подготавливаем приложение...
          </p>
        </div>
      </div>
    );
  }

  // Возвращаем приложение с инициализированным SDK
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
