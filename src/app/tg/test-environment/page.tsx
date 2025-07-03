// Тестовая страница для проверки детекции среды
// src/app/tg/test-environment/page.tsx
'use client';

import { useTelegram } from '@/components/providers/TelegramProvider';
import { useState, useEffect } from 'react';

export default function TestEnvironmentPage() {
  const { isReady, user, isTelegramEnvironment, error, initData } = useTelegram();
  const [environmentInfo, setEnvironmentInfo] = useState<any>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEnvironmentInfo({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        href: window.location.href,
        referrer: document.referrer,
        hasTelegramWebApp: !!(window as any)?.Telegram?.WebApp,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        urlParams: Object.fromEntries(new URLSearchParams(window.location.search))
      });
    }
  }, []);

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">🔍 Тестирование детекции среды SDK v3.x</h1>
      
      <div className="bg-white rounded-lg p-4 shadow border">
        <h2 className="text-lg font-semibold mb-2 flex items-center">
          📡 Telegram Provider Status
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Ready:</span>
              <span className={isReady ? 'text-green-600 font-bold' : 'text-red-600'}>
                {isReady ? '✅ Готов' : '❌ Не готов'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Telegram Environment:</span>
              <span className={isTelegramEnvironment ? 'text-green-600 font-bold' : 'text-orange-600'}>
                {isTelegramEnvironment ? '✅ Telegram' : '🖥️ Browser'}
              </span>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Authenticated:</span>
              <span className={user ? 'text-green-600 font-bold' : 'text-gray-600'}>
                {user ? '✅ Да' : '❌ Нет'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Error:</span>
              <span className={error ? 'text-red-600 font-bold' : 'text-green-600'}>
                {error ? '❌ Есть' : '✅ Нет'}
              </span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <strong>Ошибка:</strong> {error}
          </div>
        )}
      </div>

      {user && (
        <div className="bg-white rounded-lg p-4 shadow border">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            👤 Данные пользователя (SDK v3.x)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Имя:</strong> {user.first_name} {user.last_name}</div>
              <div><strong>Username:</strong> {user.username ? `@${user.username}` : 'Не указан'}</div>
              <div><strong>Язык:</strong> {user.language_code || 'Не указан'}</div>
              <div><strong>Premium:</strong> {user.is_premium ? '⭐ Да' : '❌ Нет'}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded text-xs">
              <strong>Raw JSON:</strong>
              <pre className="mt-1 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {initData && (
        <div className="bg-white rounded-lg p-4 shadow border">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            🔐 Init Data (SDK v3.x Structure)
          </h2>
          <div className="space-y-3">
            {initData.parsed && (
              <div>
                <h3 className="font-medium text-sm mb-1">tgWebAppData (Parsed):</h3>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto border">
                  {JSON.stringify(initData.parsed, null, 2)}
                </pre>
              </div>
            )}
            
            {initData.launchParams && (
              <div>
                <h3 className="font-medium text-sm mb-1">Full Launch Params:</h3>
                <pre className="text-xs bg-blue-50 p-3 rounded overflow-auto border border-blue-200">
                  {JSON.stringify(initData.launchParams, null, 2)}
                </pre>
              </div>
            )}
            
            {initData.isMock && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
                <strong>⚠️ Mock Mode:</strong> Используются тестовые данные для development
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg p-4 shadow border">
        <h2 className="text-lg font-semibold mb-2 flex items-center">
          🌐 Environment Detection
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Telegram WebApp:</span>
              <span className={environmentInfo.hasTelegramWebApp ? 'text-green-600 font-bold' : 'text-red-600'}>
                {environmentInfo.hasTelegramWebApp ? '✅ Да' : '❌ Нет'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Mobile Device:</span>
              <span className={environmentInfo.isMobile ? 'text-blue-600 font-bold' : 'text-gray-600'}>
                {environmentInfo.isMobile ? '📱 Да' : '🖥️ Нет'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Platform:</span>
              <span className="font-mono">{environmentInfo.platform}</span>
            </div>
          </div>
          
          <div className="space-y-2 text-xs">
            <div>
              <strong>URL:</strong>
              <div className="bg-gray-100 p-2 rounded break-all">{environmentInfo.href}</div>
            </div>
            <div>
              <strong>Referrer:</strong>
              <div className="bg-gray-100 p-2 rounded break-all">
                {environmentInfo.referrer || 'Нет'}
              </div>
            </div>
          </div>
        </div>
        
        {environmentInfo.userAgent && (
          <div className="mt-3">
            <strong className="text-sm">User Agent:</strong>
            <div className="text-xs bg-gray-100 p-2 rounded mt-1 break-all">
              {environmentInfo.userAgent}
            </div>
          </div>
        )}
      </div>

      {Object.keys(environmentInfo.urlParams || {}).length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow border">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            🔗 URL Parameters
          </h2>
          <div className="space-y-1 text-sm">
            {Object.entries(environmentInfo.urlParams || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-mono text-blue-600">{key}:</span>
                <span className="font-mono text-gray-700 ml-2 break-all">{value as string}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg p-4 shadow border">
        <h2 className="text-lg font-semibold mb-2 flex items-center">
          🧪 Тестовые действия
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            🔄 Перезагрузить страницу
          </button>
          
          <button
            onClick={() => {
              const tg = (window as any)?.Telegram?.WebApp;
              if (tg && typeof tg.showAlert === 'function') {
                tg.showAlert('✅ Telegram Alert работает!');
              } else {
                alert('❌ Telegram WebApp недоступен');
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            📢 Тест Telegram Alert
          </button>
          
          <button
            onClick={() => {
              const tg = (window as any)?.Telegram?.WebApp;
              if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
                tg.HapticFeedback.impactOccurred('medium');
                alert('✅ Haptic Feedback выполнен');
              } else {
                alert('❌ Haptic Feedback недоступен');
              }
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            📳 Тест Haptic Feedback
          </button>
          
          <button
            onClick={() => {
              const tg = (window as any)?.Telegram?.WebApp;
              if (tg && typeof tg.ready === 'function') {
                try {
                  tg.expand();
                  alert('✅ Telegram expand выполнен');
                } catch (err) {
                  alert('❌ Ошибка expand: ' + err);
                }
              } else {
                alert('❌ Telegram WebApp недоступен');
              }
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            📏 Тест Expand
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h2 className="text-lg font-semibold mb-2 flex items-center text-blue-800">
          📚 SDK Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div><strong>@telegram-apps/sdk:</strong> v3.10.1</div>
            <div><strong>@telegram-apps/sdk-react:</strong> v3.3.1</div>
            <div><strong>Next.js:</strong> v15.3.3</div>
          </div>
          <div className="space-y-1">
            <div><strong>React:</strong> v18.2.0</div>
            <div><strong>Node Environment:</strong> {process.env.NODE_ENV}</div>
            <div><strong>Build Time:</strong> {new Date().toISOString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}