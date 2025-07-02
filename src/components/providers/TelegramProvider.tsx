'use client';

import { SDKProvider } from '@telegram-apps/sdk-react';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useTelegramAuth, useTelegramEnvironment } from '@/hooks/useTelegramAuth';

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
  const { isTelegramEnvironment, isDevelopment } = useTelegramEnvironment();
  
  useEffect(() => {
    // Инициализация для Next.js 15.3.3
    if (typeof window !== 'undefined') {
      // Настройка для Development mode
      if (isDevelopment && !isTelegramEnvironment) {
        // Mock Telegram environment для локальной разработки
        const mockTelegram = {
          WebApp: {
            ready: () => {},
            expand: () => {},
            MainButton: {
              show: () => {},
              hide: () => {},
              setText: () => {},
              onClick: () => {},
              offClick: () => {}
            },
            BackButton: {
              show: () => {},
              hide: () => {},
              onClick: () => {},
              offClick: () => {}
            },
            HapticFeedback: {
              impactOccurred: () => {},
              notificationOccurred: () => {},
              selectionChanged: () => {}
            },
            initData: 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22%D0%A2%D0%B5%D1%81%D1%82%22%2C%22last_name%22%3A%22%D0%9F%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D0%B5%D0%BB%D1%8C%22%2C%22username%22%3A%22test_user%22%2C%22language_code%22%3A%22ru%22%7D&auth_date=1703001600&hash=test_hash'
          }
        };
        
        (window as any).Telegram = mockTelegram;
      }
      
      setIsReady(true);
    }
  }, [isDevelopment, isTelegramEnvironment]);
  
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Инициализация приложения...</p>
        </div>
      </div>
    );
  }
  
  return (
    <SDKProvider acceptCustomStyles debug={isDevelopment}>
      <TelegramContextProvider>
        {children}
      </TelegramContextProvider>
    </SDKProvider>
  );
}

function TelegramContextProvider({ children }: PropsWithChildren) {
  const { user, isInitialized, error, isAuthenticated } = useTelegramAuth();
  const { isTelegramEnvironment } = useTelegramEnvironment();
  
  const contextValue: TelegramContextValue = {
    isReady: isInitialized,
    user,
    isAuthenticated,
    isTelegramEnvironment,
    error
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

// Компонент для отображения состояния Telegram
export function TelegramStatus() {
  const { isReady, user, isTelegramEnvironment, error } = useTelegram();
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong className="font-bold">Ошибка Telegram:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }
  
  if (!isReady) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Инициализация Telegram...
      </div>
    );
  }
  
  return (
    <div className={`px-4 py-3 rounded ${isTelegramEnvironment ? 'bg-green-100 border-green-400 text-green-700' : 'bg-blue-100 border-blue-400 text-blue-700'}`}>
      <strong className="font-bold">
        {isTelegramEnvironment ? '✅ Telegram Mini App' : '🖥️ Web Browser'}
      </strong>
      {user && (
        <span className="block sm:inline">
          {' '}- Пользователь: {user.first_name} {user.last_name}
        </span>
      )}
    </div>
  );
}
