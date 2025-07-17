'use client';

import { useState } from 'react';
import { Send, Copy, CheckCircle, AlertTriangle } from 'lucide-react';

interface TestResult {
  userAgent: string;
  destination: string;
  reason: string;
  wouldRedirect: boolean;
}

/**
 * 🧪 ТЕСТОВАЯ СТРАНИЦА для проверки middleware логики
 */
export default function MiddlewareTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Тестовые User-Agent строки
  const testUserAgents = [
    {
      name: 'Chrome Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    {
      name: 'Telegram Desktop Windows',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TelegramDesktop/4.11.8'
    },
    {
      name: 'Telegram Desktop (tdesktop)',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 tdesktop'
    },
    {
      name: 'Telegram Android',
      userAgent: 'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.136 Mobile Safari/537.36 Telegram-Android/11.3.3 (Google sdk_gphone64_arm64; Android 14; SDK 34; LOW)'
    },
    {
      name: 'Telegram iOS',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1 Telegram 10.3.1'
    },
    {
      name: 'TelegramBot (Link Preview)',
      userAgent: 'TelegramBot (like TwitterBot)'
    },
    {
      name: 'iPhone Safari',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'
    },
    {
      name: 'Android Chrome',
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36'
    }
  ];

  // Симуляция middleware логики
  const simulateMiddleware = (userAgent: string, hasStartApp: boolean = false): TestResult => {
    // Точно та же логика что в middleware v12
    const patterns = {
      telegramBot: /^TelegramBot/.test(userAgent),
      tdesktop: /tdesktop/i.test(userAgent),
      telegramAndroid: /Telegram-Android\//.test(userAgent),
      telegramIOS: /Safari\/[\d.]+ Telegram [\d.]+/.test(userAgent),
    };

    const hasTelegramUA = patterns.telegramBot ||
                         patterns.tdesktop ||
                         patterns.telegramAndroid ||
                         patterns.telegramIOS;

    const hasWebAppParams = hasStartApp; // Симулируем параметр startapp

    const isTelegramByMiddleware = hasTelegramUA || hasWebAppParams;

    let reason = '';
    if (patterns.telegramBot) reason = 'TelegramBot detected';
    else if (patterns.tdesktop) reason = 'TDesktop detected';
    else if (patterns.telegramAndroid) reason = 'Telegram Android detected';
    else if (patterns.telegramIOS) reason = 'Telegram iOS detected';
    else if (hasWebAppParams) reason = 'WebApp parameters detected';
    else reason = 'No Telegram indicators found';

    return {
      userAgent,
      destination: isTelegramByMiddleware ? '/tg (pass through)' : '/tg-redirect (redirect)',
      reason,
      wouldRedirect: !isTelegramByMiddleware
    };
  };

  const runTests = async () => {
    setIsLoading(true);
    setResults([]);

    // Тестируем каждый User-Agent
    const testResults: TestResult[] = [];

    for (const test of testUserAgents) {
      // Тест без параметров
      const resultWithoutParams = simulateMiddleware(test.userAgent, false);
      testResults.push({
        ...resultWithoutParams,
        userAgent: `${test.name} (без startapp)`
      });

      // Тест с параметром startapp
      const resultWithParams = simulateMiddleware(test.userAgent, true);
      testResults.push({
        ...resultWithParams,
        userAgent: `${test.name} (с startapp)`
      });
    }

    // Имитируем задержку API
    await new Promise(resolve => setTimeout(resolve, 1000));

    setResults(testResults);
    setIsLoading(false);
  };

  const copyResults = async () => {
    const report = `
3GIS Middleware Test Report v12
===============================
Timestamp: ${new Date().toISOString()}

Test Results:
${results.map((result, index) => `
${index + 1}. ${result.userAgent}
   Destination: ${result.destination}
   Reason: ${result.reason}
   Would Redirect: ${result.wouldRedirect ? 'YES' : 'NO'}
`).join('')}

Summary:
- Total tests: ${results.length}
- Would redirect: ${results.filter(r => r.wouldRedirect).length}
- Would pass through: ${results.filter(r => !r.wouldRedirect).length}
`;

    try {
      await navigator.clipboard.writeText(report);
      // Показать уведомление об успешном копировании
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Middleware Test v12</h1>
              <p className="text-gray-600">Тестирование логики детекции Telegram клиентов</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={runTests}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Тестируем...' : 'Запустить тесты'}
              </button>
              
              {results.length > 0 && (
                <button
                  onClick={copyResults}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Копировать отчет
                </button>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Логика тестирования:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Проверяем каждый User-Agent на соответствие паттернам Telegram</li>
              <li>• Тестируем с параметром startapp и без него</li>
              <li>• Симулируем решение middleware: пропустить или редирект</li>
              <li>• Используем те же регулярные выражения что в middleware v12</li>
            </ul>
          </div>
        </div>

        {/* Test Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Результаты тестирования ({results.length} тестов)
            </h2>
            
            {/* Summary */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {results.filter(r => !r.wouldRedirect).length}
                </div>
                <div className="text-sm text-green-700">Пропуск (Telegram обнаружен)</div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {results.filter(r => r.wouldRedirect).length}
                </div>
                <div className="text-sm text-orange-700">Редирект (обычный браузер)</div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {results.length}
                </div>
                <div className="text-sm text-blue-700">Всего тестов</div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.wouldRedirect
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {result.wouldRedirect ? (
                          <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        )}
                        <h3 className="font-medium text-gray-800">
                          {result.userAgent}
                        </h3>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="font-medium text-gray-700">Destination:</span>
                          <span className="ml-2 text-gray-600">{result.destination}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Reason:</span>
                          <span className="ml-2 text-gray-600">{result.reason}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      result.wouldRedirect
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {result.wouldRedirect ? 'REDIRECT' : 'PASS'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Agent Patterns Reference */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Паттерны детекции (Reference)
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Регулярные выражения:</h3>
              <div className="space-y-2 text-sm">
                <div className="font-mono bg-gray-100 p-2 rounded">
                  /^TelegramBot/ → TelegramBot detection
                </div>
                <div className="font-mono bg-gray-100 p-2 rounded">
                  /tdesktop/i → Telegram Desktop
                </div>
                <div className="font-mono bg-gray-100 p-2 rounded">
                  /Telegram-Android\// → Android app
                </div>
                <div className="font-mono bg-gray-100 p-2 rounded">
                  /Safari\/[\d.]+ Telegram [\d.]+/ → iOS app
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-3">URL параметры:</h3>
              <div className="space-y-2 text-sm">
                <div className="bg-gray-100 p-2 rounded">
                  <code>startapp</code> - основной параметр запуска
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <code>start_param</code> - альтернативный параметр
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <code>tgWebAppData</code> - данные WebApp
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <code>tgWebAppVersion</code> - версия WebApp
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Links */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Тестовые ссылки
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/tg-debug"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Диагностика (/tg-debug)
            </a>
            <a
              href="/tg"
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Проверить /tg
            </a>
            <a
              href="/tg?startapp=test"
              className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              /tg с параметром
            </a>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Инструкция по тестированию:</strong>
            </p>
            <ol className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>1. Запустите тесты выше чтобы увидеть симуляцию</li>
              <li>2. Откройте <code>/tg</code> в обычном браузере - должен быть редирект</li>
              <li>3. Откройте <code>/tg</code> в Telegram Desktop - должен пропустить</li>
              <li>4. Используйте страницу диагностики для детального анализа</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
