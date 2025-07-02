// src/components/auth/TelegramAuth.tsx
'use client';

import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { MobileAuthHandler } from '@/components/auth/MobileAuthHandler';

// Re-export components for convenience
export { UserInfo, useAuthGuard } from '@/components/auth/UserInfo';

interface TelegramAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Компонент-обертка для авторизации через Telegram в 3GIS
 * Использует улучшенный MobileAuthHandler для обработки ошибок на мобильных устройствах
 * Совместим с @telegram-apps/sdk-react v3.3.1
 */
export function TelegramAuth({ children, fallback }: TelegramAuthProps) {
  const { user, isLoading, error, isAuthenticated } = useTelegramAuth();
  
  // Используем улучшенный обработчик для мобильных устройств
  return (
    <MobileAuthHandler
      isLoading={isLoading}
      error={error}
      isAuthenticated={isAuthenticated}
    >
      {children}
    </MobileAuthHandler>
  );
}
