'use client';

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { init, backButton, mainButton } from '@telegram-apps/sdk-react';
import { useTelegramAuth, useTelegramEnvironment } from '@/hooks/useTelegramAuth';

// ✅ SDK v3.x: Правильная инициализация с SSR совместимостью

// ✅ SDK v3.x: Правильная инициализация через init() и mount()

interface TelegramContextValue {
  isReady: boolean;
  user: any;
  isAuthenticated: boolean;
  isTelegramEnvironment: boolean;
  error: string | null;
}

const TelegramContext = createContext<TelegramContextValue>({
  isReady: false,
  user: null,
  isAuthenticated: false,
  isTelegramEnvironment: false,
  error: null
});

export function TelegramProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const { isTelegramEnvironment, isDevelopment } = useTelegramEnvironment();
  
  useEffect(() => {
    // ✅ Правильная инициализация SDK v3.x согласно документации
    if (typeof window !== 'undefined') {
      let initSuccess = false;
      
      try {
        // ✅ Шаг 1: Инициализация SDK (ОБЯЗАТЕЛЬНО)
        init();
        console.log('✅ Telegram SDK v3.x инициализирован');
        
        // ✅ Шаг 2: Монтирование нужных компонентов
        try {
          // Монтируем BackButton для навигации
          if (backButton && typeof backButton.mount === 'function') {
            backButton.mount();
            console.log('✅ BackButton смонтирован');
          }
          
          // Монтируем MainButton для основных действий
          if (mainButton && typeof mainButton.mount === 'function') {
            mainButton.mount();
            console.log('✅ MainButton смонтирован');
          }
        } catch (mountError) {
          console.warn('⚠️ Ошибка монтирования компонентов:', mountError);
        }
        
        // ✅ Шаг 3: Настройка Telegram WebApp (если доступно)
        const tg = (window as any)?.Telegram?.WebApp;
        if (tg) {
          tg.ready();
          tg.expand();
          
          // Настройки для Mini App
          if (tg.disableVerticalSwipes) {
            tg.disableVerticalSwipes();
          }
          
          if (tg.setHeaderColor) {
            tg.setHeaderColor('#ffffff');
          }
          
          console.log('✅ Telegram WebApp настроен');
        } else if (isDevelopment) {
          // Development mode: минимальный mock
          console.log('🔧 Development: Telegram WebApp не обнаружен, работаем в browser режиме');
        }
        
        initSuccess = true;
        
      } catch (error) {
        console.error('❌ Ошибка инициализации Telegram SDK:', error);
        
        // Для development режима продолжаем работу
        if (isDevelopment) {
          console.log('🔧 Development: Продолжаем работу без SDK');
          initSuccess = true;
        }
      }
      
      setSdkInitialized(initSuccess);
      setIsReady(true);
    }
  }, [isDevelopment, isTelegramEnvironment]);
  
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Инициализация Telegram SDK...</p>
        </div>
      </div>
    );
  }
  
  return (
    <TelegramContextProvider sdkInitialized={sdkInitialized}>
      {children}
    </TelegramContextProvider>
  );
}

function TelegramContextProvider({ 
  children, 
  sdkInitialized 
}: PropsWithChildren & { sdkInitialized: boolean }) {
  // ✅ Используем продвинутый хук авторизации
  const authData = useTelegramAuth();
  const { isTelegramEnvironment } = useTelegramEnvironment();
  
  // ✅ Адаптируем интерфейс для обратной совместимости
  const contextValue: TelegramContextValue = {
    isReady: !authData.isLoading && sdkInitialized, // Используем isLoading вместо isInitialized
    user: authData.user,
    isAuthenticated: authData.isAuthenticated,
    isTelegramEnvironment,
    error: authData.error
  };
  
  return (
    <TelegramContext.Provider value={contextValue}>
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

// ✅ Компонент для отображения состояния Telegram (упрощенный)
export function TelegramStatus() {
  const { isReady, user, isTelegramEnvironment, error } = useTelegram();
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
        <strong className="font-bold">Ошибка:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }
  
  if (!isReady) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm">
        Инициализация...
      </div>
    );
  }
  
  return (
    <div className={`px-3 py-2 rounded text-sm ${
      isTelegramEnvironment 
        ? 'bg-green-100 border-green-400 text-green-700' 
        : 'bg-blue-100 border-blue-400 text-blue-700'
    }`}>
      <strong className="font-bold">
        {isTelegramEnvironment ? '✅ Telegram' : '🖥️ Browser'}
      </strong>
      {user && (
        <span className="block sm:inline">
          {' '}- {user.firstName} {user.lastName}
        </span>
      )}
    </div>
  );
}
