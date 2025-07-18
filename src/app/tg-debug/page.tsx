'use client';

import { useEffect, useState, useCallback } from 'react';
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
      telegramDesktop: boolean;
    };
  };
  middlewareDecision: {
    detectionLevel: 'CONFIRMED' | 'UNKNOWN' | 'NOT_TELEGRAM';
    wouldRedirect: boolean;
    redirectTarget: string;
    reason: string;
    suggestion?: string;
  };
}

/**
 * 🔍 ОБНОВЛЕННАЯ ДИАГНОСТИЧЕСКАЯ СТРАНИЦА v15 для Hybrid Middleware
 * 
 * НОВЫЕ ВОЗМОЖНОСТИ v15:
 * - ✅ Поддержка 3-уровневой системы детекции
 * - ✅ Симуляция работы middleware v15
 * - ✅ Диагностика JavaScript детекции
 * - ✅ Подробный анализ новых User-Agent паттернов
 */
export default function TelegramDebugPage() {
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const analyzeTelegramDetection = (userAgent: string, searchParams: URLSearchParams) => {
    // ✅ Точно та же логика что в middleware v15
    
    // УРОВЕНЬ 1: Параметрическая детекция
    const hasExplicitParams = [
      'startapp', 'start_param', 'tgWebAppData', 'tgWebAppVersion',
      'tgWebAppStartParam', 'tgWebAppPlatform', 'tgWebAppThemeParams',
      'tg', 'telegram', '_telegramApp'
    ].some(param => searchParams.has(param));
    
    // УРОВЕНЬ 2: User-Agent детекция (обновленные паттерны 2024-2025)
    const patterns = {
      telegramBot: /^TelegramBot/.test(userAgent),
      tdesktop: /tdesktop/i.test(userAgent),
      telegramAndroid: /Telegram-Android\/[\d.]+/.test(userAgent),
      telegramIOS: /Safari\/[\d.]+ Telegram [\d.]+/.test(userAgent),
      telegramDesktop: /TelegramDesktop/i.test(userAgent),
    };
    
    const hasTelegramUA = Object.values(patterns).some(Boolean);
    
    // УРОВЕНЬ 3: Заголовки и referer
    const hasStrictReferer = document.referrer?.includes('tg://') ||
                            document.referrer?.includes('t.me/') ||
                            document.referrer?.includes('telegram.org') ||
                            document.referrer?.includes('web.telegram.org');
    
    const detectionResults = {
      hasWebAppParams: hasExplicitParams,
      hasTelegramUA,
      hasTelegramSpecific: hasStrictReferer,
      hasWebAppObject: !!(window as any)?.Telegram?.WebApp,
      hasRefererTelegram: hasStrictReferer,
      patterns
    };
    
    // ✅ Симуляция middleware v15 логики
    let detectionLevel: 'CONFIRMED' | 'UNKNOWN' | 'NOT_TELEGRAM' = 'NOT_TELEGRAM';
    let wouldRedirect = true;
    let redirectTarget = '/tg-redirect';
    let reason = '';
    let suggestion = '';
    
    // УРОВЕНЬ 1: Параметрическая детекция (100% надежность)
    if (hasExplicitParams) {
      detectionLevel = 'CONFIRMED';
      wouldRedirect = false;
      reason = 'LEVEL 1 - Явные Telegram параметры обнаружены (100% надежность)';
    }
    // УРОВЕНЬ 2: User-Agent детекция
    else if (hasTelegramUA) {
      detectionLevel = 'CONFIRMED';
      wouldRedirect = false;
      reason = 'LEVEL 2 - Telegram User-Agent паттерн обнаружен';
    }
    // УРОВЕНЬ 3: Заголовки и referer
    else if (hasStrictReferer) {
      detectionLevel = 'CONFIRMED';
      wouldRedirect = false;
      reason = 'LEVEL 3 - Telegram referer или заголовки обнаружены';
    }
    // АНАЛИЗ НЕОПРЕДЕЛЕННЫХ СЛУЧАЕВ
    else {
      const isLikelyDesktop = userAgent.includes('Chrome') && 
                              userAgent.includes('Safari') &&
                              !userAgent.includes('Mobile') &&
                              (userAgent.includes('Windows') || userAgent.includes('macOS') || userAgent.includes('Linux'));
      
      const isMobile = userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone');
      
      if (isLikelyDesktop || isMobile) {
        detectionLevel = 'UNKNOWN';
        wouldRedirect = true;
        redirectTarget = '/tg-detect';
        reason = `UNKNOWN - ${isLikelyDesktop ? 'Desktop' : 'Mobile'} браузер, требует JavaScript детекции`;
        suggestion = 'Будет перенаправлен на /tg-detect для JavaScript детекции';
      } else {
        detectionLevel = 'NOT_TELEGRAM';
        wouldRedirect = true;
        redirectTarget = '/tg-redirect';
        reason = 'NOT_TELEGRAM - Все проверки middleware v15 провалены';
      }
    }
    
    // ✅ Предложения для исправления
    if (detectionResults.hasWebAppObject && wouldRedirect) {
      suggestion = 'Обнаружен window.Telegram.WebApp! Добавьте ?tg=1 к URL для принудительного обхода';
    }
    
    return {
      detectionResults,
      middlewareDecision: {
        detectionLevel,
        wouldRedirect,
        redirectTarget,
        reason,
        suggestion
      }
    };
  };

  const refreshData = useCallback(() => {
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
      
      console.log('🔍 Telegram Debug Data v15:', data);
    }
  }, []); // Функция не зависит от внешних переменных, поэтому пустой массив зависимостей

  useEffect(() => {
    setIsMounted(true);
    refreshData();
  }, [refreshData]);

  const copyToClipboard = useCallback(async () => {
    if (!diagnosticData) return;
    
    const debugText = `3GIS Telegram Debug Report v15 (Hybrid Middleware)
=================================================
Timestamp: ${new Date().toISOString()}
URL: ${diagnosticData.url}
Environment: ${diagnosticData.environment}

User Agent:
${diagnosticData.userAgent}

Middleware Decision v15:
Detection Level: ${diagnosticData.middlewareDecision.detectionLevel}
Would Redirect: ${diagnosticData.middlewareDecision.wouldRedirect}
Redirect Target: ${diagnosticData.middlewareDecision.redirectTarget}
Reason: ${diagnosticData.middlewareDecision.reason}
${diagnosticData.middlewareDecision.suggestion ? `Suggestion: ${diagnosticData.middlewareDecision.suggestion}` : ''}

3-Level Detection Results v15:
- Level 1 (Parameters): ${diagnosticData.detectionResults.hasWebAppParams}
- Level 2 (User-Agent): ${diagnosticData.detectionResults.hasTelegramUA}  
- Level 3 (Headers/Referer): ${diagnosticData.detectionResults.hasTelegramSpecific}
- JavaScript (WebApp Object): ${diagnosticData.detectionResults.hasWebAppObject}

User-Agent Patterns v15:
- TelegramBot: ${diagnosticData.detectionResults.patterns.telegramBot}
- TelegramDesktop: ${diagnosticData.detectionResults.patterns.tdesktop}
- Telegram-Android: ${diagnosticData.detectionResults.patterns.telegramAndroid}
- Telegram iOS: ${diagnosticData.detectionResults.patterns.telegramIOS}

WebApp Object: ${JSON.stringify(diagnosticData.telegramWebApp, null, 2)}
Referer: ${diagnosticData.referer}`;
    
    try {
      await navigator.clipboard.writeText(debugText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [diagnosticData]);

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

  const getDetectionLevelColor = (level: string) => {
    switch (level) {
      case 'CONFIRMED':
        return 'text-green-600';
      case 'UNKNOWN':
        return 'text-yellow-600';
      case 'NOT_TELEGRAM':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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
                <h1 className="text-2xl font-bold text-gray-800">Telegram Debug v15</h1>
                <p className="text-gray-600">Hybrid Middleware - 3-уровневая детекция</p>
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

          {/* Middleware Decision v15 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">🔧 Решение Hybrid Middleware v15:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="mb-3">
                  <span className="text-sm text-gray-600">Уровень детекции:</span>
                  <div className={`font-bold text-lg ${getDetectionLevelColor(diagnosticData.middlewareDecision.detectionLevel)}`}>
                    {diagnosticData.middlewareDecision.detectionLevel}
                  </div>
                </div>
                
                <div className="mb-3">
                  <span className="text-sm text-gray-600">Действие:</span>
                  <div className={`font-medium ${diagnosticData.middlewareDecision.wouldRedirect ? 'text-orange-600' : 'text-green-600'}`}>
                    {diagnosticData.middlewareDecision.wouldRedirect 
                      ? `Редирект → ${diagnosticData.middlewareDecision.redirectTarget}`
                      : 'Пропуск через middleware ✅'
                    }
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-700">
                  <strong>Причина:</strong>
                  <p className="mt-1">{diagnosticData.middlewareDecision.reason}</p>
                  
                  {diagnosticData.middlewareDecision.suggestion && (
                    <div className="mt-2 p-2 bg-blue-100 text-blue-700 rounded text-xs">
                      💡 {diagnosticData.middlewareDecision.suggestion}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ БЫСТРОЕ РЕШЕНИЕ для проблемных случаев */}
          {diagnosticData.detectionResults.hasWebAppObject && diagnosticData.middlewareDecision.wouldRedirect && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-3">🚀 Быстрое решение - принудительный обход:</h3>
              <p className="text-sm text-blue-700 mb-3">
                Обнаружен Telegram WebApp объект, но middleware не распознал клиент. 
                Используйте эти ссылки для принудительного обхода:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/tg?tg=1"
                  className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  /tg?tg=1 (обход)
                </a>
                <a
                  href="/tg?startapp=debug"
                  className="inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  /tg?startapp=debug
                </a>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🔧 Тестовые ссылки v15</h2>
            <div className="grid md:grid-cols-4 gap-3 mb-4">
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
                /tg?tg=1 (обход)
              </a>
              <a
                href="/tg-detect"
                className="inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                /tg-detect (JS)
              </a>
              <a
                href="/middleware-test"
                className="inline-flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                Тест middleware
              </a>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">📋 Инструкция для Hybrid Middleware v15:</h4>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. <strong>CONFIRMED:</strong> Telegram клиент обнаружен - проход без редиректа</li>
                <li>2. <strong>UNKNOWN:</strong> Неопределенный случай - редирект на /tg-detect для JS детекции</li>
                <li>3. <strong>NOT_TELEGRAM:</strong> Обычный браузер - редирект на /tg-redirect</li>
                <li>4. Принудительный обход: добавьте <code>?tg=1</code> или <code>?startapp=любое_значение</code></li>
                <li>5. Новая система решает проблему Telegram Desktop через JavaScript детекцию</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
