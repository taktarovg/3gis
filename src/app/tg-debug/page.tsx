'use client';

import { useEffect, useState } from 'react';
import { Copy, CheckCircle, AlertTriangle, Smartphone, Monitor, RefreshCw } from 'lucide-react';

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
  };
}

/**
 * 🔍 ДИАГНОСТИЧЕСКАЯ СТРАНИЦА v12 для middleware отладки
 */
export default function TelegramDebugPage() {
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const analyzeTelegramDetection = (userAgent: string, searchParams: URLSearchParams) => {
    // Точно те же проверки, что в middleware v12
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
                      searchParams.has('tgWebAppVersion'),
      
      hasTelegramUA: patterns.telegramBot ||
                    patterns.tdesktop ||
                    patterns.telegramAndroid ||
                    patterns.telegramIOS,
      
      hasTelegramSpecific: userAgent.toLowerCase().includes('telegram') ||
                          searchParams.has('tg') ||
                          document.referrer?.includes('telegram'),
      
      hasWebAppObject: !!(window as any)?.Telegram?.WebApp,
      patterns
    };
    
    // Middleware logic simulation
    const isTelegramByMiddleware = detectionResults.hasTelegramUA || detectionResults.hasWebAppParams;
    
    return {
      detectionResults,
      middlewareDecision: {
        wouldRedirect: !isTelegramByMiddleware,
        reason: isTelegramByMiddleware 
          ? 'Telegram клиент обнаружен - middleware пропустит'
          : 'Telegram НЕ обнаружен - middleware сделает редирект на /tg-redirect'
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
      
      console.log('🔍 Telegram Debug Data v12:', data);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    refreshData();
  }, []);

  const copyToClipboard = async () => {
    if (!diagnosticData) return;
    
    const debugText = `
3GIS Telegram Debug Report v12
==============================
Timestamp: ${new Date().toISOString()}
URL: ${diagnosticData.url}
Environment: ${diagnosticData.environment}

User Agent:
${diagnosticData.userAgent}

Middleware Decision:
${diagnosticData.middlewareDecision.reason}
Would Redirect: ${diagnosticData.middlewareDecision.wouldRedirect}

Detection Results:
- WebApp Params: ${diagnosticData.detectionResults.hasWebAppParams}
- Telegram UA: ${diagnosticData.detectionResults.hasTelegramUA}  
- Telegram Specific: ${diagnosticData.detectionResults.hasTelegramSpecific}
- WebApp Object: ${diagnosticData.detectionResults.hasWebAppObject}

Patterns:
- TelegramBot: ${diagnosticData.detectionResults.patterns.telegramBot}
- TDesktop: ${diagnosticData.detectionResults.patterns.tdesktop}
- Telegram Android: ${diagnosticData.detectionResults.patterns.telegramAndroid}
- Telegram iOS: ${diagnosticData.detectionResults.patterns.telegramIOS}

WebApp Object: ${JSON.stringify(diagnosticData.telegramWebApp, null, 2)}

Search Params:
${Array.from(diagnosticData.searchParams.entries()).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

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

  const getEnvironmentIcon = () => {
    switch (diagnosticData.environment) {
      case 'mini-app':
        return <Smartphone className="w-6 h-6 text-green-600" />;
      case 'telegram-web':
        return <Monitor className="w-6 h-6 text-blue-600" />;
      case 'browser':
        return <Monitor className="w-6 h-6 text-gray-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    }
  };

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
                <h1 className="text-2xl font-bold text-gray-800">Telegram Debug v12</h1>
                <p className="text-gray-600">Диагностика middleware детекции</p>
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
              {getEnvironmentIcon()}
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
            <h3 className="font-semibold text-gray-800 mb-3">🔧 Решение Middleware v12:</h3>
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
        </div>

        {/* Detection Results */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Результаты детекции v12</h3>
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔎 User Agent паттерны v12</h3>
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

        {/* User Agent Analysis */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🤖 User Agent Анализ</h3>
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
              <h4 className="font-medium text-gray-700 mb-2">Регулярные выражения:</h4>
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">
                    {diagnosticData.detectionResults.patterns.telegramBot ? '✅' : '❌'}
                  </span>
                  <span className="font-mono text-xs">/^TelegramBot/</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">
                    {diagnosticData.detectionResults.patterns.tdesktop ? '✅' : '❌'}
                  </span>
                  <span className="font-mono text-xs">/tdesktop/i</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">
                    {diagnosticData.detectionResults.patterns.telegramAndroid ? '✅' : '❌'}
                  </span>
                  <span className="font-mono text-xs">/Telegram-Android\//</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">
                    {diagnosticData.detectionResults.patterns.telegramIOS ? '✅' : '❌'}
                  </span>
                  <span className="font-mono text-xs">/Safari\/[\d.]+ Telegram [\d.]+/</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Params */}
        {Array.from(diagnosticData.searchParams.entries()).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 URL параметры</h3>
            <div className="space-y-2">
              {Array.from(diagnosticData.searchParams.entries()).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-medium text-gray-700 min-w-0 w-32">{key}:</span>
                  <span className="text-gray-600 break-all">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WebApp Object */}
        {diagnosticData.telegramWebApp && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📱 Telegram WebApp Object</h3>
            <div className="bg-gray-50 rounded p-3">
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(diagnosticData.telegramWebApp, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 Тестовые действия</h3>
          <div className="grid md:grid-cols-4 gap-3">
            <a
              href="/tg"
              className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Перейти на /tg
            </a>
            <a
              href="/tg?startapp=test"
              className="inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              /tg с параметром
            </a>
            <a
              href="/tg-redirect"
              className="inline-flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              /tg-redirect
            </a>
            <a
              href="/tg?_debug=true"
              className="inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              /tg debug режим
            </a>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Тестирование:</strong> Попробуйте открыть <code>/tg</code> в разных клиентах:
              обычный браузер, Telegram Desktop, мобильный Telegram. Middleware v12 должен
              правильно определить окружение и либо пропустить запрос, либо сделать редирект.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
