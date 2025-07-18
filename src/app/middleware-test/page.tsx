'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader2, RefreshCw, Settings, Copy } from 'lucide-react';

/**
 * ✅ СТРАНИЦА ТЕСТИРОВАНИЯ MIDDLEWARE v15
 * 
 * Позволяет протестировать работу Hybrid Middleware v15
 * с различными user-agent и параметрами
 */

interface TestResult {
  url: string;
  method: string;
  userAgent: string;
  expectedResult: string;
  actualResult: string;
  passed: boolean;
  notes?: string;
}

export default function MiddlewareTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentUserAgent, setCurrentUserAgent] = useState('');
  const [customUserAgent, setCustomUserAgent] = useState('');
  const [useCustomUA, setUseCustomUA] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUserAgent(navigator.userAgent);
    }
  }, []);

  // Предустановленные User-Agent для тестирования
  const testUserAgents = [
    {
      name: 'Chrome Desktop (Обычный браузер)',
      ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      expected: 'redirect-to-tg-redirect'
    },
    {
      name: 'Telegram Desktop (должен проходить)',
      ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TelegramDesktop/4.12.4',
      expected: 'allow-access'
    },
    {
      name: 'Telegram Android',
      ua: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 Telegram-Android/10.5.2 (Samsung SM-G991B; Android 13; SDK 33; AVERAGE)',
      expected: 'allow-access'
    },
    {
      name: 'Telegram iOS',
      ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 Telegram 10.3.1',
      expected: 'allow-access'
    },
    {
      name: 'Safari Mobile (обычный браузер)',
      ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      expected: 'redirect-to-tg-detect'
    },
    {
      name: 'Chrome Android (обычный браузер)',
      ua: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      expected: 'redirect-to-tg-detect'
    },
    {
      name: 'Firefox Desktop',
      ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      expected: 'redirect-to-tg-redirect'
    },
    {
      name: 'Edge Desktop',
      ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      expected: 'redirect-to-tg-redirect'
    }
  ];

  // Типизация для тестовых сценариев
  interface TestScenario {
    name: string;
    url: string;
    params: Record<string, string | undefined>;
    description: string;
  }

  // Тестовые сценарии
  const testScenarios: TestScenario[] = [
    {
      name: 'Обычный доступ к /tg',
      url: '/tg',
      params: {},
      description: 'Базовый тест middleware без параметров'
    },
    {
      name: 'С параметром startapp',
      url: '/tg',
      params: { startapp: 'test123' },
      description: 'Тест с явным Telegram параметром (должен проходить всегда)'
    },
    {
      name: 'С параметром tg=1',
      url: '/tg',
      params: { tg: '1' },
      description: 'Принудительный обход middleware'
    },
    {
      name: 'Доступ к /tg/businesses',
      url: '/tg/businesses',
      params: {},
      description: 'Тест глубокой ссылки в приложении'
    },
    {
      name: 'Служебная страница /tg-redirect',
      url: '/tg-redirect',
      params: {},
      description: 'Служебные страницы должны проходить всегда'
    },
    {
      name: 'Служебная страница /tg-detect',
      url: '/tg-detect',
      params: {},
      description: 'Страница детекции должна проходить всегда'
    }
  ];

  async function runSingleTest(
    userAgent: string,
    scenario: TestScenario,
    expectedForUA: string
  ): Promise<TestResult> {
    // Фильтруем undefined значения и приводим к строкам
    const filteredParams: Record<string, string> = {};
    Object.entries(scenario.params).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredParams[key] = String(value);
      }
    });
    
    const params = new URLSearchParams(filteredParams);
    const testUrl = scenario.url + (params.toString() ? '?' + params.toString() : '');
    
    try {
      // Симулируем запрос с измененным User-Agent
      const response = await fetch(testUrl, {
        method: 'HEAD', // Используем HEAD чтобы не загружать контент
        headers: useCustomUA ? {
          'User-Agent': userAgent
        } : {},
        redirect: 'manual' // Не следуем автоматическим редиректам
      });

      let actualResult = '';
      let notes = '';

      // Анализируем ответ
      if (response.status === 200) {
        actualResult = 'allow-access';
        notes = 'Страница загружена успешно';
      } else if (response.status === 307 || response.status === 302) {
        const location = response.headers.get('location') || '';
        if (location.includes('/tg-redirect')) {
          actualResult = 'redirect-to-tg-redirect';
          notes = `Редирект на: ${location}`;
        } else if (location.includes('/tg-detect')) {
          actualResult = 'redirect-to-tg-detect';
          notes = `Редирект на детекцию: ${location}`;
        } else {
          actualResult = 'redirect-other';
          notes = `Неожиданный редирект: ${location}`;
        }
      } else {
        actualResult = 'error';
        notes = `HTTP ${response.status}`;
      }

      // Для служебных страниц ожидаем всегда allow-access
      if (scenario.url.startsWith('/tg-redirect') || scenario.url.startsWith('/tg-detect')) {
        expectedForUA = 'allow-access';
      }

      // Для запросов с явными Telegram параметрами ожидаем allow-access
      if (scenario.params.startapp || scenario.params.tg || scenario.params.tgWebAppData) {
        expectedForUA = 'allow-access';
      }

      const passed = actualResult === expectedForUA;

      return {
        url: testUrl,
        method: 'HEAD',
        userAgent: userAgent.substring(0, 60) + '...',
        expectedResult: expectedForUA,
        actualResult,
        passed,
        notes
      };

    } catch (error) {
      return {
        url: testUrl,
        method: 'HEAD',
        userAgent: userAgent.substring(0, 60) + '...',
        expectedResult: expectedForUA,
        actualResult: 'error',
        passed: false,
        notes: `Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async function runAllTests() {
    setIsRunning(true);
    setResults([]);

    const allResults: TestResult[] = [];

    for (const userAgentInfo of testUserAgents) {
      for (const scenario of testScenarios) {
        const result = await runSingleTest(
          userAgentInfo.ua,
          scenario,
          userAgentInfo.expected
        );
        
        result.notes = `${userAgentInfo.name} - ${scenario.description}${result.notes ? ` | ${result.notes}` : ''}`;
        allResults.push(result);
        
        // Добавляем результат по мере выполнения
        setResults(prev => [...prev, result]);
        
        // Небольшая задержка между тестами
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    setIsRunning(false);
  }

  function copyResults() {
    const text = results.map(r => 
      `${r.passed ? '✅' : '❌'} ${r.notes}\n` +
      `   URL: ${r.url}\n` +
      `   Expected: ${r.expectedResult}, Got: ${r.actualResult}\n`
    ).join('\n');
    
    navigator.clipboard.writeText(text);
  }

  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.filter(r => !r.passed).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Заголовок */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🧪 Тестирование Middleware v15
            </h1>
            <p className="text-gray-600">
              Проверка работы Hybrid Middleware с 3-уровневой системой детекции
            </p>
          </div>

          {/* Текущая информация */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">
                🔍 Текущее окружение
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                <p><strong>User-Agent:</strong></p>
                <p className="break-all text-xs bg-blue-100 p-2 rounded">
                  {currentUserAgent || 'Загрузка...'}
                </p>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                📊 Статистика тестов
              </h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Всего тестов:</strong> {results.length}</p>
                <p><strong>Пройдено:</strong> <span className="text-green-600">✅ {passedTests}</span></p>
                <p><strong>Провалено:</strong> <span className="text-red-600">❌ {failedTests}</span></p>
                <p><strong>Успешность:</strong> {results.length > 0 ? Math.round((passedTests / results.length) * 100) : 0}%</p>
              </div>
            </div>
          </div>

          {/* Настройки тестирования */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Настройки тестирования
            </h3>
            
            <div className="flex items-center space-x-4 mb-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useCustomUA}
                  onChange={(e) => setUseCustomUA(e.target.checked)}
                  className="mr-2"
                />
                Использовать кастомный User-Agent
              </label>
            </div>

            {useCustomUA && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Кастомный User-Agent:
                </label>
                <input
                  type="text"
                  value={customUserAgent}
                  onChange={(e) => setCustomUserAgent(e.target.value)}
                  placeholder="Введите User-Agent для тестирования..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            )}

            <div className="text-xs text-gray-500">
              <p>⚠️ Примечание: Тестирование User-Agent в браузере ограничено политиками безопасности.</p>
              <p>Для полного тестирования используйте инструменты разработчика или внешние сервисы.</p>
            </div>
          </div>

          {/* Кнопки управления */}
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {isRunning ? 'Выполняется...' : 'Запустить тесты'}
            </button>

            {results.length > 0 && (
              <button
                onClick={copyResults}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" />
                Копировать результаты
              </button>
            )}

            <button
              onClick={() => setResults([])}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Очистить
            </button>
          </div>

          {/* Результаты тестов */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">
                📋 Результаты тестирования
              </h3>

              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      result.passed 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {result.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mr-2" />
                          )}
                          <span className="font-medium">
                            {result.notes}
                          </span>
                        </div>

                        <div className="text-sm space-y-1">
                          <p><strong>URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.url}</code></p>
                          <p><strong>Ожидался:</strong> <span className="text-blue-600">{result.expectedResult}</span></p>
                          <p><strong>Получен:</strong> <span className={result.passed ? 'text-green-600' : 'text-red-600'}>{result.actualResult}</span></p>
                          <p><strong>User-Agent:</strong> <span className="text-gray-600 text-xs">{result.userAgent}</span></p>
                        </div>
                      </div>

                      <div className="ml-4">
                        {result.passed ? (
                          <span className="text-green-600 font-semibold">✅ PASS</span>
                        ) : (
                          <span className="text-red-600 font-semibold">❌ FAIL</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Информация о тестируемых сценариях */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              📋 Тестируемые сценарии
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">User-Agent тесты:</h4>
                <ul className="space-y-1 text-gray-600">
                  {testUserAgents.map((ua, i) => (
                    <li key={i}>
                      • {ua.name} → {ua.expected}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">URL сценарии:</h4>
                <ul className="space-y-1 text-gray-600">
                  {testScenarios.map((scenario, i) => (
                    <li key={i}>
                      • {scenario.name} ({scenario.url})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Быстрые ссылки */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-800 mb-3">
              🔗 Быстрые ссылки для тестирования
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <a href="/tg" className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-center">
                /tg
              </a>
              <a href="/tg?startapp=test" className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-center">
                /tg?startapp=test
              </a>
              <a href="/tg-redirect" className="px-3 py-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors text-center">
                /tg-redirect
              </a>
              <a href="/tg-detect" className="px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-center">
                /tg-detect
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
