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

  useEffect(() => {
    const initializeTelegramSDK = async () => {
      try {
        console.log('🚀 Инициализация Telegram SDK v3.x...');
        
        // ✅ ИСПРАВЛЕНО: Используем правильную структуру SDK v3.x из документации
        // Документация: https://docs.telegram-mini-apps.com/platform/init-data
        const { retrieveLaunchParams } = await import('@telegram-apps/sdk');
        
        // ✅ Получаем launch параметры согласно SDK v3.x документации
        const launchParams = retrieveLaunchParams();
        console.log('✅ Launch params retrieved (SDK v3.x):', launchParams);
        
        // ✅ ИСПРАВЛЕНО: В SDK v3.x правильная структура: { initDataRaw, initData }
        // НЕ tgWebAppData - это только в React hooks!
        let user = null;
        let initDataRaw = null;
        let parsedInitData = null;

        // Правильная структура согласно документации SDK v3.x
        if (launchParams.initData && launchParams.initData.user) {
          user = launchParams.initData.user;
          initDataRaw = launchParams.initDataRaw;
          parsedInitData = launchParams.initData;
          
          console.log('✅ Extracted user data (initData):', { 
            hasUser: !!user, 
            userId: user?.id,
            userName: user?.first_name || user?.firstName,
            structure: 'initData'
          });
        }
        // Fallback для development или других структур
        else if (launchParams.initDataRaw) {
          initDataRaw = launchParams.initDataRaw;
          console.log('⚠️ Only raw initData available, no parsed user');
        }
        else {
          console.log('⚠️ No Telegram initData found - возможно не в Telegram среде');
        }
        
        setState({
          isReady: true,
          user: user || null,
          isAuthenticated: !!user,
          isTelegramEnvironment: true,
          error: null,
          initData: {
            raw: initDataRaw,
            parsed: parsedInitData
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
        console.error('❌ Ошибка инициализации Telegram SDK:', error);
        
        // ✅ В development режиме предоставляем fallback
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Development mode: Используем mock данные');
          
          setState({
            isReady: true,
            user: {
              id: 123456789,
              first_name: 'Test',
              last_name: 'User',
              username: 'testuser'
            },
            isAuthenticated: true,
            isTelegramEnvironment: false, // Указываем что это не реальный Telegram
            error: null,
            initData: {
              raw: 'mock_init_data',
              parsed: {
                user: {
                  id: 123456789,
                  first_name: 'Test',
                  last_name: 'User',
                  username: 'testuser'
                },
                auth_date: Math.floor(Date.now() / 1000),
                hash: 'mock_hash'
              }
            }
          });
        } else {
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
      // Небольшая задержка для полной загрузки Telegram WebApp
      const timeoutId = setTimeout(initializeTelegramSDK, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, []);

  // ✅ Показываем загрузку во время инициализации
  if (!state.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Инициализация Telegram SDK...</p>
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
  const { isReady, user, isTelegramEnvironment, error } = useTelegram();
  
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
  
  return (
    <div className={`fixed bottom-4 left-4 px-3 py-2 rounded text-sm max-w-xs z-50 border ${
      isTelegramEnvironment 
        ? 'bg-green-100 border-green-400 text-green-700' 
        : 'bg-blue-100 border-blue-400 text-blue-700'
    }`}>
      <strong className="font-bold">
        {isTelegramEnvironment ? '✅ Telegram SDK' : '🖥️ Browser Mode'}
      </strong>
      {user && (
        <span className="block text-xs mt-1">
          {user.first_name || user.firstName} {user.last_name || user.lastName}
          {(user.username) && ` (@${user.username})`}
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
    initData: initData?.raw,
    webAppData: initData?.parsed
  };
}