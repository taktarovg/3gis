// Тестовая страница для проверки детекции среды
// src/app/tg/test-environment/page.tsx
'use client';

import { useTelegram } from '@/components/providers/TelegramProvider';
import { useEnvironmentDetection } from '@/components/environment/EnvironmentDetector';

export default function TestEnvironmentPage() {
  const { isReady, user, isTelegramEnvironment, error, initData } = useTelegram();
  const envDetection = useEnvironmentDetection();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Тестирование детекции среды</h1>
      
      {/* Статус Telegram Provider */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">Telegram Provider Status</h2>
        <ul className="space-y-1 text-sm">
          <li><strong>Ready:</strong> {isReady ? '✅' : '❌'}</li>
          <li><strong>Telegram Environment:</strong> {isTelegramEnvironment ? '✅' : '❌'}</li>
          <li><strong>Authenticated:</strong> {user ? '✅' : '❌'}</li>
          <li><strong>Error:</strong> {error || 'Нет'}</li>
        </ul>
      </div>

      {/* Данные пользователя */}
      {user && (
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Данные пользователя</h2>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}

      {/* InitData */}
      {initData && (
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Init Data</h2>
          <div className="space-y-2 text-xs">
            <div>
              <strong>Raw:</strong>
              <pre className="bg-gray-100 p-2 rounded break-all">
                {initData.raw?.substring(0, 200)}...
              </pre>
            </div>
            {initData.parsed && (
              <div>
                <strong>Parsed:</strong>
                <pre className="bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(initData.parsed, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Environment Detection */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">Environment Detection</h2>
        <ul className="space-y-1 text-sm">
          <li><strong>Is Telegram:</strong> {envDetection.isTelegramEnvironment ? '✅' : '❌'}</li>
          <li><strong>Is Mobile:</strong> {envDetection.isMobile ? '✅' : '❌'}</li>
          <li><strong>Loading:</strong> {envDetection.loading ? '⏳' : '✅'}</li>
          <li><strong>User Agent:</strong> {envDetection.userAgent?.substring(0, 100)}...</li>
        </ul>
      </div>

      {/* Системная информация */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">Системная информация</h2>
        <ul className="space-y-1 text-sm">
          <li><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</li>
          <li><strong>Referrer:</strong> {typeof document !== 'undefined' ? document.referrer || 'Нет' : 'N/A'}</li>
          <li><strong>Telegram WebApp:</strong> {typeof window !== 'undefined' && (window as any)?.Telegram?.WebApp ? '✅' : '❌'}</li>
          <li><strong>Platform:</strong> {typeof navigator !== 'undefined' ? navigator.platform : 'N/A'}</li>
        </ul>
      </div>

      {/* Кнопки тестирования */}
      <div className="bg-white rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">Тестовые действия</h2>
        <div className="space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Перезагрузить страницу
          </button>
          
          <button
            onClick={() => {
              const tg = (window as any)?.Telegram?.WebApp;
              if (tg) {
                tg.showAlert('Тест Telegram Alert функции!');
              } else {
                alert('Telegram WebApp недоступен');
              }
            }}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Тест Telegram Alert
          </button>
          
          <button
            onClick={() => {
              const tg = (window as any)?.Telegram?.WebApp;
              if (tg && tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('medium');
              } else {
                console.log('Haptic Feedback недоступен');
              }
            }}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Тест Haptic Feedback
          </button>
        </div>
      </div>
    </div>
  );
}