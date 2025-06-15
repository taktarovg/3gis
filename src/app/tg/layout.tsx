// src/app/tg/layout.tsx
'use client';

import { TelegramAuth } from '@/components/auth/TelegramAuth';
import { NavigationLayout } from '@/components/navigation/BottomNavigation';
import { initAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';

/**
 * Layout для Telegram Mini App с авторизацией и навигацией
 * Использует актуальные хуки @telegram-apps/sdk-react v3.3.1
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
    <TelegramAuth>
      <NavigationLayout>
        {children}
      </NavigationLayout>
    </TelegramAuth>
  );
}
