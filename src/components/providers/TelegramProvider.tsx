// src/components/providers/TelegramProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback, type PropsWithChildren } from 'react';

// ✅ Правильные импорты согласно актуальной документации SDK v3.x
// https://docs.telegram-mini-apps.com/packages/telegram-apps/3-x
// https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk-react/3-x
import { 
  useLaunchParams, 
  useRawInitData, 
  init, 
  mockTelegramEnv
} from '@telegram-apps/sdk-react';

// ✅ ИСПРАВЛЕНИЕ: Правильные типы на основе официальной документации SDK v3.x
interface TelegramInitDataV3 {
  user?: any;
  auth_date?: number;      // ✅ ИСПРАВЛЕНО: number вместо Date для raw формата
  query_id?: string;
  hash?: string;
  start_param?: string;
  chat_type?: string;
  chat_instance?: string;
  isMock?: boolean;        // Для fallback режимов
  isDevFallback?: boolean;
  isLaunchParamsError?: boolean;
  [key: string]: any;
}

// ✅ Тип для launchParams v3.x (с tgWebApp префиксами)
interface TelegramLaunchParamsV3 {
  tgWebAppData?: TelegramInitDataV3 | string | any;
  tgWebAppVersion?: string;
  tgWebAppPlatform?: string;
  tgWebAppStartParam?: string;
  tgWebAppBotInline?: boolean;
  tgWebAppThemeParams?: Record<string, any>;
  [key: string]: any;
}

// ✅ ИСПРАВЛЕНИЕ: Тип для theme params согласно SDK v3.x требованиям
interface TelegramThemeParams {
  accent_text_color?: `#${string}`;
  bg_color?: `#${string}`;
  button_color?: `#${string}`;
  button_text_color?: `#${string}`;
  destructive_text_color?: `#${string}`;
  header_bg_color?: `#${string}`;
  hint_color?: `#${string}`;
  link_color?: `#${string}`;
  secondary_bg_color?: `#${string}`;
  section_bg_color?: `#${string}`;
  section_header_text_color?: `#${string}`;
  subtitle_text_color?: `#${string}`;
  text_color?: `#${string}`;
}

interface TelegramContextValue {
  isReady: boolean;
  user: any;
  isAuthenticated: boolean;
  isTelegramEnvironment: boolean;
  error: string | null;
  initData: any;
  launchParams: any;
  rawInitData: string | null;
}

const TelegramContext = createContext<TelegramContextValue>({
  isReady: false,
  user: null,
  isAuthenticated: false,
  isTelegramEnvironment: false,
  error: null,
  initData: null,
  launchParams: null,
  rawInitData: null
});

/**
 * ✅ Компонент для инициализации SDK v3.x с правильными типами
 * ИСПРАВЛЕН согласно актуальной документации
 */
function TelegramSDKInitializer({ children }: PropsWithChildren) {
  const [state, setState] = useState<TelegramContextValue>({
    isReady: false,
    user: null,
    isAuthenticated: false,
    isTelegramEnvironment: false,
    error: null,
    initData: null,
    launchParams: null,
    rawInitData: null
  });
  
  // ✅ КРИТИЧНО: Правильное использование хуков SDK v3.x
  // useLaunchParams() БЕЗ параметров в v3.x!
  const launchParams = useLaunchParams(); 
  // useRawInitData() БЕЗ параметров в v3.x!
  const rawInitData = useRawInitData();
  
  const initializeTelegramSDK = useCallback(async () => {
    try {
      console.log('🚀 Инициализация Telegram SDK v3.x...');
      
      let user = null;
      let processedInitData: TelegramInitDataV3 | null = null;
      let isTelegramEnvironment = false;
      let finalLaunchParams: TelegramLaunchParamsV3 | any = launchParams;
      let finalRawInitData: string | null = rawInitData || null;
      
      // ✅ ИСПРАВЛЕНИЕ: Многоуровневая проверка среды Telegram
      const environmentChecks = {
        // Проверка 1: Telegram WebApp объект
        hasWebApp: typeof window !== 'undefined' && !!(window as any)?.Telegram?.WebApp,
        
        // Проверка 2: initData в WebApp
        hasInitData: typeof window !== 'undefined' && !!(window as any)?.Telegram?.WebApp?.initData,
        
        // Проверка 3: launchParams получены через SDK
        hasLaunchParams: !!launchParams && typeof launchParams === 'object',
        
        // Проверка 4: rawInitData получен через SDK
        hasRawInitData: !!rawInitData && typeof rawInitData === 'string',
        
        // Проверка 5: URL содержит tgWebApp параметры
        hasWebAppInUrl: typeof window !== 'undefined' && window.location.href.includes('tgWebApp'),
        
        // Проверка 6: User Agent содержит Telegram
        hasTelegramUA: typeof window !== 'undefined' && 
                      (navigator.userAgent.includes('TelegramBot') || 
                       navigator.userAgent.includes('Telegram') ||
                       navigator.userAgent.includes('tgWebApp')),
        
        // Проверка 7: Referrer от Telegram
        hasTelegramReferrer: typeof window !== 'undefined' && document.referrer.includes('telegram')
      };
      
      const positiveChecks = Object.values(environmentChecks).filter(Boolean).length;
      const isLikelyTelegram = positiveChecks >= 2;
      
      console.log('🔍 Environment checks:', { ...environmentChecks, positiveChecks, isLikelyTelegram });
      console.log('📱 SDK v3.x data:', {
        hasLaunchParams: !!launchParams,
        launchParamsKeys: launchParams ? Object.keys(launchParams) : [],
        hasRawInitData: !!rawInitData,
        rawInitDataLength: rawInitData?.length || 0
      });
      
      if (isLikelyTelegram && typeof window !== 'undefined') {
        console.log('📱 Detected Telegram environment');
        
        // ✅ ИСПРАВЛЕНИЕ: Приоритет rawInitData из SDK v3.x
        if (rawInitData) {
          console.log('✅ Используем rawInitData из SDK v3.x');
          
          try {
            // rawInitData в v3.x это строка формата "user=...&auth_date=...&hash=..."
            const params = new URLSearchParams(rawInitData);
            const userStr = params.get('user');
            
            if (userStr) {
              user = JSON.parse(userStr);
              processedInitData = {
                user,
                auth_date: parseInt(params.get('auth_date') || '0'),
                query_id: params.get('query_id') || undefined,
                hash: params.get('hash') || undefined,
                start_param: params.get('start_param') || undefined,
                chat_type: params.get('chat_type') || undefined,
                chat_instance: params.get('chat_instance') || undefined
              };
              
              finalRawInitData = rawInitData;
              isTelegramEnvironment = true;
              
              console.log('✅ User извлечен из rawInitData:', {
                hasUser: !!user,
                userId: user?.id,
                userName: user?.first_name
              });
            }
          } catch (parseError) {
            console.warn('⚠️ Ошибка парсинга rawInitData:', parseError);
          }
        }
        
        // ✅ Fallback: launchParams v3.x структура
        if (!user && launchParams) {
          console.log('🔄 Fallback: используем launchParams v3.x');
          
          if (launchParams.tgWebAppData) {
            const webAppDataStr = launchParams.tgWebAppData;
            
            try {
              // ✅ В v3.x tgWebAppData может быть объектом или строкой
              if (typeof webAppDataStr === 'object' && webAppDataStr.user) {
                user = webAppDataStr.user;
                // ✅ ИСПРАВЛЕНИЕ: Безопасное приведение типов с проверкой
                processedInitData = {
                  user: webAppDataStr.user,
                  auth_date: typeof webAppDataStr.auth_date === 'number' 
                    ? webAppDataStr.auth_date 
                    : webAppDataStr.auth_date instanceof Date 
                    ? Math.floor(webAppDataStr.auth_date.getTime() / 1000)
                    : parseInt(webAppDataStr.auth_date || '0'),
                  query_id: webAppDataStr.query_id,
                  hash: webAppDataStr.hash,
                  start_param: webAppDataStr.start_param,
                  chat_type: webAppDataStr.chat_type,
                  chat_instance: webAppDataStr.chat_instance
                } as TelegramInitDataV3;
              } else if (typeof webAppDataStr === 'string') {
                const params = new URLSearchParams(webAppDataStr);
                const userStr = params.get('user');
                if (userStr) {
                  user = JSON.parse(userStr);
                  processedInitData = {
                    user,
                    auth_date: parseInt(params.get('auth_date') || '0'),
                    query_id: params.get('query_id') || undefined,
                    hash: params.get('hash') || undefined,
                    start_param: params.get('start_param') || undefined,
                    chat_type: params.get('chat_type') || undefined,
                    chat_instance: params.get('chat_instance') || undefined
                  };
                  
                  // Генерируем rawInitData для совместимости
                  finalRawInitData = webAppDataStr;
                }
              }
              
              isTelegramEnvironment = true;
              console.log('✅ User извлечен из launchParams.tgWebAppData');
            } catch (parseError) {
              console.warn('⚠️ Ошибка парсинга tgWebAppData:', parseError);
            }
          }
        }
        
        // ✅ Финальный Fallback: прямое извлечение из Telegram WebApp
        if (!user && (window as any)?.Telegram?.WebApp) {
          console.log('🔄 Final fallback: прямое извлечение из WebApp');
          
          try {
            const webApp = (window as any).Telegram.WebApp;
            const directInitData = webApp.initData;
            
            if (directInitData) {
              const params = new URLSearchParams(directInitData);
              const userStr = params.get('user');
              
              if (userStr) {
                user = JSON.parse(userStr);
                processedInitData = {
                  user,
                  auth_date: parseInt(params.get('auth_date') || '0'),
                  query_id: params.get('query_id') || undefined,
                  hash: params.get('hash') || undefined,
                  start_param: params.get('start_param') || undefined,
                  chat_type: params.get('chat_type') || undefined,
                  chat_instance: params.get('chat_instance') || undefined
                };
                
                // Создаем launchParams вручную для совместимости
                finalLaunchParams = {
                  tgWebAppData: processedInitData,
                  tgWebAppVersion: webApp.version || '8.0',
                  tgWebAppPlatform: webApp.platform || 'unknown',
                  tgWebAppStartParam: params.get('start_param') || '',
                  tgWebAppBotInline: false,
                  tgWebAppThemeParams: webApp.themeParams || {}
                } as TelegramLaunchParamsV3;
                
                finalRawInitData = directInitData;
                isTelegramEnvironment = true;
                
                console.log('✅ User извлечен напрямую из WebApp');
              }
            }
          } catch (directError) {
            console.warn('⚠️ Ошибка прямого извлечения из WebApp:', directError);
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

        // ✅ ИСПРАВЛЕНИЕ: Правильно типизированные theme params
        const themeParams: TelegramThemeParams = {
          accent_text_color: '#6ab2f2',
          bg_color: '#17212b',
          button_color: '#5288c1',
          button_text_color: '#ffffff',
          destructive_text_color: '#ec3942',
          header_bg_color: '#17212b',
          hint_color: '#708499',
          link_color: '#6ab3f3',
          secondary_bg_color: '#232e3c',
          section_bg_color: '#17212b',
          section_header_text_color: '#6ab3f3',
          subtitle_text_color: '#708499',
          text_color: '#f5f5f5',
        };

        // ✅ ИСПРАВЛЕНИЕ: Правильная структура для mockTelegramEnv согласно документации v3.x
        if (process.env.NODE_ENV === 'development') {
          try {
            const mockRawInitData = new URLSearchParams([
              ['user', JSON.stringify(mockUser)],
              ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
              ['auth_date', Math.floor(Date.now() / 1000).toString()],
              ['start_param', 'debug'],
              ['chat_type', 'sender'],
              ['chat_instance', '8428209589180549439'],
            ]).toString();

            // ✅ Правильная структура согласно официальной документации SDK v3.x
            mockTelegramEnv({
              launchParams: {
                tgWebAppThemeParams: themeParams,
                tgWebAppData: mockRawInitData,
                tgWebAppVersion: '8.0',
                tgWebAppPlatform: 'tdesktop',
                tgWebAppStartParam: 'debug'
              }
            });
            console.log('✅ Mock environment успешно настроен');
          } catch (mockError) {
            console.warn('⚠️ Ошибка настройки mock environment:', mockError);
          }
        }

        user = mockUser;
        processedInitData = {
          user: mockUser,
          auth_date: Math.floor(Date.now() / 1000),
          hash: '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31',
          start_param: 'debug',
          chat_type: 'sender',
          chat_instance: '8428209589180549439',
          isMock: true,
          isDevFallback: !isLikelyTelegram
        } satisfies TelegramInitDataV3; // ✅ ИСПРАВЛЕНИЕ: используем satisfies для безопасной типизации
        
        finalLaunchParams = {
          tgWebAppData: processedInitData,
          tgWebAppVersion: '8.0',
          tgWebAppPlatform: 'tdesktop',
          tgWebAppStartParam: 'debug',
          tgWebAppBotInline: false,
          tgWebAppThemeParams: themeParams
        } as TelegramLaunchParamsV3;
        
        // Создаем rawInitData для совместимости
        if (!finalRawInitData) {
          finalRawInitData = new URLSearchParams([
            ['user', JSON.stringify(mockUser)],
            ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
            ['auth_date', Math.floor(Date.now() / 1000).toString()],
            ['start_param', 'debug'],
            ['chat_type', 'sender'],
            ['chat_instance', '8428209589180549439'],
          ]).toString();
        }
        
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
        launchParams: finalLaunchParams,
        rawInitData: finalRawInitData
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
            hash: 'mock_hash_for_error_fallback',
            isMock: true,
            isLaunchParamsError: true
          } satisfies TelegramInitDataV3, // ✅ ИСПРАВЛЕНИЕ: безопасная типизация
          launchParams: null,
          rawInitData: null
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
  }, [launchParams, rawInitData]); // Добавляем оба в зависимости

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
        
        // ✅ ИСПРАВЛЕНИЕ: Простая инициализация SDK v3.x
        try {
          // В SDK v3.x init() не принимает параметров или принимает минимальную конфигурацию
          await init();
          console.log('✅ Базовый SDK v3.x инициализирован');
        } catch (initSDKError) {
          console.warn('⚠️ init() выдал ошибку (это нормально вне Telegram):', initSDKError);
          // В режиме разработки или вне Telegram это ожидаемое поведение
          // SDK все равно может частично функционировать
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
  
  const isMock = (initData as any)?.isMock;
  const isDevFallback = (initData as any)?.isDevFallback;
  const isLaunchParamsError = (initData as any)?.isLaunchParamsError;
  
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
  const { user, isAuthenticated, error, isReady, initData, launchParams, rawInitData } = useTelegram();
  
  return {
    user,
    isAuthenticated,
    error,
    isLoading: !isReady,
    initData: initData,
    webAppData: initData,
    launchParams: launchParams,
    rawInitData: rawInitData
  };
}
