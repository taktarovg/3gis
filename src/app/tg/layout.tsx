// src/app/tg/layout.tsx
'use client';

import { TelegramProvider } from '@/components/telegram/TelegramProvider';
import { TelegramAuth } from '@/components/auth/TelegramAuth';
import { NavigationLayout } from '@/components/navigation/BottomNavigation';
import { initAuthStore } from '@/store/auth-store';
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

  return (
    <TelegramProvider debug={process.env.NODE_ENV === 'development'}>
      <TelegramAuth>
        <NavigationLayout>
          {children}
        </NavigationLayout>
      </TelegramAuth>
    </TelegramProvider>
  );
}
