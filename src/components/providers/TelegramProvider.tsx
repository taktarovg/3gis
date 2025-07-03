// src/components/providers/TelegramProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { EnvironmentDetector } from '@/components/environment/EnvironmentDetector';

// ✅ Правильные импорты согласно актуальной документации SDK v3.x
// https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk-react/3-x

interface TelegramContextValue {
  isReady: boolean;
  user: any;
  isAuthenticated: boolean;
  isTelegramEnvironment: boolean;
  error: string | null;
  initData: any;
}

// ✅ Исправленная типизация для SDK v3.x согласно документации
interface LaunchParamsV3 {
  tgWebAppData?: {
    user?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      photo_url?: string;
    };
    auth_date?: number;
    query_id?: string;
    hash?: string;
    start_param?: string;
    chat_type?: string;
    chat_instance?: string;
  };
  tgWebAppThemeParams?: any;
  tgWebAppVersion?: string;
  tgWebAppPlatform?: string;
  tgWebAppBotInline?: boolean;
  [key: string]: any;
}

const TelegramContext = createContext<TelegramContextValue>({
  isReady: false,
  user: null,
  isAuthenticated: false,
  isTelegramEnvironment: false,
  error: null,
  initData: null
});

/**
 * ✅ Безопасная инициализация Telegram SDK v3.x с детекцией среды
 * Основано на актуальной документации @telegram-apps/sdk v3.10.1
 * Совместимо с Next.js 15.3.3 и правилами React Hooks
 */
export function TelegramProvider({ children }: PropsWithChildren) {
  return (
    <EnvironmentDetector>
      <TelegramProviderInner>
        {children}
      </TelegramProviderInner>
    </EnvironmentDetector>
  );
}

function TelegramProviderInner({ children }: PropsWithChildren) {
  const [state, setState] = useState<TelegramContextValue>({
    isReady: false,
    user: null,
    isAuthenticated: false,
    isTelegramEnvironment: false,
    error: null,
    initData: null
  });

  // ✅ Счетчик попыток инициализации для надежности
  const [initAttempts, setInitAttempts] = useState(0);
  const maxAttempts = 3;

  useEffect(() => {
    const initializeTelegramSDK = async () => {
      try {
        console.log(`🚀 Попытка инициализации ${initAttempts + 1}/${maxAttempts} Telegram SDK v3.x...`);
        
        // ✅ ИСПРАВЛЕНО: Правильная структура SDK v3.x из документации
        // Документация: https://docs.telegram-mini-apps.com/platform/init-data
        const { retrieveLaunchParams } = await import('@telegram-apps/sdk');
        
        // ✅ Получаем launch параметры согласно SDK v3.x документации
        const launchParams = retrieveLaunchParams() as LaunchParamsV3;
        console.log('✅ Launch params retrieved (SDK v3.x):', launchParams);
        
        // ✅ ИСПРАВЛЕНО: Правильная структура согласно документации SDK v3.x
        let user = null;
        let parsedInitData = null;
        
        // Проверяем наличие tgWebAppData (новая структура v3.x)
        if (launchParams && launchParams.tgWebAppData) {
          const webAppData = launchParams.tgWebAppData;
          
          if (webAppData.user) {
            user = webAppData.user;
            parsedInitData = webAppData;
            
            console.log('✅ Extracted user data (tgWebAppData):', { 
              hasUser: !!user, 
              userId: user?.id,
              userName: user?.first_name,
              structure: 'tgWebAppData (v3.x)'
            });
          } else {
            console.log('⚠️ tgWebAppData found but no user data');
          }
        } else {
          console.log('⚠️ No tgWebAppData found - возможно не в Telegram среде');
          
          // Если это не production и мы в development, создаем mock данные
          if (process.env.NODE_ENV === 'development') {
            throw new Error('No Telegram data - switching to mock mode');
          }
        }
        
        setState({
          isReady: true,
          user: user || null,
          isAuthenticated: !!user,
          isTelegramEnvironment: true,
          error: null,
          initData: {
            parsed: parsedInitData,
            launchParams: launchParams
          }
        });

        // ✅ Дополнительная настройка WebApp согласно документации
        const tg = (window as any)?.Telegram?.WebApp;
        if (tg) {
          console.log('🎯 Настройка Telegram WebApp...');
          
          // Базовая инициализация
          tg.ready();
          tg.expand();
          
          // ✅ Безопасная настройка дополнительных функций
          const safeFeatures = [
            { name: 'disableVerticalSwipes', call: () => tg.disableVerticalSwipes() },
            { name: 'setHeaderColor', call: () => tg.setHeaderColor('#ffffff') },
            { name: 'requestFullscreen', call: () => tg.requestFullscreen && tg.requestFullscreen() },
            { name: 'setBottomBarColor', call: () => tg.setBottomBarColor && tg.setBottomBarColor('#ffffff') }
          ];

          safeFeatures.forEach(({ name, call }) => {
            try {
              call();
              console.log(`✅ ${name} настроено`);
            } catch (err) {
              console.warn(`⚠️ ${name} недоступно:`, err);
            }
          });
        }

        console.log('✅ Telegram SDK v3.x успешно инициализирован');
        
      } catch (error) {
        console.error(`❌ Попытка инициализации ${initAttempts + 1}/${maxAttempts} не удалась:`, error);
        
        // ✅ В development режиме используем mock данные
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Development mode: Переключение на mock данные');
          
          // ✅ ИСПРАВЛЕНО: Используем правильную структуру для SDK v3.x согласно документации
          const { mockTelegramEnv, parseInitData } = await import('@telegram-apps/sdk');
          
          // Создаем mock initData согласно документации
          const initDataRaw = new URLSearchParams([
            ['user', JSON.stringify({
              id: Math.floor(Math.random() * 1000000000),
              first_name: 'Test',
              last_name: 'User',
              username: 'testuser',
              language_code: 'ru',
              is_premium: false,
            })],
            ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
            ['auth_date', Math.floor(Date.now() / 1000).toString()],
            ['start_param', 'debug'],
            ['chat_type', 'sender'],
            ['chat_instance', '8428209589180549439'],
          ]).toString();
          
          // ✅ Правильная структура mockTelegramEnv для SDK v3.x
          mockTelegramEnv({
            themeParams: {
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
              textColor: '#f5f5f5',
            },
            initData: parseInitData(initDataRaw),
            initDataRaw,
            version: '8.0',
            platform: 'tdesktop',
          });
          
          // Повторяем инициализацию с mock данными
          const { retrieveLaunchParams } = await import('@telegram-apps/sdk');
          const launchParams = retrieveLaunchParams() as LaunchParamsV3;
          
          setState({
            isReady: true,
            user: launchParams.tgWebAppData?.user || null,
            isAuthenticated: true,
            isTelegramEnvironment: false, // Указываем что это mock
            error: null,
            initData: {
              parsed: launchParams.tgWebAppData,
              launchParams: launchParams,
              isMock: true
            }
          });
          
          console.log('✅ Mock environment установлен');
        } else {
          // В production пытаемся повторить инициализацию
          if (initAttempts < maxAttempts - 1) {
            setInitAttempts(prev => prev + 1);
            return; // Будет retry через useEffect
          }
          
          setState(prev => ({
            ...prev,
            isReady: true,
            error: 'Не удалось инициализировать Telegram SDK. Убедитесь, что приложение открыто через Telegram.'
          }));
        }
      }
    };

    // ✅ Инициализируем только на клиенте
    if (typeof window !== 'undefined') {
      // Увеличивающаяся задержка для retry
      const delay = initAttempts * 1000 + 500;
      const timeoutId = setTimeout(initializeTelegramSDK, delay);
      
      return () => clearTimeout(timeoutId);
    }
  }, [initAttempts]);

  // ✅ Показываем загрузку во время инициализации
  if (!state.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Инициализация Telegram SDK...
            {initAttempts > 0 && (
              <span className="block text-sm text-gray-500 mt-1">
                Попытка {initAttempts + 1} из {maxAttempts}
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <TelegramContext.Provider value={state}>
      {children}
    </TelegramContext.Provider>
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
 * Показывается только в development режиме
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
  
  return (
    <div className={`fixed bottom-4 left-4 px-3 py-2 rounded text-sm max-w-xs z-50 border ${
      isTelegramEnvironment 
        ? 'bg-green-100 border-green-400 text-green-700' 
        : isMock
        ? 'bg-blue-100 border-blue-400 text-blue-700'
        : 'bg-yellow-100 border-yellow-400 text-yellow-700'
    }`}>
      <strong className="font-bold">
        {isTelegramEnvironment ? '✅ Telegram SDK v3.x' : 
         isMock ? '🔧 Mock Mode (v3.x)' : '🖥️ Browser Mode'}
      </strong>
      {user && (
        <span className="block text-xs mt-1">
          {user.first_name || user.firstName} {user.last_name || user.lastName}
          {(user.username) && ` (@${user.username})`}
        </span>
      )}
      {isMock && (
        <span className="block text-xs mt-1 text-blue-600">
          Development mock data
        </span>
      )}
    </div>
  );
}

/**
 * ✅ Хук для обратной совместимости с существующим кодом
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
 * ✅ Хук для обратной совместимости с существующим кодом авторизации
 */
export function useTelegramAuth() {
  const { user, isAuthenticated, error, isReady, initData } = useTelegram();
  
  return {
    user,
    isAuthenticated,
    error,
    isLoading: !isReady,
    initData: initData?.parsed,
    webAppData: initData?.parsed,
    launchParams: initData?.launchParams
  };
}