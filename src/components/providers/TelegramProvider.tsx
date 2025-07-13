// src/components/providers/TelegramProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback, type PropsWithChildren } from 'react';
import { useLaunchParams, useRawInitData, init } from '@telegram-apps/sdk-react';
import type { TelegramContextValue, TelegramUser } from '@/types/telegram';

const TelegramContext = createContext<TelegramContextValue>({
  isReady: false,
  user: null,
  isAuthenticated: false,
  isTelegramEnvironment: false,
  error: null,
  launchParams: null,
  rawInitData: null,
  sdkVersion: '3.x'
});

/**
 * ✅ ПРАВИЛЬНАЯ РЕАЛИЗАЦИЯ для SDK v3.x
 * Основано на официальной документации: https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk-react/3-x
 */
function TelegramSDKInitializer({ children }: PropsWithChildren) {
  const [state, setState] = useState<TelegramContextValue>({
    isReady: false,
    user: null,
    isAuthenticated: false,
    isTelegramEnvironment: false,
    error: null,
    launchParams: null,
    rawInitData: null,
    sdkVersion: '3.10.1'
  });

  // ✅ ПРАВИЛЬНО: Хуки SDK v3.x с корректными параметрами
  const launchParams = useLaunchParams(true); // SSR флаг для Next.js
  const rawInitData = useRawInitData(); // Без параметров в v3.x

  const initializeTelegramData = useCallback(() => {
    try {
      console.log('🚀 Инициализация Telegram SDK v3.x...');
      
      let user: TelegramUser | null = null;
      let isTelegramEnv = false;

      // ✅ ИСПРАВЛЕНИЕ #3: Безопасная типизация для SDK v3.x
      if (launchParams && typeof launchParams === 'object') {
        const params = launchParams as any; // Временное приведение типа
        
        // Проверяем наличие пользователя в структуре SDK v3.x
        if (params.tgWebAppData?.user) {
          const telegramUser = params.tgWebAppData.user;
          
          user = {
            id: telegramUser.id,
            first_name: telegramUser.first_name || '',
            last_name: telegramUser.last_name || undefined,
            username: telegramUser.username || undefined,
            language_code: telegramUser.language_code || undefined,
            is_premium: telegramUser.is_premium || false,
            allows_write_to_pm: telegramUser.allows_write_to_pm || false,
            photo_url: telegramUser.photo_url || undefined
          };
          
          isTelegramEnv = true;
          console.log('✅ Пользователь из SDK v3.x:', user.first_name);
        }
      }

      // ✅ Fallback для development/testing
      if (!user && process.env.NODE_ENV === 'development') {
        console.log('🔧 Development mode: создаем mock пользователя');
        user = {
          id: 123456789,
          first_name: 'Dev',
          last_name: 'User',
          username: 'dev_user',
          language_code: 'ru',
          is_premium: false,
          allows_write_to_pm: true
        };
      }

      setState({
        isReady: true,
        user,
        isAuthenticated: !!user,
        isTelegramEnvironment: isTelegramEnv,
        error: null,
        launchParams,
        rawInitData,
        sdkVersion: '3.10.1'
      });

    } catch (error) {
      console.error('❌ Ошибка инициализации Telegram SDK:', error);
      setState(prev => ({
        ...prev,
        isReady: true,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      }));
    }
  }, [launchParams, rawInitData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeTelegramData();
    }
  }, [initializeTelegramData]);

  return (
    <TelegramContext.Provider value={state}>
      {children}
    </TelegramContext.Provider>
  );
}

/**
 * ✅ ПРАВИЛЬНО: Главный TelegramProvider для SDK v3.x
 */
export function TelegramProvider({ children }: PropsWithChildren) {
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeSDK = async () => {
      try {
        console.log('🔧 Инициализация базового SDK v3.x...');
        
        // ✅ ПРАВИЛЬНО: init() без параметров в SDK v3.x
        init();
        console.log('✅ SDK v3.x инициализирован');
        
        setIsSDKInitialized(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // В development режиме некоторые ошибки SDK ожидаемы
        if (process.env.NODE_ENV === 'development') {
          console.log('ℹ️ SDK init warning (normal in development):', errorMessage);
          setIsSDKInitialized(true);
        } else {
          console.error('❌ Критическая ошибка SDK:', errorMessage);
          setInitError(errorMessage);
        }
      }
    };

    const timeoutId = setTimeout(initializeSDK, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  // Loading состояние
  if (!isSDKInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-white">3GIS</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Инициализация SDK v3.x...</p>
        </div>
      </div>
    );
  }

  // Error состояние
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Ошибка SDK</h3>
          <p className="text-sm text-red-600 mb-4">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  return (
    <TelegramSDKInitializer>
      {children}
    </TelegramSDKInitializer>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
}

/**
 * ✅ Debug компонент для development
 */
export function TelegramStatus() {
  const { isReady, user, isTelegramEnvironment, error, sdkVersion } = useTelegram();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs">
      <details className="bg-black/80 text-white text-xs p-3 rounded-lg backdrop-blur-sm">
        <summary className="cursor-pointer font-medium mb-2">
          🔧 Telegram Debug v{sdkVersion}
        </summary>
        <div className="space-y-1 mt-2">
          <div>Ready: {isReady ? '✅' : '❌'}</div>
          <div>Environment: {isTelegramEnvironment ? '📱 Telegram' : '🌐 Browser'}</div>
          <div>User: {user ? `${user.first_name} (${user.id})` : 'None'}</div>
          {error && <div className="text-red-300">Error: {error}</div>}
        </div>
      </details>
    </div>
  );
}