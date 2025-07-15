// src/components/providers/TelegramProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { init, useLaunchParams } from '@telegram-apps/sdk-react';
import type { TelegramUser, TelegramContextValue, TelegramWebApp } from '@/types/telegram';

const TelegramContext = createContext<TelegramContextValue>({
  isReady: false,
  user: null,
  isAuthenticated: false,
  isTelegramEnvironment: false,
  error: null,
  launchParams: null,
  webApp: null, // ✅ ИСПРАВЛЕНО: null вместо undefined согласно типу TelegramContextValue
  sdkVersion: '3.x'
});

/**
 * ✅ ИСПРАВЛЕНИЕ 3: Безусловный вызов React Hooks
 * 
 * КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ:
 * - useLaunchParams вызывается БЕЗУСЛОВНО (без try/catch)
 * - Обработка ошибок перенесена в useEffect
 * - Соблюдение Rules of Hooks - хуки в одинаковом порядке при каждом рендере
 */
function TelegramSDKWrapper({ children }: PropsWithChildren) {
  const [state, setState] = useState<TelegramContextValue>({
    isReady: false,
    user: null,
    isAuthenticated: false,
    isTelegramEnvironment: false,
    error: null,
    launchParams: null,
    webApp: null, // ✅ ИСПРАВЛЕНО: null вместо undefined согласно типу TelegramContextValue
    sdkVersion: '3.10.1'
  });

  // ✅ ИСПРАВЛЕНИЕ SDK v3.x: Правильное использование SSR флага
  // В SDK v3.x useLaunchParams(true) для SSR совместимости с Next.js
  const launchParams: any = useLaunchParams(true); // ✅ SSR флаг для Next.js

  useEffect(() => {
    const initializeTelegramData = () => {
      let launchParamsError: string | null = null;
      let actualLaunchParams: any = null; // ✅ Используем any для совместимости SDK v3.x

      try {
        // ✅ Проверяем результат хука здесь, в useEffect
        if (launchParams) {
          actualLaunchParams = launchParams;
          console.log('📱 LaunchParams получены успешно');
        }
      } catch (error) {
        console.log('ℹ️ Ошибка при обработке LaunchParams:', error);
        launchParamsError = error instanceof Error ? error.message : 'Unknown error';
      }

      try {
        console.log('🚀 Инициализация Telegram SDK v3.x данных...');
        
        let user: TelegramUser | null = null;
        let isTelegramEnv = false;
        let webApp: TelegramWebApp | undefined = undefined;

        // ✅ Метод 1: Проверяем launch params (SDK v3.x)
        if (actualLaunchParams && typeof actualLaunchParams === 'object') {
          console.log('📱 Данные из launch params:', actualLaunchParams);
          
          // ✅ ИСПРАВЛЕНИЕ: Безопасное обращение к tgWebAppData в SDK v3.x
          let telegramUser = null;
          
          // ✅ Ищем пользователя с правильной типизацией для SDK v3.x
          const webAppData = actualLaunchParams.tgWebAppData as any; // ✅ ИСПРАВЛЕНИЕ: Используем any для совместимости
          if (webAppData && typeof webAppData === 'object' && 'user' in webAppData) {
            telegramUser = webAppData.user;
          }
          
          // Альтернативный способ - проверяем другие возможные пути к данным пользователя в SDK v3.x
          if (!telegramUser && actualLaunchParams.tgWebAppData) {
            // В SDK v3.x данные находятся в tgWebAppData, а не в initData
            const tgWebAppData = actualLaunchParams.tgWebAppData;
            if (tgWebAppData && typeof tgWebAppData === 'object' && 'user' in tgWebAppData) {
              telegramUser = tgWebAppData.user;
            }
          }
          
          if (telegramUser) {
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
            console.log('✅ Пользователь из launch params:', user.first_name);
          }
        }

        // ✅ Метод 2: Fallback к глобальному Telegram API
        if (typeof window !== 'undefined') {
          const globalWebApp = (window as any)?.Telegram?.WebApp;
          if (globalWebApp) {
            webApp = globalWebApp;
            
            // Если еще нет пользователя, попробуем получить из WebApp
            if (!user && globalWebApp.initDataUnsafe?.user) {
              const globalUser = globalWebApp.initDataUnsafe.user;
              
              user = {
                id: globalUser.id,
                first_name: globalUser.first_name || '',
                last_name: globalUser.last_name || undefined,
                username: globalUser.username || undefined,
                language_code: globalUser.language_code || undefined,
                is_premium: globalUser.is_premium || false,
                allows_write_to_pm: globalUser.allows_write_to_pm || false,
                photo_url: globalUser.photo_url || undefined
              };
              
              isTelegramEnv = true;
              console.log('✅ Пользователь из глобального Telegram API:', user.first_name);
            }
            
            // Если WebApp API доступен, значит мы в Telegram среде
            if (!isTelegramEnv && globalWebApp.version) {
              isTelegramEnv = true;
              console.log('✅ Обнаружена Telegram среда через WebApp API');
            }
          }
        }

        // ✅ Development fallback
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
          isTelegramEnv = true;
        }

        // ✅ Обновляем состояние с результатами
        setState({
          isReady: true,
          user,
          isAuthenticated: !!user,
          isTelegramEnvironment: isTelegramEnv,
          error: launchParamsError, // Сохраняем ошибки но не блокируем
          launchParams: actualLaunchParams || null,
          webApp: webApp || null, // ✅ ИСПРАВЛЕНО: null вместо undefined
          sdkVersion: '3.10.1'
        });

        console.log('📊 Telegram Provider готов:', {
          hasUser: !!user,
          isTelegramEnv,
          launchParamsAvailable: !!actualLaunchParams,
          webAppAvailable: !!webApp,
          error: launchParamsError
        });

      } catch (error) {
        console.error('❌ Ошибка инициализации Telegram данных:', error);
        setState(prev => ({
          ...prev,
          isReady: true,
          error: error instanceof Error ? error.message : 'Неизвестная ошибка SDK',
          isTelegramEnvironment: false
        }));
      }
    };

    // Инициализируем данные Telegram
    initializeTelegramData();
  }, [launchParams]); // ✅ launchParams как зависимость

  return (
    <TelegramContext.Provider value={state}>
      {children}
    </TelegramContext.Provider>
  );
}

/**
 * ✅ ГЛАВНЫЙ TelegramProvider с безопасной инициализацией SDK v3.x
 */
export function TelegramProvider({ children }: PropsWithChildren) {
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeSDK = async () => {
      try {
        console.log('🔧 Инициализация базового SDK v3.x...');
        
        // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Правильная инициализация SDK v3.x
        // В SDK v3.x функция init() не принимает параметров конфигурации
        init(); // Согласно документации v3.x
        console.log('✅ SDK v3.x успешно инициализирован');
        
        setIsSDKInitialized(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // ✅ Не блокируем работу из-за ошибок SDK
        console.log('ℹ️ SDK init message (может быть нормально):', errorMessage);
        setIsSDKInitialized(true); // Продолжаем работу в любом случае
        
        // Только критические ошибки показываем пользователю
        if (errorMessage.includes('critical') || errorMessage.includes('fatal')) {
          setInitError(errorMessage);
        }
      }
    };

    // Небольшая задержка для стабильности
    const timeoutId = setTimeout(initializeSDK, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  // Loading состояние
  if (!isSDKInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xl font-bold text-white">3GIS</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Инициализация Telegram...</p>
        </div>
      </div>
    );
  }

  // Critical error состояние (очень редко в production)
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Критическая ошибка SDK</h3>
          <p className="text-sm text-red-600 mb-4">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Перезагрузить страницу
          </button>
        </div>
      </div>
    );
  }

  return (
    <TelegramSDKWrapper>
      {children}
    </TelegramSDKWrapper>
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
export function TelegramDebugStatus() {
  const { isReady, user, isTelegramEnvironment, error, sdkVersion, launchParams } = useTelegram();
  
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
          <div>Launch Params: {launchParams ? '✅' : '❌'}</div>
          {error && <div className="text-yellow-300">Info: {error.substring(0, 50)}...</div>}
        </div>
      </details>
    </div>
  );
}
