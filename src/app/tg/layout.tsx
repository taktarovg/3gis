// src/app/tg/layout.tsx
'use client';

import { TelegramProvider } from '@/components/providers/TelegramProvider';
import { TelegramStatus } from '@/components/providers/TelegramProvider';
import { NavigationLayout } from '@/components/navigation/BottomNavigation';
import { useTelegram } from '@/components/providers/TelegramProvider';
import { useEffect } from 'react';

// Компонент для обертки контента
function TelegramContent({ children }: { children: React.ReactNode }) {
  const { isReady, error } = useTelegram();
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ошибка инициализации</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }
  
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка приложения...</p>
        </div>
      </div>
    );
  }
  
  return (
    <NavigationLayout>
      {children}
    </NavigationLayout>
  );
}

/**
 * Layout для Telegram Mini App с правильной SDK v3.x инициализацией
 * ✅ TelegramProvider для SDK v3.x
 * ✅ Авторизация и навигация
 * ✅ Использует актуальные хуки @telegram-apps/sdk-react v3.3.1
 */
export default function TelegramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Инициализируем auth store при монтировании
  useEffect(() => {
    initAuthStore();
  }, []);

  // Предотвращаем сворачивание приложения при скролле
  usePreventCollapse();

  return (
    <TelegramProvider>
      <TelegramContent>
        {children}
      </TelegramContent>
      
      {/* Debug информация только в development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 left-4 z-50">
          <TelegramStatus />
        </div>
      )}
    </TelegramProvider>
  );
}
