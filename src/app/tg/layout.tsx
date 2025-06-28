// src/app/tg/layout.tsx
'use client';

import { TelegramProvider } from '@/components/telegram/TelegramProvider';
import { TelegramAuth } from '@/components/auth/TelegramAuth';
import { NavigationLayout } from '@/components/navigation/BottomNavigation';
import { TelegramDebug } from '@/components/debug/TelegramDebug';
import { initAuthStore } from '@/store/auth-store';
import { usePreventCollapse } from '@/hooks/use-prevent-collapse';
import { useEffect } from 'react';

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
    <>
      {/* Используем только ClientProvider с SDK v3 для избежания конфликтов */}
      <TelegramAuth>
        <NavigationLayout>
          {children}
        </NavigationLayout>
        {/* Отладочный компонент для разработки */}
        <TelegramDebug />
      </TelegramAuth>
    </>
  );
}
