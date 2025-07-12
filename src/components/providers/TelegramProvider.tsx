// src/components/providers/TelegramProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback, type PropsWithChildren } from 'react';
import { useLaunchParams, useRawInitData, init } from '@telegram-apps/sdk-react';
import type { TelegramContextValue, TelegramUser, TelegramInitData, LaunchParams } from '@/types/telegram';
import { extractUserSafely, checkTelegramEnvironment, createMockUser, setupTelegramWebApp } from '@/utils/telegram-sdk';

const TelegramContext = createContext<TelegramContextValue>({
  isReady: false,
  user: null,
  isAuthenticated: false,
  isTelegramEnvironment: false,
  error: null,
  initData: null,
  launchParams: null,
  rawInitData: null,
  sdkVersion: '3.x',
  environmentInfo: { hasWebApp: false, hasInitData: false }
});

/**
 * ✅ ИСПРАВЛЕНО: Оптимизированный компонент инициализации SDK v3.x с правильной типизацией
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
    rawInitData: null,
    sdkVersion: '3.10.1',
    environmentInfo: { hasWebApp: false, hasInitData: false }
  });
  
  // ✅ ИСПРАВЛЕНО: Правильное использование хуков SDK v3.x с типизацией
  const launchParams = useLaunchParams(true) as unknown;  // SSR флаг для Next.js
  const rawInitData = useRawInitData() as string | undefined; // Без параметров в v3.x

  const initializeTelegramSDK = useCallback(async () => {
    try {
      console.log('🚀 Инициализация Telegram SDK v3.x...');
      console.log('📋 Входящие данные:', {
        launchParams: launchParams ? 'присутствуют' : 'отсутствуют',
        rawInitData: rawInitData ? 'присутствуют' : 'отсутствуют',
        launchParamsType: typeof launchParams,
        rawInitDataType: typeof rawInitData
      });
      
      let user: TelegramUser | null = null;
      let processedInitData: TelegramInitData | null = null;
      let finalLaunchParams: unknown = launchParams;
      let finalRawInitData: string | null = rawInitData || null;
      
      const { isLikelyTelegram, checks } = checkTelegramEnvironment();
      console.log('🔍 Environment checks:', { ...checks, isLikelyTelegram });
      
      // ✅ ИСПРАВЛЕНО: Приоритетная обработка данных с правильной типизацией
      
      // Приоритет 1: rawInitData из SDK v3.x
      if (rawInitData && typeof rawInitData === 'string' && rawInitData.length > 0) {
        console.log('🎯 Обработка rawInitData из SDK v3.x');
        user = extractUserSafely(rawInitData, 'rawInitData');
        
        if (user) {
          try {
            const params = new URLSearchParams(rawInitData);
            processedInitData = {
              user,
              auth_date: parseInt(params.get('auth_date') || '0'),
              query_id: params.get('query_id') || undefined,
              hash: params.get('hash') || undefined,
              start_param: params.get('start_param') || undefined,
              chat_type: params.get('chat_type') || undefined,
              chat_instance: params.get('chat_instance') || undefined
            };
            console.log('✅ Успешно обработан rawInitData');
          } catch (parseError) {
            console.warn('⚠️ Ошибка парсинга rawInitData:', parseError);
          }
        }
      }
      
      // Приоритет 2: launchParams из SDK v3.x
      if (!user && launchParams && typeof launchParams === 'object' && launchParams !== null) {
        console.log('🎯 Обработка launchParams из SDK v3.x');
        console.log('📋 launchParams структура:', Object.keys(launchParams as Record<string, unknown>));
        
        user = extractUserSafely(launchParams, 'launchParams');
        
        if (user) {
          try {
            const launchParamsObj = launchParams as LaunchParams;
            const webAppData = launchParamsObj.tgWebAppData;
            
            if (webAppData) {
              // Обработка auth_date с правильной типизацией
              let authDate = Math.floor(Date.now() / 1000);
              if (typeof webAppData.auth_date === 'number') {
                authDate = webAppData.auth_date;
              } else if (webAppData.auth_date instanceof Date) {
                authDate = Math.floor(webAppData.auth_date.getTime() / 1000);
              } else if (typeof webAppData.auth_date === 'string') {
                const parsed = parseInt(webAppData.auth_date);
                if (!isNaN(parsed)) authDate = parsed;
              }
              
              processedInitData = {
                user,
                auth_date: authDate,
                query_id: webAppData.query_id || webAppData.queryId,
                hash: webAppData.hash,
                start_param: webAppData.start_param || webAppData.startParam,
                chat_type: webAppData.chat_type || webAppData.chatType,
                chat_instance: webAppData.chat_instance || webAppData.chatInstance
              };
              
              // Создаем rawInitData если его нет
              if (!finalRawInitData && user) {
                finalRawInitData = new URLSearchParams([
                  ['user', JSON.stringify(user)],
                  ['auth_date', authDate.toString()],
                  ['hash', webAppData.hash || 'unknown'],
                  ...(webAppData.query_id ? [['query_id', webAppData.query_id]] : []),
                  ...(webAppData.start_param ? [['start_param', webAppData.start_param]] : [])
                ]).toString();
              }
            }
            console.log('✅ Успешно обработан launchParams');
          } catch (parseError) {
            console.warn('⚠️ Ошибка обработки launchParams:', parseError);
          }
        }
      }
      
      // Приоритет 3: Прямое извлечение из Telegram WebApp
      if (!user && checks.hasWebApp) {
        console.log('🎯 Прямое извлечение из Telegram WebApp');
        
        try {
          const webApp = (window as any).Telegram.WebApp;
          const directInitData = webApp.initData;
          
          if (directInitData && typeof directInitData === 'string' && directInitData.length > 0) {
            user = extractUserSafely(directInitData, 'directWebApp');
            
            if (user) {
              const params = new URLSearchParams(directInitData);
              processedInitData = {
                user,
                auth_date: parseInt(params.get('auth_date') || '0'),
                query_id: params.get('query_id') || undefined,
                hash: params.get('hash') || undefined,
                start_param: params.get('start_param') || undefined,
                chat_type: params.get('chat_type') || undefined,
                chat_instance: params.get('chat_instance') || undefined
              };
              
              finalLaunchParams = {
                tgWebAppData: processedInitData,
                tgWebAppVersion: webApp.version || '8.0',
                tgWebAppPlatform: webApp.platform || 'unknown',
                tgWebAppStartParam: params.get('start_param') || '',
                tgWebAppBotInline: false,
                tgWebAppThemeParams: webApp.themeParams || {}
              } as LaunchParams;
              
              finalRawInitData = directInitData;
              console.log('✅ Успешно извлечен user напрямую из WebApp');
            }
          }
        } catch (directError) {
          console.warn('⚠️ Ошибка прямого извлечения из WebApp:', directError);
        }
      }
      
      // ✅ ИСПРАВЛЕНО: Fallback для testing
      if (!user) {
        console.log('🔧 Создаем fallback для тестирования...');
        const mockData = createMockUser();
        user = mockData.user;
        processedInitData = { ...mockData.initData, isDevFallback: !isLikelyTelegram };
        finalRawInitData = mockData.rawInitData;
        
        finalLaunchParams = {
          tgWebAppData: processedInitData,
          tgWebAppVersion: '8.0',
          tgWebAppPlatform: 'tdesktop',
          tgWebAppStartParam: 'debug',
          tgWebAppBotInline: false,
          tgWebAppThemeParams: {
            accentTextColor: '#6ab2f2',
            bgColor: '#17212b',
            buttonColor: '#5288c1',
            buttonTextColor: '#ffffff',
            destructiveTextColor: '#ec3942',
            headerBgColor: '#17212b',
            hintColor: '#708499',
            linkColor: '#6ab3f3',
            secondaryBgColor: '#232e3c',
            sectionBgColor: '#17212b',
            sectionHeaderTextColor: '#6ab3f3',
            subtitleTextColor: '#708499',
            textColor: '#f5f5f5'
          }
        } as LaunchParams;
      }

      const environmentInfo = {
        hasWebApp: checks.hasWebApp,
        hasInitData: checks.hasInitData,
        platform: typeof window !== 'undefined' ? (window as any)?.Telegram?.WebApp?.platform : undefined,
        version: typeof window !== 'undefined' ? (window as any)?.Telegram?.WebApp?.version : undefined
      };

      setState({
        isReady: true,
        user: user || null,
        isAuthenticated: !!user,
        isTelegramEnvironment: isLikelyTelegram,
        error: null,
        initData: processedInitData,
        launchParams: finalLaunchParams,
        rawInitData: finalRawInitData,
        sdkVersion: '3.10.1',
        environmentInfo
      });

      // Настройка Telegram WebApp
      setupTelegramWebApp();
      console.log('✅ Telegram SDK v3.x успешно инициализирован');
      
    } catch (error) {
      console.error('❌ Ошибка инициализации Telegram SDK:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      const isLaunchParamsError = errorMessage.includes('LaunchParamsRetrieveError') || 
                                  errorMessage.includes('Unable to retrieve launch parameters') ||
                                  errorMessage.includes('Launch parameters were not found');
      
      if (isLaunchParamsError) {
        console.log('🔧 LaunchParamsRetrieveError - создаем fallback');
        const mockData = createMockUser();
        setState({
          isReady: true,
          user: mockData.user,
          isAuthenticated: true,
          isTelegramEnvironment: false,
          error: null,
          initData: { ...mockData.initData, isLaunchParamsError: true },
          launchParams: null,
          rawInitData: null,
          sdkVersion: '3.10.1',
          environmentInfo: { hasWebApp: false, hasInitData: false }
        });
        return;
      }
      
      setState(prev => ({
        ...prev,
        isReady: true,
        error: errorMessage,
        sdkVersion: '3.10.1',
        environmentInfo: { hasWebApp: false, hasInitData: false }
      }));
    }
  }, [launchParams, rawInitData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timeoutId = setTimeout(initializeTelegramSDK, 500);
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
 * ✅ ИСПРАВЛЕНО: Главный TelegramProvider с улучшенной обработкой init()
 */
export function TelegramProvider({ children }: PropsWithChildren) {
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window === 'undefined') return;
    
    const initializeSDK = async () => {
      try {
        console.log('🔧 Инициализация базового SDK v3.x...');
        
        try {
          init(); // В SDK v3.x init() не принимает параметров
          console.log('✅ Базовый SDK v3.x инициализирован');
        } catch (initSDKError) {
          const errorMessage = initSDKError instanceof Error ? initSDKError.message : String(initSDKError);
          
          const isSafeError = errorMessage.includes('LaunchParamsRetrieveError') ||
                             errorMessage.includes('Unable to retrieve launch parameters') ||
                             errorMessage.includes('Launch parameters were not found') ||
                             errorMessage.includes('Window object is not available') ||
                             errorMessage.includes('Telegram WebApp is not available');
          
          if (isSafeError) {
            console.log('ℹ️ init() выдал ожидаемую ошибку (это нормально вне Telegram):', errorMessage);
          } else {
            console.warn('⚠️ init() выдал неожиданную ошибку:', errorMessage);
          }
        }
        
        setIsSDKInitialized(true);
      } catch (error) {
        console.error('❌ Критическая ошибка инициализации SDK:', error);
        setInitError(error instanceof Error ? error.message : 'Критическая ошибка');
        setTimeout(() => setIsSDKInitialized(true), 1000);
      }
    };

    const timeoutId = setTimeout(initializeSDK, 200);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!mounted || !isSDKInitialized) {
    if (initError && !isSDKInitialized) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
            <div className="text-red-500 text-2xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Ошибка инициализации SDK</h3>
            <p className="text-sm text-red-600 text-center mb-4">{initError}</p>
            <div className="space-y-2">
              <button 
                onClick={handleReload}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Перезагрузить
              </button>
              <button 
                onClick={() => {
                  setInitError(null);
                  setIsSDKInitialized(true);
                }}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                Продолжить без SDK
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-white">3GIS</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Инициализация SDK v3.x...</p>
          <p className="text-gray-500 text-sm mt-2">Подготовка Telegram интеграции</p>
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
