// src/app/tg/diagnostic/page.tsx
'use client';

import { useEffect, useState } from 'react';

interface DiagnosticData {
  userAgent: string;
  url: string;
  timestamp: string;
  telegramAPI: {
    available: boolean;
    version?: string;
    platform?: string;
    initData?: string;
    initDataUnsafe?: any;
  };
  environment: {
    isMainFrame: boolean;
    hasWebApp: boolean;
    hasParent: boolean;
  };
  urlParams: Record<string, string>;
}

export default function TelegramDiagnosticPage() {
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const webApp = (window as any)?.Telegram?.WebApp;
      const urlParams = new URLSearchParams(window.location.search);
      const paramsObj: Record<string, string> = {};
      
      for (const [key, value] of urlParams.entries()) {
        paramsObj[key] = value;
      }

      const data: DiagnosticData = {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        telegramAPI: {
          available: !!webApp,
          version: webApp?.version,
          platform: webApp?.platform,
          initData: webApp?.initData || 'не найден',
          initDataUnsafe: webApp?.initDataUnsafe
        },
        environment: {
          isMainFrame: window.self === window.top,
          hasWebApp: !!webApp,
          hasParent: window.parent !== window
        },
        urlParams: paramsObj
      };

      setDiagnostic(data);
      
      // ✅ Отправляем данные на сервер для анализа middleware
      fetch('/api/diagnostic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).catch(err => console.log('ℹ️ Не удалось отправить данные на сервер:', err));
      
      // Также логируем в консоль для удобства
      console.log('🔍 ДИАГНОСТИКА TELEGRAM DESKTOP:', data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('❌ Ошибка диагностики:', err);
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-red-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Ошибка диагностики</h1>
          <div className="bg-white p-4 rounded-lg border border-red-200">
            <pre className="text-sm text-red-600">{error}</pre>
          </div>
        </div>
      </div>
    );
  }

  if (!diagnostic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Сбор диагностической информации...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🔍 Диагностика Telegram Desktop</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Основная информация</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700">URL:</h3>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">{diagnostic.url}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Время:</h3>
              <p className="text-sm">{diagnostic.timestamp}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-green-600">User Agent</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-sm font-mono break-all">{diagnostic.userAgent}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className={`p-2 rounded ${diagnostic.userAgent.includes('TelegramDesktop') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              TelegramDesktop: {diagnostic.userAgent.includes('TelegramDesktop') ? '✅' : '❌'}
            </div>
            <div className={`p-2 rounded ${diagnostic.userAgent.includes('Telegram Desktop') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Telegram Desktop: {diagnostic.userAgent.includes('Telegram Desktop') ? '✅' : '❌'}
            </div>
            <div className={`p-2 rounded ${diagnostic.userAgent.includes('Telegram/') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Telegram/: {diagnostic.userAgent.includes('Telegram/') ? '✅' : '❌'}
            </div>
            <div className={`p-2 rounded ${diagnostic.userAgent.includes('TelegramBot') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              TelegramBot: {diagnostic.userAgent.includes('TelegramBot') ? '✅' : '❌'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-purple-600">Telegram WebApp API</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Доступность API:</h3>
              <div className={`p-3 rounded ${diagnostic.telegramAPI.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {diagnostic.telegramAPI.available ? '✅ WebApp API доступен' : '❌ WebApp API недоступен'}
              </div>
            </div>
            {diagnostic.telegramAPI.available && (
              <>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Версия:</h3>
                  <p className="bg-gray-100 p-2 rounded">{diagnostic.telegramAPI.version || 'не определена'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Платформа:</h3>
                  <p className="bg-gray-100 p-2 rounded">{diagnostic.telegramAPI.platform || 'не определена'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Init Data:</h3>
                  <p className="bg-gray-100 p-2 rounded text-sm break-all">
                    {diagnostic.telegramAPI.initData ? 'Есть данные' : 'Нет данных'}
                  </p>
                </div>
              </>
            )}
          </div>
          
          {diagnostic.telegramAPI.initDataUnsafe && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-700 mb-2">Init Data Unsafe:</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(diagnostic.telegramAPI.initDataUnsafe, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">Среда выполнения</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-3 rounded ${diagnostic.environment.isMainFrame ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              Главный фрейм: {diagnostic.environment.isMainFrame ? '✅ Да' : '⚠️ Нет'}
            </div>
            <div className={`p-3 rounded ${diagnostic.environment.hasWebApp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              WebApp API: {diagnostic.environment.hasWebApp ? '✅ Есть' : '❌ Нет'}
            </div>
            <div className={`p-3 rounded ${!diagnostic.environment.hasParent ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              Вложенность: {!diagnostic.environment.hasParent ? '✅ Основное окно' : '⚠️ Во фрейме'}
            </div>
          </div>
        </div>

        {Object.keys(diagnostic.urlParams).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-indigo-600">URL параметры</h2>
            <div className="space-y-2">
              {Object.entries(diagnostic.urlParams).map(([key, value]) => (
                <div key={key} className="flex flex-col md:flex-row">
                  <span className="font-medium text-gray-700 md:w-32">{key}:</span>
                  <span className="bg-gray-100 p-1 rounded flex-1 font-mono text-sm break-all">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Инструкции для тестирования</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Скопируйте эту диагностическую информацию</li>
            <li>2. Проверьте что User Agent содержит упоминания о Telegram</li>
            <li>3. Убедитесь что WebApp API доступен (должен быть ✅)</li>
            <li>4. Если WebApp API недоступен - проблема в том, что страница не открыта как Mini App</li>
            <li>5. Откройте в Telegram Desktop через: t.me/ThreeGIS_bot/app</li>
          </ol>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigator.clipboard.writeText(JSON.stringify(diagnostic, null, 2))}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            📋 Скопировать JSON диагностики
          </button>
        </div>
      </div>
    </div>
  );
}
