// src/components/debug/TelegramStatus.tsx
'use client';

import { useTelegram } from '@/components/providers/TelegramProvider';

/**
 * ✅ ИСПРАВЛЕНО: Улучшенный компонент отображения статуса (только в development)
 */
export function TelegramStatus() {
  const { isReady, user, isTelegramEnvironment, error, initData, sdkVersion, environmentInfo } = useTelegram();
  
  // ✅ Не показываем в продакшене
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  
  if (error) {
    return (
      <div className="fixed bottom-4 left-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm max-w-xs z-50">
        <strong className="font-bold">Ошибка SDK v{sdkVersion}:</strong>
        <span className="block text-xs mt-1">{error}</span>
      </div>
    );
  }
  
  if (!isReady) {
    return (
      <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm z-50">
        Инициализация SDK v{sdkVersion}...
      </div>
    );
  }
  
  const isMock = (initData as any)?.isMock;
  const isDevFallback = (initData as any)?.isDevFallback;
  const isLaunchParamsError = (initData as any)?.isLaunchParamsError;
  
  return (
    <div className={`fixed bottom-4 left-4 px-3 py-2 rounded text-sm max-w-xs z-50 border ${
      isTelegramEnvironment 
        ? 'bg-green-100 border-green-400 text-green-700' 
        : isLaunchParamsError
        ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
        : isMock || isDevFallback
        ? 'bg-blue-100 border-blue-400 text-blue-700'
        : 'bg-gray-100 border-gray-400 text-gray-700'
    }`}>
      <strong className="font-bold">
        {isTelegramEnvironment ? '✅ Telegram SDK v' + sdkVersion : 
         isLaunchParamsError ? '⚠️ Browser Mode (LaunchParams Error)' :
         isDevFallback ? '🌐 Browser Fallback' :
         isMock ? '🔧 Mock Mode (v' + sdkVersion + ')' : '🖥️ Unknown Mode'}
      </strong>
      {user && (
        <span className="block text-xs mt-1">
          {user.first_name || (user as any).firstName} {user.last_name || (user as any).lastName}
          {(user.username) && ` (@${user.username})`}
        </span>
      )}
      {(isMock || isDevFallback || isLaunchParamsError) && (
        <span className="block text-xs mt-1 text-blue-600">
          {isLaunchParamsError ? 'SDK работает в fallback режиме' :
           isDevFallback ? 'Development browser fallback' : 
           'Development mock data'}
        </span>
      )}
      <div className="text-xs mt-1 opacity-75">
        Platform: {environmentInfo.platform || 'unknown'} | 
        Version: {environmentInfo.version || 'unknown'}
      </div>
    </div>
  );
}
