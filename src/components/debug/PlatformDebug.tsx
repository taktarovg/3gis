// src/components/debug/PlatformDebug.tsx
'use client';

import { useTelegram } from '@/components/providers/TelegramProvider';

/**
 * ✅ Компонент для отладки информации о платформе
 * Показывается только в development режиме
 */
export default function PlatformDebug() {
  // ✅ ИСПРАВЛЕНИЕ: Используем правильные свойства из TelegramContextValue
  const { user, isReady, isTelegramEnvironment, launchParams, rawInitData } = useTelegram();
  
  // Не показываем в продакшене
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  if (!isReady) {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-80 text-white text-xs p-3 rounded-lg max-w-xs z-50">
      <div className="font-bold mb-2">🔧 Debug Info</div>
      <div className="space-y-1">
        <div>Environment: {isTelegramEnvironment ? 'Telegram' : 'Browser'}</div>
        <div>User: {user?.first_name || 'None'}</div>
        <div>Platform: {launchParams?.tgWebAppPlatform || 'N/A'}</div>
        <div>Version: {launchParams?.tgWebAppVersion || 'N/A'}</div>
        <div>Start Param: {launchParams?.tgWebAppStartParam || 'None'}</div>
        {/* ✅ ИСПРАВЛЕНО: Используем launchParams вместо несуществующего initData */}
        {process.env.NODE_ENV === 'development' && rawInitData && (
          <div className="text-yellow-300">Has InitData</div>
        )}
      </div>
    </div>
  );
}
