// src/components/providers/TelegramProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { init } from '@telegram-apps/sdk-react';
import type { TelegramUser, TelegramContextValue, TelegramWebApp, LaunchParams } from '@/types/telegram';

const TelegramContext = createContext<TelegramContextValue>({
  isReady: false,
  user: null,
  isAuthenticated: false,
  isTelegramEnvironment: false,
  error: null,
  launchParams: null,
  webApp: null,
  sdkVersion: '3.x'
});

/**
 * ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ v10: Устранение ошибки "Event handlers cannot be passed to Client Component props"
 * 
 * ОСНОВНЫЕ ИСПРАВЛЕНИЯ:
 * 1. ❌ НЕ используем useLaunchParams (не поддерживает SSR в SDK v3.x)
 * 2. ✅ Собственная безопасная реализация через нативные Telegram API
 * 3. ✅ Полная совместимость с Next.js 15.3.3 SSR/Client компонентами
 * 4. ✅ Устранены все event handlers в props между Server/Client компонентами
 * 
 * ИСТОЧНИК ПРОБЛЕМЫ:
 * - useLaunchParams в SDK v3.x не поддерживает SSR параметр
 * - Вызывает ошибку при Server-Side Rendering в Next.js 15.3.3
 * - GitHub Issue: https://github.com/Telegram-Mini-Apps/telegram-apps/issues/347
 */
function TelegramSDKWrapper({ children }: PropsWithChildren) {
  const [state, setState] = useState<TelegramContextValue>({
    isReady: false,
    user: null,
    isAuthenticated: false,
    isTelegramEnvironment: false,
    error: null,
    launchParams: null,
    webApp: null,
    sdkVersion: '3.10.1'
  });

  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: НЕ используем useLaunchParams - заменяем на безопасную реализацию
  useEffect(() => {
    const initializeTelegramData = async () => {
      try {
        console.log('🚀 Инициализация Telegram данных БЕЗ useLaunchParams (v10)...');
        
        let user: TelegramUser | null = null;
        let isTelegramEnv = false;
        let webApp: TelegramWebApp | undefined = undefined;
        let launchParams: LaunchParams | null = null;

        // ✅ БЕЗОПАСНЫЙ МЕТОД 1: Прямое использование нативных Telegram API
        if (typeof window !== 'undefined') {
          const globalWebApp = (window as any)?.Telegram?.WebApp;
          
          if (globalWebApp) {
            webApp = globalWebApp;
            isTelegramEnv = true;
            
            console.log('📱 WebApp обнаружен:', {
              version: globalWebApp.version,
              platform: globalWebApp.platform,
              hasInitData: !!globalWebApp.initData
            });

            // ✅ Получаем пользователя из initDataUnsafe
            if (globalWebApp.initDataUnsafe?.user) {
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
              
              console.log('✅ Пользователь из Telegram WebApp:', user.first_name);
            }

            // ✅ БЕЗОПАСНОЕ получение launch параметров БЕЗ SDK хука
            try {
              // Метод 1: Из URL параметров (всегда доступно)
              const urlParams = new URLSearchParams(window.location.search);
              const urlStartParam = urlParams.get('startapp') || 
                                   urlParams.get('start') || 
                                   urlParams.get('startParam');

              // Метод 2: Из WebApp.initDataUnsafe (если есть)
              const webAppStartParam = globalWebApp.initDataUnsafe?.start_param;

              const actualStartParam = urlStartParam || webAppStartParam;

              if (actualStartParam) {
                launchParams = {
                  startParam: actualStartParam,
                  tgWebAppStartParam: actualStartParam,
                  platform: globalWebApp.platform || 'unknown',
                  version: globalWebApp.version || '7.0'
                } as LaunchParams;
                console.log('📱 Launch params получены:', launchParams);
              }

              // ✅ Дополнительные данные из WebApp
              if (globalWebApp.initDataUnsafe) {
                launchParams = {
                  ...launchParams,
                  tgWebAppData: globalWebApp.initDataUnsafe,
                  hash: globalWebApp.initDataUnsafe.hash,
                  queryId: globalWebApp.initDataUnsafe.query_id
                } as LaunchParams;
              }

            } catch (paramError) {
              console.log('ℹ️ Launch params недоступны:', paramError);
            }
          } else {
            console.log('ℹ️ Telegram WebApp API недоступен - возможно обычный браузер');
          }
        }

        // ✅ БЕЗОПАСНЫЙ МЕТОД 2: Определение среды без SDK
        if (typeof window !== 'undefined') {
          const userAgent = navigator.userAgent;
          const hasTelegramUA = userAgent.includes('TelegramDesktop') ||
                               userAgent.includes('Telegram Desktop') ||
                               userAgent.includes('Telegram/') ||
                               userAgent.includes('TelegramBot') ||
                               userAgent.includes('TelegramWebView');

          if (hasTelegramUA || webApp) {
            isTelegramEnv = true;
            console.log('✅ Telegram среда обнаружена через:', webApp ? 'WebApp API' : 'User Agent');
          }
        }

        // ✅ Development fallback (только в разработке)
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
          
          // Mock launch params для тестирования
          if (!launchParams) {
            const urlParams = new URLSearchParams(window.location.search);
            const testStartParam = urlParams.get('startapp') || 'test_param';
            launchParams = {
              startParam: testStartParam,
              tgWebAppStartParam: testStartParam,
              platform: 'web',
              version: '7.0'
            } as LaunchParams;
          }
        }

        // ✅ Обновляем состояние с результатами
        setState({
          isReady: true,
          user,
          isAuthenticated: !!user,
          isTelegramEnvironment: isTelegramEnv,
          error: null, // Нет критических ошибок
          launchParams,
          webApp: webApp || null,
          sdkVersion: '3.10.1-fixed'
        });

        console.log('📊 Telegram Provider готов (v10 ИСПРАВЛЕНО):', {
          hasUser: !!user,
          isTelegramEnv,
          launchParamsAvailable: !!launchParams,
          webAppAvailable: !!webApp,
          startParam: launchParams?.startParam || 'none'
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

    // Задержка для обеспечения загрузки Telegram WebApp
    const timeoutId = setTimeout(initializeTelegramData, 200);
    return () => clearTimeout(timeoutId);
  }, []); // Пустой массив зависимостей - инициализация только один раз

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
        console.log('🔧 Инициализация базового SDK v3.x (v10 ИСПРАВЛЕНО)...');
        
        // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Правильная инициализация SDK v3.x
        // В SDK v3.x функция init() не принимает параметров конфигурации
        init(); // Согласно документации v3.x
        console.log('✅ SDK v3.x успешно инициализирован');
        
        setIsSDKInitialized(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // ✅ Не блокируем работу из-за ошибок SDK - многие ошибки нормальны
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
          <p className="text-gray-700 font-medium">Инициализация Telegram v10...</p>
          <p className="text-xs text-gray-500 mt-2">ИСПРАВЛЕНО: SSR совместимость</p>
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
          🔧 Telegram Debug v{sdkVersion} FIXED v10
        </summary>
        <div className="space-y-1 mt-2">
          <div>Ready: {isReady ? '✅' : '❌'}</div>
          <div>Environment: {isTelegramEnvironment ? '📱 Telegram' : '🌐 Browser'}</div>
          <div>User: {user ? `${user.first_name} (${user.id})` : 'None'}</div>
          <div>Launch Params: {launchParams ? '✅' : '❌'}</div>
          <div>Start Param: {launchParams?.startParam || 'None'}</div>
          <div className="text-green-300">✅ SSR Compatible</div>
          <div className="text-green-300">✅ No useLaunchParams</div>
          {error && <div className="text-yellow-300">Info: {error.substring(0, 50)}...</div>}
        </div>
      </details>
    </div>
  );
}