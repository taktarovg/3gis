'use client';

import { useEffect, useState } from 'react';
import { Copy, CheckCircle, AlertTriangle, Smartphone, Monitor, RefreshCw, ExternalLink } from 'lucide-react';

interface DiagnosticData {
  userAgent: string;
  url: string;
  pathname: string;
  searchParams: URLSearchParams;
  referer: string;
  telegramWebApp: any;
  environment: 'browser' | 'telegram-web' | 'mini-app' | 'unknown';
  detectionResults: {
    hasWebAppParams: boolean;
    hasTelegramUA: boolean;
    hasTelegramSpecific: boolean;
    hasWebAppObject: boolean;
    hasRefererTelegram: boolean;
    patterns: {
      telegramBot: boolean;
      tdesktop: boolean;
      telegramAndroid: boolean;
      telegramIOS: boolean;
    };
  };
  middlewareDecision: {
    wouldRedirect: boolean;
    reason: string;
    suggestion?: string;
  };
}

/**
 * 🔍 ДИАГНОСТИЧЕСКАЯ СТРАНИЦА v13 для middleware отладки
 * НОВОЕ: Добавлена детекция для Telegram Desktop + обходы
 */
export default function TelegramDebugPage() {
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const analyzeTelegramDetection = (userAgent: string, searchParams: URLSearchParams) => {
    // Точно та же логика что в middleware v13
    const patterns = {
      telegramBot: /^TelegramBot/.test(userAgent),
      tdesktop: /tdesktop/i.test(userAgent),
      telegramAndroid: /Telegram-Android\//.test(userAgent),
      telegramIOS: /Safari\/[\d.]+ Telegram [\d.]+/.test(userAgent),
    };
    
    const detectionResults = {
      hasWebAppParams: searchParams.has('startapp') ||
                      searchParams.has('start_param') ||
                      searchParams.has('tgWebAppData') ||
                      searchParams.has('tgWebAppVersion') ||
                      searchParams.has('tgWebAppStartParam') ||
                      searchParams.has('tgWebAppPlatform') ||
                      searchParams.has('tgWebAppThemeParams') ||
                      searchParams.has('tg') ||
                      searchParams.has('telegram'),
      
      hasTelegramUA: patterns.telegramBot ||
                    patterns.tdesktop ||
                    patterns.telegramAndroid ||
                    patterns.telegramIOS ||
                    userAgent.includes('TelegramDesktop'),
      
      hasTelegramSpecific: userAgent.toLowerCase().includes('telegram') ||
                          searchParams.has('tg') ||
                          document.referrer?.includes('telegram'),
      
      hasWebAppObject: !!(window as any)?.Telegram?.WebApp,
      
      hasRefererTelegram: document.referrer?.includes('telegram') || 
                         document.referrer?.includes('tg://'),
      
      patterns
    };
    
    // Middleware logic simulation v13
    const isTelegramByMiddleware = detectionResults.hasTelegramUA || 
                                  detectionResults.hasWebAppParams ||
                                  detectionResults.hasRefererTelegram ||
                                  detectionResults.hasWebAppObject;
    
    // ✅ НОВОЕ: Предложения для исправления
    let suggestion = '';
    if (!isTelegramByMiddleware && detectionResults.hasWebAppObject) {
      suggestion = 'Добавьте ?tg=1 к URL для принудительного обхода middleware';
    }
    
    return {
      detectionResults,
      middlewareDecision: {
        wouldRedirect: !isTelegramByMiddleware,
        reason: isTelegramByMiddleware 
          ? 'Telegram клиент обнаружен - middleware пропустит'
          : 'Telegram НЕ обнаружен - middleware сделает редирект на /tg-redirect',
        suggestion
      }
    };
  };

  const refreshData = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const telegramWebApp = (window as any)?.Telegram?.WebApp;
      const userAgent = navigator.userAgent;
      const searchParams = url.searchParams;
      
      const analysis = analyzeTelegramDetection(userAgent, searchParams);
      
      // Определяем реальное окружение
      let environment: DiagnosticData['environment'] = 'unknown';
      
      if (telegramWebApp && telegramWebApp.version && telegramWebApp.initDataUnsafe) {
        environment = 'mini-app';
      } else if (analysis.detectionResults.hasTelegramUA || analysis.detectionResults.hasWebAppParams || analysis.detectionResults.hasWebAppObject) {
        environment = 'telegram-web';
      } else {
        environment = 'browser';
      }
      
      const data: DiagnosticData = {
        userAgent,
        url: window.location.href,
        pathname: window.location.pathname,
        searchParams,
        referer: document.referrer,
        telegramWebApp: telegramWebApp ? {
          version: telegramWebApp.version,
          platform: telegramWebApp.platform,
          initData: telegramWebApp.initData,
          initDataUnsafe: telegramWebApp.initDataUnsafe,
          ready: typeof telegramWebApp.ready,
          close: typeof telegramWebApp.close,
          expand: typeof telegramWebApp.expand,
        } : null,
        environment,
        ...analysis
      };
      
      setDiagnosticData(data);
      
      console.log('🔍 Telegram Debug Data v13:', data);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    refreshData();
  }, []);

  const copyToClipboard = async () => {
    if (!diagnosticData) return;
    
    const debugText = `
3GIS Telegram Debug Report v13
==============================
Timestamp: ${new Date().toISOString()}
URL: ${diagnosticData.url}
Environment: ${diagnosticData.environment}

User Agent:
${diagnosticData.userAgent}

Middleware Decision v13:
${diagnosticData.middlewareDecision.reason}
Would Redirect: ${diagnosticData.middlewareDecision.wouldRedirect}
${diagnosticData.middlewareDecision.suggestion ? `Suggestion: ${diagnosticData.middlewareDecision.suggestion}` : ''}

Detection Results v13:
- WebApp Params: ${diagnosticData.detectionResults.hasWebAppParams}
- Telegram UA: ${diagnosticData.detectionResults.hasTelegramUA}  
- Telegram Specific: ${diagnosticData.detectionResults.hasTelegramSpecific}
- WebApp Object: ${diagnosticData.detectionResults.hasWebAppObject}
- Referer Telegram: ${diagnosticData.detectionResults.hasRefererTelegram}

WebApp Object: ${JSON.stringify(diagnosticData.telegramWebApp, null, 2)}
Referer: ${diagnosticData.referer}
`;
    
    try {
      await navigator.clipboard.writeText(debugText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!diagnosticData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка диагностических данных...</p>
        </div>
      </div>
    );
  }

  const getEnvironmentColor = () => {
    switch (diagnosticData.environment) {
      case 'mini-app':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'telegram-web':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'browser':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white font-bold">3GIS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Telegram Debug v13</h1>
                <p className="text-gray-600">Диагностика middleware + фикс Telegram Desktop</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={refreshData}
                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Обновить
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Скопировано!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Копировать отчет
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Environment Status */}
          <div className={`rounded-lg border-2 p-4 mb-6 ${getEnvironmentColor()}`}>
            <div className="flex items-center mb-2">
              {diagnosticData.environment === 'mini-app' && <Smartphone className="w-6 h-6 text-green-600" />}
              {diagnosticData.environment === 'telegram-web' && <Monitor className="w-6 h-6 text-blue-600" />}
              {diagnosticData.environment === 'browser' && <Monitor className="w-6 h-6 text-gray-600" />}
              {diagnosticData.environment === 'unknown' && <AlertTriangle className="w-6 h-6 text-yellow-600" />}
              <h2 className="text-lg font-semibold ml-2">
                Окружение: {diagnosticData.environment.toUpperCase()}
              </h2>
            </div>
            <p className="text-sm">
              {diagnosticData.environment === 'mini-app' && 'Telegram Mini App обнаружен ✅'}
              {diagnosticData.environment === 'telegram-web' && 'Telegram браузер/клиент обнаружен ✅'}
              {diagnosticData.environment === 'browser' && 'Обычный браузер - требуется редирект в Telegram'}
              {diagnosticData.environment === 'unknown' && 'Не удалось определить окружение'}
            </p>
          </div>

          {/* Middleware Decision */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">🔧 Решение Middleware v13:</h3>
            {diagnosticData.middlewareDecision.wouldRedirect ? (
              <div className="flex items-start text-orange-600">
                <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Будет редирект на /tg-redirect</div>
                  <div className="text-sm mt-1">{diagnosticData.middlewareDecision.reason}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-start text-green-600">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Пропуск через middleware</div>
                  <div className="text-sm mt-1">{diagnosticData.middlewareDecision.reason}</div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ БЫСТРОЕ РЕШЕНИЕ для Telegram Desktop */}
          {diagnosticData.detectionResults.hasWebAppObject && diagnosticData.middlewareDecision.wouldRedirect && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-3">🚀 Быстрое решение для Telegram Desktop:</h3>
              <p className="text-sm text-blue-700 mb-3">
                Обнаружен объект Telegram.WebApp, но middleware не распознал Telegram. 
                Используйте эти ссылки для принудительного обхода:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/tg?tg=1"
                  className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  /tg с обходом
                </a>
                <a
                  href="/tg?telegram=1"
                  className="inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  /tg альтернативный
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Detection Results */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Результаты детекции v13</h3>
            <div className="space-y-3">
              {Object.entries(diagnosticData.detectionResults).map(([key, value]) => {
                if (key === 'patterns') return null;
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                    </span>
                    <span className={`text-sm font-medium ${value ? 'text-green-600' : 'text-red-600'}`}>
                      {value ? '✅' : '❌'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔎 User Agent паттерны v13</h3>
            <div className="space-y-3">
              {Object.entries(diagnosticData.detectionResults.patterns).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                  </span>
                  <span className={`text-sm font-medium ${value ? 'text-green-600' : 'text-red-600'}`}>
                    {value ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Telegram WebApp Object */}
        {diagnosticData.telegramWebApp && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📱 Telegram WebApp Object v13</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-lg font-bold text-green-600">✅ Обнаружен</div>
                <div className="text-sm text-green-700">window.Telegram.WebApp</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-lg font-bold text-blue-600">{diagnosticData.telegramWebApp.version || 'н/д'}</div>
                <div className="text-sm text-blue-700">Версия WebApp</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="text-lg font-bold text-purple-600">{diagnosticData.telegramWebApp.platform || 'н/д'}</div>
                <div className="text-sm text-purple-700">Платформа</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded p-3">
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(diagnosticData.telegramWebApp, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* User Agent Analysis */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🤖 User Agent Анализ v13</h3>
          <div className="bg-gray-50 rounded p-3 text-sm font-mono break-all mb-4">
            {diagnosticData.userAgent}
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Ключевые слова:</h4>
              <div className="space-y-1">
                {['TelegramBot', 'tdesktop', 'Telegram-Android', 'Telegram Desktop', 'Telegram/', 'Safari'].map(keyword => (
                  <div key={keyword} className="flex items-center">
                    <span className="w-4 h-4 mr-2">
                      {diagnosticData.userAgent.includes(keyword) ? '✅' : '❌'}
                    </span>
                    <span className={diagnosticData.userAgent.includes(keyword) ? 'text-green-600' : 'text-gray-500'}>
                      {keyword}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Новые проверки v13:</h4>
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">
                    {diagnosticData.detectionResults.hasRefererTelegram ? '✅' : '❌'}
                  </span>
                  <span className="text-sm">Referer содержит telegram</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">
                    {diagnosticData.detectionResults.hasWebAppObject ? '✅' : '❌'}
                  </span>
                  <span className="text-sm">window.Telegram.WebApp</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">
                    {diagnosticData.searchParams.has('tg') ? '✅' : '❌'}
                  </span>
                  <span className="text-sm">URL параметр ?tg=1</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">
                    {diagnosticData.searchParams.has('telegram') ? '✅' : '❌'}
                  </span>
                  <span className="text-sm">URL параметр ?telegram=1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔧 Тестовые ссылки v13</h2>
          <div className="grid md:grid-cols-4 gap-3">
            <a
              href="/tg"
              className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Проверить /tg
            </a>
            <a
              href="/tg?tg=1"
              className="inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              /tg с ?tg=1
            </a>
            <a
              href="/tg?telegram=1"
              className="inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              /tg с ?telegram=1
            </a>
            <a
              href="/middleware-test"
              className="inline-flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              Тест middleware
            </a>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">📋 Инструкция для Telegram Desktop:</h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Если middleware не распознает Telegram Desktop - используйте ссылки с параметрами</li>
              <li>2. Параметр <code>?tg=1</code> или <code>?telegram=1</code> принудительно обходит middleware</li>
              <li>3. Middleware v13 также проверяет Referer и дополнительные заголовки</li>
              <li>4. При обнаружении window.Telegram.WebApp показываются быстрые ссылки</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
