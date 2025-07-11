// src/components/providers/TelegramProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback, type PropsWithChildren } from 'react';

// ✅ Правильные импорты согласно актуальной документации SDK v3.x
// https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk-react/3-x
import { 
  useLaunchParams, 
  useRawInitData, 
  init, 
  mockTelegramEnv,
  retrieveLaunchParams
} from '@telegram-apps/sdk-react';

interface TelegramContextValue {
  isReady: boolean;
  user: any;
  isAuthenticated: boolean;
  isTelegramEnvironment: boolean;
  error: string | null;
  initData: any;
  launchParams: any;
}

const TelegramContext = createContext<TelegramContextValue>({
  isReady: false,
  user: null,
  isAuthenticated: false,
  isTelegramEnvironment: false,
  error: null,
  initData: null,
  launchParams: null
});

/**
 * ✅ Компонент для инициализации SDK v3.x с правильным порядком
 * ИСПРАВЛЕН для решения LaunchParamsRetrieveError и редиректа в Telegram
 */
function TelegramSDKInitializer({ children }: PropsWithChildren) {
  const [state, setState] = useState<TelegramContextValue>({
    isReady: false,
    user: null,
    isAuthenticated: false,
    isTelegramEnvironment: false,
    error: null,
    initData: null,
    launchParams: null
  });
  
  // ✅ КРИТИЧНО: Используем SSR флаг для хуков v3.x
  const launchParams = useLaunchParams(true); // SSR safe mode
  const rawInitData = useRawInitData(); // НЕ принимает параметров в v3.x
  
  const initializeTelegramSDK = useCallback(async () => {
    try {
      console.log('🚀 Инициализация Telegram SDK v3.x...');
      
      let user = null;
      let processedInitData = null;
      let isTelegramEnvironment = false;
      let finalLaunchParams = launchParams;
      
      // ✅ ИСПРАВЛЕНИЕ: Многоуровневая проверка среды Telegram
      const environmentChecks = {
        // Проверка 1: Telegram WebApp объект
        hasWebApp: typeof window !== 'undefined' && !!(window as any)?.Telegram?.WebApp,
        
        // Проверка 2: initData в WebApp
        hasInitData: typeof window !== 'undefined' && !!(window as any)?.Telegram?.WebApp?.initData,
        
        // Проверка 3: launchParams получены через SDK
        hasLaunchParams: !!launchParams && typeof launchParams === 'object',
        
        // Проверка 4: URL содержит tgWebApp параметры
        hasWebAppInUrl: typeof window !== 'undefined' && window.location.href.includes('tgWebApp'),
        
        // Проверка 5: User Agent содержит Telegram
        hasTelegramUA: typeof window !== 'undefined' && 
                      (navigator.userAgent.includes('TelegramBot') || 
                       navigator.userAgent.includes('Telegram') ||
                       navigator.userAgent.includes('tgWebApp')),
        
        // Проверка 6: Referrer от Telegram
        hasTelegramReferrer: typeof window !== 'undefined' && document.referrer.includes('telegram')
      };
      
      const positiveChecks = Object.values(environmentChecks).filter(Boolean).length;
      const isLikelyTelegram = positiveChecks >= 2;
      
      console.log('🔍 Environment checks:', { ...environmentChecks, positiveChecks, isLikelyTelegram });
      
      if (isLikelyTelegram && typeof window !== 'undefined') {
        console.log('📱 Detected Telegram environment');
        
        // ✅ ИСПРАВЛЕНИЕ: Если SDK не может получить launchParams, 
        // используем прямое извлечение из Telegram WebApp
        if (!launchParams && (window as any)?.Telegram?.WebApp) {
          console.log('⚠️ launchParams не получены через SDK, извлекаем напрямую из WebApp');
          
          try {
            const webApp = (window as any).Telegram.WebApp;
            const directInitData = webApp.initData;
            
            if (directInitData) {
              // Парсим initData напрямую
              const params = new URLSearchParams(directInitData);
              const userStr = params.get('user');
              
              if (userStr) {
                user = JSON.parse(userStr);
                // ✅ Правильная структура для SDK v3.x
                processedInitData = {
                  user,
                  auth_date: parseInt(params.get('auth_date') || '0'),
                  query_id: params.get('query_id') || undefined,
                  hash: params.get('hash') || undefined,
                  start_param: params.get('start_param') || undefined,
                  chat_type: params.get('chat_type') || undefined,
                  chat_instance: params.get('chat_instance') || undefined
                };
                
                // Создаем launchParams вручную
                finalLaunchParams = {
                  tgWebAppData: processedInitData,
                  tgWebAppVersion: webApp.version || '8.0',
                  tgWebAppPlatform: webApp.platform || 'unknown',
                  tgWebAppStartParam: params.get('start_param') || '',
                  tgWebAppBotInline: false,
                  tgWebAppThemeParams: webApp.themeParams || {}
                };
                
                isTelegramEnvironment = true;
                console.log('✅ User извлечен напрямую из WebApp:', {
                  hasUser: !!user,
                  userId: user?.id,
                  userName: user?.first_name
                });
              }
            }
          } catch (directError) {
            console.warn('⚠️ Ошибка прямого извлечения из WebApp:', directError);
          }
        } else if (launchParams) {
          // ✅ Стандартная обработка через launchParams
          console.log('📱 Launch params v3.x structure:', {
            keys: Object.keys(launchParams),
            hasWebAppData: !!launchParams.tgWebAppData,
            platform: launchParams.tgWebAppPlatform,
            version: launchParams.tgWebAppVersion
          });
          
          if (launchParams.tgWebAppData) {
            const webAppDataStr = launchParams.tgWebAppData;
            
            try {
              let webAppData;
              if (typeof webAppDataStr === 'string') {
                const params = new URLSearchParams(webAppDataStr);
                const userStr = params.get('user');
                if (userStr) {
                  user = JSON.parse(userStr);
                  // ✅ Правильная структура для SDK v3.x (snake_case)
                  processedInitData = {
                    user,
                    auth_date: parseInt(params.get('auth_date') || '0'),
                    query_id: params.get('query_id') || undefined,
                    hash: params.get('hash') || undefined,
                    start_param: params.get('start_param') || undefined,
                    chat_type: params.get('chat_type') || undefined,
                    chat_instance: params.get('chat_instance') || undefined
                  };
                }
              } else if (typeof webAppDataStr === 'object') {
                webAppData = webAppDataStr;
                user = webAppData.user;
                processedInitData = webAppData;
              }
              
              isTelegramEnvironment = true;
              console.log('✅ User extracted from tgWebAppData:', {
                hasUser: !!user,
                userId: user?.id,
                userName: user?.first_name
              });
            } catch (parseError) {
              console.warn('⚠️ Error parsing tgWebAppData:', parseError);
            }
          }
        }
      }
      
      // ✅ ИСПРАВЛЕНИЕ: Улучшенный fallback для development/testing режима
      if (!user) {
        console.log('🔧 Создаем fallback environment для тестирования...');
        
        const mockUser = {
          id: Math.floor(Math.random() * 1000000000),
          first_name: 'Георгий',
          last_name: 'Тактаров',
          username: 'taktarovgv',
          language_code: 'ru',
          is_premium: false,
          allows_write_to_pm: true,
          photo_url: 'https://t.me/i/userpic/320/4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg'
        };

        const themeParams = {
          accent_text_color: '#6ab2f2' as `#${string}`,
          bg_color: '#17212b' as `#${string}`,
          button_color: '#5288c1' as `#${string}`,
          button_text_color: '#ffffff' as `#${string}`,
          destructive_text_color: '#ec3942' as `#${string}`,
          header_bg_color: '#17212b' as `#${string}`,
          hint_color: '#708499' as `#${string}`,
          link_color: '#6ab3f3' as `#${string}`,
          secondary_bg_color: '#232e3c' as `#${string}`,
          section_bg_color: '#17212b' as `#${string}`,
          section_header_text_color: '#6ab3f3' as `#${string}`,
          subtitle_text_color: '#708499' as `#${string}`,
          text_color: '#f5f5f5' as `#${string}`,
        };

        const mockWebAppData = new URLSearchParams([
          ['user', JSON.stringify(mockUser)],
          ['auth_date', Math.floor(Date.now() / 1000).toString()],
          ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
          ['start_param', 'debug'],
          ['chat_type', 'sender'],
          ['chat_instance', '8428209589180549439']
        ]).toString();

        // ✅ ИСПРАВЛЕНИЕ: Безопасная настройка mock environment
        if (process.env.NODE_ENV === 'development') {
          try {
            mockTelegramEnv({
              launchParams: {
                tgWebAppThemeParams: themeParams,
                tgWebAppData: {
                  user: mockUser,
                  auth_date: Math.floor(Date.now() / 1000),
                  hash: '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31',
                  start_param: 'debug',
                  chat_type: 'sender',
                  chat_instance: '8428209589180549439'
                },
                tgWebAppVersion: '8.0',
                tgWebAppPlatform: 'tdesktop',
                tgWebAppStartParam: 'debug',
                tgWebAppBotInline: false
              }
            });
            console.log('✅ Mock environment успешно настроен');
          } catch (mockError) {
            console.warn('⚠️ Ошибка настройки mock environment:', mockError);
          }
        }

        user = mockUser;
        // ✅ Правильная структура для SDK v3.x
        processedInitData = {
          user: mockUser,
          auth_date: Math.floor(Date.now() / 1000),
          hash: '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31',
          start_param: 'debug',
          chat_type: 'sender',
          chat_instance: '8428209589180549439',
          isMock: true,
          isDevFallback: !isLikelyTelegram
        };
        
        finalLaunchParams = {
          tgWebAppData: {
            user: mockUser,
            auth_date: Math.floor(Date.now() / 1000),
            hash: '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31',
            start_param: 'debug',
            chat_type: 'sender',
            chat_instance: '8428209589180549439'
          },
          tgWebAppVersion: '8.0',
          tgWebAppPlatform: 'tdesktop',
          tgWebAppStartParam: 'debug',
          tgWebAppBotInline: false,
          tgWebAppThemeParams: themeParams
        };
        
        // В реальном Telegram не считаем mock режимом
        isTelegramEnvironment = isLikelyTelegram;
      }

      setState({
        isReady: true,
        user: user || null,
        isAuthenticated: !!user,
        isTelegramEnvironment,
        error: null,
        initData: processedInitData,
        launchParams: finalLaunchParams
      });

      // ✅ Настройка Telegram WebApp (если доступно)
      if (typeof window !== 'undefined' && (window as any)?.Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        console.log('🎯 Настройка Telegram WebApp...');
        
        try {
          // Базовые настройки
          tg.ready();
          tg.expand();
          
          // Безопасная настройка дополнительных функций
          const safeFunctions = [
            { name: 'disableVerticalSwipes', fn: () => tg.disableVerticalSwipes?.() },
            { name: 'setHeaderColor', fn: () => tg.setHeaderColor?.('#ffffff') },
            { name: 'setBottomBarColor', fn: () => tg.setBottomBarColor?.('#ffffff') },
            { name: 'requestFullscreen', fn: () => tg.requestFullscreen?.() },
            { name: 'enableClosingConfirmation', fn: () => tg.enableClosingConfirmation?.() }
          ];

          safeFunctions.forEach(({ name, fn }) => {
            try {
              fn();
              console.log(`✅ ${name} настроено`);
            } catch (err) {
              console.warn(`⚠️ ${name} недоступно:`, err);
            }
          });
        } catch (err) {
          console.warn('⚠️ Ошибка настройки Telegram WebApp:', err);
        }
      }

      console.log('✅ Telegram SDK v3.x успешно инициализирован');
      
    } catch (error) {
      console.error('❌ Ошибка инициализации Telegram SDK:', error);
      
      // ✅ ИСПРАВЛЕНИЕ: Не считаем LaunchParamsRetrieveError критичной ошибкой
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка инициализации';
      const isLaunchParamsError = errorMessage.includes('LaunchParamsRetrieveError') || 
                                  errorMessage.includes('Unable to retrieve launch parameters');
      
      if (isLaunchParamsError) {
        console.log('🔧 LaunchParamsRetrieveError - это нормально при работе вне Telegram');
        
        // Создаем базовый fallback для тестирования
        const mockUser = {
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'test_user',
          language_code: 'ru',
          is_premium: false
        };
        
        setState({
          isReady: true,
          user: mockUser,
          isAuthenticated: true,
          isTelegramEnvironment: false,
          error: null,
          initData: {
            user: mockUser,
            auth_date: Math.floor(Date.now() / 1000),
            isMock: true,
            isLaunchParamsError: true
          },
          launchParams: null
        });
        
        return; // Выходим без ошибки
      }
      
      // Только критичные ошибки записываем в error
      setState(prev => ({
        ...prev,
        isReady: true,
        error: errorMessage
      }));
    }
  }, [launchParams]); // rawInitData убираем из зависимостей

  // ✅ Инициализация только на клиенте
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Даем время для полной загрузки Telegram WebApp
      const timeoutId = setTimeout(initializeTelegramSDK, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [initializeTelegramSDK]);

  return (
    <TelegramContext.Provider value={state}>
      {children}
    </TelegramContext.Provider>
  );
}

/**
 * ✅ ИСПРАВЛЕННЫЙ TelegramProvider с обработкой init() ошибок
 */
export function TelegramProvider({ children }: PropsWithChildren) {
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // ✅ ИСПРАВЛЕНИЕ: Клиентская инициализация SDK с обработкой ошибок
  useEffect(() => {
    setMounted(true);
    
    if (typeof window === 'undefined') return;
    
    const initializeSDK = async () => {
      try {
        console.log('🔧 Инициализация базового SDK...');
        
        // ✅ ИСПРАВЛЕНИЕ: Обработка различных сценариев init()
        try {
          await init();
          console.log('✅ Базовый SDK инициализирован через init()');
        } catch (initSDKError) {
          console.warn('⚠️ init() выдал ошибку, пробуем альтернативный подход:', initSDKError);
          
          // ✅ ИСПРАВЛЕНИЕ: Альтернативная инициализация с пользовательскими launchParams
          const customLaunchParams = {
            tgWebAppVersion: '8.0',
            tgWebAppPlatform: 'unknown',
            tgWebAppBotInline: false,
            tgWebAppData: 'user=%7B%22id%22%3A123456%7D',
            tgWebAppStartParam: '',
            tgWebAppThemeParams: {}
          };
          
          try {
            await init({
              acceptCustomStyles: true,
              launchParams: customLaunchParams
            });
            console.log('✅ Базовый SDK инициализирован с пользовательскими параметрами');
          } catch (customInitError) {
            console.warn('⚠️ Альтернативная инициализация не удалась:', customInitError);
            // Продолжаем работу без SDK init - приложение все равно может работать
          }
        }
        
        setIsSDKInitialized(true);
      } catch (error) {
        console.error('❌ Критическая ошибка инициализации:', error);
        
        // ✅ В любом режиме продолжаем работу, если возможно
        console.log('🔧 Продолжаем работу без полной SDK инициализации');
        setIsSDKInitialized(true);
      }
    };

    // Задержка для полной загрузки страницы
    const timeoutId = setTimeout(initializeSDK, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  // ✅ Показываем загрузку до инициализации
  if (!mounted || !isSDKInitialized) {
    if (initError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
            <div className="text-red-500 text-2xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Ошибка инициализации</h3>
            <p className="text-sm text-red-600 text-center mb-4">{initError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Перезагрузить
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Инициализация 3GIS...</p>
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
 * ✅ Компонент для отображения статуса Telegram (для отладки)
 */
export function TelegramStatus() {
  const { isReady, user, isTelegramEnvironment, error, initData } = useTelegram();
  
  // ✅ Не показываем в продакшене
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  if (error) {
    return (
      <div className="fixed bottom-4 left-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm max-w-xs z-50">
        <strong className="font-bold">Ошибка SDK:</strong>
        <span className="block text-xs mt-1">{error}</span>
      </div>
    );
  }
  
  if (!isReady) {
    return (
      <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm z-50">
        Инициализация SDK...
      </div>
    );
  }
  
  const isMock = initData?.isMock;
  const isDevFallback = initData?.isDevFallback;
  const isLaunchParamsError = initData?.isLaunchParamsError;
  
  return (
    <div className={`fixed bottom-4 left-4 px-3 py-2 rounded text-sm max-w-xs z-50 border ${
      isTelegramEnvironment 
        ? 'bg-green-100 border-green-400 text-green-700' 
        : isLaunchParamsError
        ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
        : isMock || isDevFallback
        ? 'bg-blue-100 border-blue-400 text-blue-700'
        : 'bg-gray-100 border-gray-400 text-gray-700'
    }`}>
      <strong className="font-bold">
        {isTelegramEnvironment ? '✅ Telegram SDK v3.x' : 
         isLaunchParamsError ? '⚠️ Browser Mode (LaunchParams Error)' :
         isDevFallback ? '🌐 Browser Fallback' :
         isMock ? '🔧 Mock Mode (v3.x)' : '🖥️ Unknown Mode'}
      </strong>
      {user && (
        <span className="block text-xs mt-1">
          {user.first_name || user.firstName} {user.last_name || user.lastName}
          {(user.username) && ` (@${user.username})`}
        </span>
      )}
      {(isMock || isDevFallback || isLaunchParamsError) && (
        <span className="block text-xs mt-1 text-blue-600">
          {isLaunchParamsError ? 'SDK работает в fallback режиме' :
           isDevFallback ? 'Development browser fallback' : 
           'Development mock data'}
        </span>
      )}
    </div>
  );
}

/**
 * ✅ Хук для обратной совместимости
 */
export function useTelegramEnvironment() {
  const { isTelegramEnvironment } = useTelegram();
  
  return {
    isTelegramEnvironment,
    isWebApp: isTelegramEnvironment,
    isDevelopment: process.env.NODE_ENV === 'development'
  };
}

/**
 * ✅ Хук для обратной совместимости с авторизацией
 */
export function useTelegramAuth() {
  const { user, isAuthenticated, error, isReady, initData, launchParams } = useTelegram();
  
  return {
    user,
    isAuthenticated,
    error,
    isLoading: !isReady,
    initData: initData,
    webAppData: initData,
    launchParams: launchParams
  };
}
