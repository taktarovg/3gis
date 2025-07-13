// src/app/tg/layout.tsx - ИСПРАВЛЕННЫЙ Layout для Telegram Mini App
'use client';

import { TelegramProvider, TelegramStatus } from '@/components/providers/TelegramProvider';
import { NavigationLayout } from '@/components/navigation/BottomNavigation';
import { type ReactNode } from 'react';

/**
 * ✅ ИСПРАВЛЕНО: Упрощенный Layout для Telegram Mini App БЕЗ циклических зависимостей
 * 
 * ИСПРАВЛЕНИЯ:
 * - Убрали TelegramContent который использовал useTelegram внутри провайдера (ЦИКЛИЧЕСКАЯ ЗАВИСИМОСТЬ)
 * - Убрали TelegramRedirectHandler который может вызывать конфликты Server/Client
 * - Простая структура: TelegramProvider > NavigationLayout > children
 * - TelegramProvider инициализируется только один раз
 * - Никаких сложных зависимостей и вложенных компонентов с хуками
 */
export default function TelegramLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <TelegramProvider>
      <NavigationLayout>
        {children}
      </NavigationLayout>
      
      {/* ✅ Статус отладки только в development */}
      {process.env.NODE_ENV === 'development' && <TelegramStatus />}
    </TelegramProvider>
  );
}
