// src/app/tg/layout.tsx
'use client';

import { TelegramProvider } from '@/components/providers/TelegramProvider';
import { TelegramStatus } from '@/components/providers/TelegramProvider';
import { NavigationLayout } from '@/components/navigation/BottomNavigation';
import { useTelegram } from '@/components/providers/TelegramProvider';
import { useEffect } from 'react';

// ✅ Компонент для обертки контента с проверками
function TelegramContent({ children }: { children: React.ReactNode }) {
  const { isReady, error } = useTelegram();
  
  // ✅ Простая инициализация дополнительных функций
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg && isReady) {
        // Дополнительные настройки после инициализации
        try {
          // Устанавливаем цвет заголовка
          if (tg.setHeaderColor) {
            tg.setHeaderColor('#ffffff');
          }
          
          // Включаем полноэкранный режим
          if (tg.requestFullscreen) {
            tg.requestFullscreen();
          }
          
          console.log('🎯 Additional Telegram WebApp features configured');
        } catch (err) {
          console.warn('⚠️ Some Telegram features not available:', err);
        }
      }
    }
  }, [isReady]);
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ошибка инициализации</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
 * ✅ Layout для Telegram Mini App с правильной SDK v3.x инициализацией
 * - Убраны все проблемные импорты (initAuthStore, usePreventCollapse)
 * - Использует только рабочие компоненты SDK v3.x
 * - Совместим с Next.js 15.3.3 Server/Client Components
 */
export default function TelegramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TelegramProvider>
      <TelegramContent>
        {children}
      </TelegramContent>
      
      {/* ✅ Debug информация только в development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 left-4 z-50 max-w-xs">
          <TelegramStatus />
        </div>
      )}
    </TelegramProvider>
  );
}
