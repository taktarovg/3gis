// src/app/tg/layout.tsx
'use client';

import { TelegramProvider, TelegramStatus } from '@/components/providers/TelegramProvider';
import { TelegramRedirectHandler } from '@/components/telegram/TelegramRedirectHandler';
import { NavigationLayout } from '@/components/navigation/BottomNavigation';
import { useTelegram } from '@/components/providers/TelegramProvider';
import { useEffect, useCallback, type ReactNode } from 'react';

/**
 * ✅ Компонент для обертки контента с проверками готовности
 * ИСПРАВЛЕН: Переписан для избежания SSR проблем
 */
function TelegramContent({ children }: { children: ReactNode }) {
  const { isReady, error, isTelegramEnvironment } = useTelegram();
  
  // ✅ ИСПРАВЛЕНИЕ: Отдельная функция для перезагрузки
  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);
  
  // ✅ Дополнительная настройка после инициализации
  useEffect(() => {
    if (isReady && isTelegramEnvironment && typeof window !== 'undefined') {
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg) {
        try {
          console.log('🎯 Применение дополнительных настроек Telegram WebApp...');
          
          // ✅ Настройки цветовой схемы
          if (typeof tg.setHeaderColor === 'function') {
            tg.setHeaderColor('#ffffff');
          }
          
          if (typeof tg.setBottomBarColor === 'function') {
            tg.setBottomBarColor('#ffffff');
          }
          
          // ✅ Включаем полноэкранный режим
          if (typeof tg.requestFullscreen === 'function') {
            tg.requestFullscreen();
          }
          
          // ✅ Отключаем вертикальные свайпы
          if (typeof tg.disableVerticalSwipes === 'function') {
            tg.disableVerticalSwipes();
          }
          
          // ✅ Закрепляем приложение (sticky mode)
          if (typeof tg.enableClosingConfirmation === 'function') {
            tg.enableClosingConfirmation();
          }
          
          console.log('✅ Дополнительные настройки Telegram WebApp применены');
        } catch (err) {
          console.warn('⚠️ Некоторые функции Telegram недоступны:', err);
        }
      }
    }
  }, [isReady, isTelegramEnvironment]);
  
  // ✅ Обработка ошибок
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Ошибка инициализации
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={handleReload} 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Перезагрузить
            </button>
            <p className="text-sm text-gray-500">
              Если проблема повторяется, откройте приложение через @ThreeGIS_bot в Telegram
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // ✅ Загрузка
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
  
  // ✅ Основной контент с навигацией
  return (
    <NavigationLayout>
      {children}
    </NavigationLayout>
  );
}

/**
 * ✅ Главный Layout для Telegram Mini App с правильной структурой провайдеров
 * 
 * ИСПРАВЛЕНИЯ:
 * - TelegramRedirectHandler обернут правильно
 * - TelegramProvider инициализируется только один раз
 * - TelegramContent получает контекст через useTelegram корректно
 * - Нет дублирования провайдеров
 */
export default function TelegramLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <TelegramRedirectHandler>
      <TelegramProvider>
        <TelegramContent>
          {children}
        </TelegramContent>
        
        {/* ✅ Статус отладки только в development */}
        {process.env.NODE_ENV === 'development' && <TelegramStatus />}
      </TelegramProvider>
    </TelegramRedirectHandler>
  );
}
