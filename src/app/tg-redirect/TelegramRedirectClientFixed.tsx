'use client';

import { useEffect, useState, useCallback } from 'react';
import { ExternalLink, Smartphone, Download, Timer, CheckCircle, AlertTriangle } from 'lucide-react';

interface TelegramRedirectClientProps {
  startParam: string;
  botUsername: string;
  appName: string;
  detectedAs?: string;      // Новый параметр от middleware v15
  wasRedirected?: boolean;  // Флаг что пользователь был перенаправлен
}

type EnvironmentType = 'browser' | 'telegram-web' | 'mini-app';

/**
 * ✅ ОБНОВЛЕННЫЙ Client Component v15 для Hybrid Middleware v15
 * 
 * НОВЫЕ ВОЗМОЖНОСТИ v15:
 * - ✅ Поддержка новых флагов от middleware v15 (detectedAs, wasRedirected)
 * - ✅ Улучшенная логика определения среды с учетом серверной детекции
 * - ✅ Более точная обработка результатов JavaScript детекции
 * - ✅ Полная совместимость с 3-уровневой системой детекции
 */
export default function TelegramRedirectClientFixed({ 
  startParam, 
  botUsername, 
  appName,
  detectedAs = 'unknown',
  wasRedirected = false
}: TelegramRedirectClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [userAgent, setUserAgent] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [environmentType, setEnvironmentType] = useState<EnvironmentType>('browser');
  const [autoMiniAppAttempted, setAutoMiniAppAttempted] = useState(false);
  const [detectionMethod, setDetectionMethod] = useState('server');
  
  // ✅ ОБНОВЛЕННАЯ логика определения среды с учетом middleware v15
  const detectEnvironment = useCallback((): EnvironmentType => {
    if (typeof window === 'undefined') return 'browser';
    
    const ua = navigator.userAgent;
    const pathname = window.location.pathname;
    const telegramWebApp = (window as any)?.Telegram?.WebApp;
    
    console.log('🔍 v15: Определение среды для redirect страницы:', {
      pathname,
      detectedAs,
      wasRedirected,
      userAgent: ua.substring(0, 60) + '...',
      hasWebApp: !!telegramWebApp,
      webAppVersion: telegramWebApp?.version,
      hasInitData: !!telegramWebApp?.initData,
      middlewareDetection: detectedAs
    });
    
    // ✅ Приоритет серверной детекции от middleware v15
    if (detectedAs === 'browser') {
      console.log('📍 v15: Server detection: обычный браузер (100% точность)');
      setDetectionMethod('server-browser');
      return 'browser';
    }
    
    if (detectedAs === 'telegram') {
      console.log('📍 v15: Server detection: Telegram клиент (100% точность)');
      setDetectionMethod('server-telegram');
      return 'telegram-web';
    }
    
    // ✅ Клиентская детекция для неопределенных случаев
    const isRedirectPage = pathname === '/tg-redirect' || pathname.includes('tg-redirect');
    if (isRedirectPage) {
      console.log('📍 v15: Redirect страница - выполняем клиентскую детекцию');
      
      // Проверяем наличие Telegram WebApp объекта
      const hasTelegramWebApp = telegramWebApp && 
                               telegramWebApp.version && 
                               typeof telegramWebApp.ready === 'function';
      
      if (hasTelegramWebApp) {
        console.log('✅ v15: Telegram WebApp API обнаружен');
        setDetectionMethod('client-webapp');
        return 'telegram-web';
      }
      
      // Проверяем User-Agent паттерны (клиентская детекция)
      const isTelegramUA = ua.includes('TelegramDesktop') ||
                          ua.includes('Telegram Desktop') ||
                          ua.includes('Telegram/') ||
                          ua.includes('TelegramBot') ||
                          ua.includes('Telegram-Android');
      
      if (isTelegramUA) {
        console.log('✅ v15: Telegram клиент по User-Agent');
        setDetectionMethod('client-useragent');
        return 'telegram-web';
      }
      
      // Проверяем наличие Telegram-специфичных объектов
      const hasTelegramProxy = (window as any)?.TelegramWebviewProxy ||
                              (window as any)?.TelegramWebviewProxyProto ||
                              (window as any)?.TelegramWebview;
      
      if (hasTelegramProxy) {
        console.log('✅ v15: Telegram Webview обнаружен');
        setDetectionMethod('client-proxy');
        return 'telegram-web';
      }
      
      console.log('🌐 v15: Клиентская детекция - обычный браузер');
      setDetectionMethod('client-browser');
      return 'browser';
    }
    
    // ✅ Для НЕ-redirect страниц проверяем настоящий Mini App
    const webAppForMiniCheck = (window as any)?.Telegram?.WebApp;
    const hasValidWebApp = webAppForMiniCheck && 
                          webAppForMiniCheck.version && 
                          typeof webAppForMiniCheck.ready === 'function';
    
    if (hasValidWebApp && webAppForMiniCheck.initDataUnsafe) {
      const hasUserData = webAppForMiniCheck.initDataUnsafe.user ||
                         webAppForMiniCheck.initData;
      
      if (hasUserData) {
        console.log('✅ v15: Настоящий Mini App обнаружен');
        setDetectionMethod('client-miniapp');
        return 'mini-app';
      }
    }
    
    // ✅ Fallback логика
    const hasTelegramWebAppForFallback = telegramWebApp && 
                                        telegramWebApp.version && 
                                        typeof telegramWebApp.ready === 'function';
                                        
    const isTelegramBrowser = hasTelegramWebAppForFallback ||
      ua.includes('TelegramDesktop') ||
      ua.includes('Telegram/') ||
      ua.includes('TelegramBot');
    
    if (isTelegramBrowser) {
      console.log('📱 v15: Telegram браузер (fallback)');
      setDetectionMethod('client-fallback-telegram');
      return 'telegram-web';
    }
    
    console.log('🌐 v15: Обычный браузер (fallback)');
    setDetectionMethod('client-fallback-browser');
    return 'browser';
  }, [detectedAs, wasRedirected]);
  
  const tryOpenMiniApp = useCallback(() => {
    try {
      console.log('🎯 v15: Попытка открыть Mini App из Telegram клиента');
      
      const webApp = (window as any)?.Telegram?.WebApp;
      const miniAppUrl = `https://t.me/${botUsername}/${appName}?startapp=${startParam}`;
      
      console.log('🔗 v15: Открываем Mini App URL:', miniAppUrl);
      
      // Метод 1: Через Telegram WebApp API (приоритет)
      if (webApp && typeof webApp.openTelegramLink === 'function') {
        console.log('🎯 v15: Используем WebApp.openTelegramLink()');
        webApp.openTelegramLink(miniAppUrl);
        return true;
      }
      
      // Метод 2: Через WebApp.openLink (альтернатива)
      if (webApp && typeof webApp.openLink === 'function') {
        console.log('🎯 v15: Используем WebApp.openLink()');
        webApp.openLink(miniAppUrl);
        return true;
      }
      
      // Метод 3: Прямой редирект (fallback)
      console.log('🎯 v15: Прямой редирект window.location.href');
      window.location.href = miniAppUrl;
      return true;
      
    } catch (error) {
      console.error('❌ v15: Ошибка открытия Mini App:', error);
      return false;
    }
  }, [botUsername, appName, startParam]);

  const handleTelegramRedirect = useCallback(() => {
    if (redirectAttempted) {
      console.log('⏭️ v15: Редирект уже выполнен');
      return;
    }

    console.log('🔄 v15: Выполняем редирект в Telegram');
    setRedirectAttempted(true);

    try {
      const telegramUrl = `https://t.me/${botUsername}/${appName}?startapp=${startParam}`;
      console.log('🚀 v15: Открываем Telegram URL:', telegramUrl);
      
      if (typeof window !== 'undefined') {
        window.location.href = telegramUrl;
      }
    } catch (error) {
      console.error('❌ v15: Ошибка редиректа:', error);
    }
  }, [botUsername, appName, startParam, redirectAttempted]);

  const handleManualClick = useCallback(() => {
    console.log('👆 v15: Ручное нажатие на кнопку');
    
    if (environmentType === 'telegram-web') {
      tryOpenMiniApp();
    } else {
      handleTelegramRedirect();
    }
  }, [environmentType, tryOpenMiniApp, handleTelegramRedirect]);
  
  // ✅ Инициализация с учетом middleware v15
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      setUserAgent(ua);
      
      const envType = detectEnvironment();
      setEnvironmentType(envType);
      
      console.log('📱 TG-Redirect Client v15 инициализирован:', {
        userAgent: ua.substring(0, 60) + '...',
        startParam,
        detectedAs,
        wasRedirected,
        environmentType: envType,
        detectionMethod,
        url: window.location.href
      });
    }
  }, [detectEnvironment, startParam, detectedAs, wasRedirected, detectionMethod]);
  
  // ✅ Автоматический запуск Mini App для Telegram клиентов
  useEffect(() => {
    if (!isMounted || autoMiniAppAttempted) return;
    
    if (environmentType === 'telegram-web') {
      console.log('🚀 v15: Telegram клиент обнаружен - автоматически запускаем Mini App');
      setAutoMiniAppAttempted(true);
      
      // Задержка для стабильности
      setTimeout(() => {
        const success = tryOpenMiniApp();
        if (success) {
          console.log('✅ v15: Команда запуска Mini App отправлена');
        } else {
          console.log('⚠️ v15: Не удалось запустить Mini App автоматически');
        }
      }, 1000);
    }
  }, [isMounted, environmentType, autoMiniAppAttempted, tryOpenMiniApp]);
  
  // ✅ Автоматический редирект для обычного браузера  
  useEffect(() => {
    if (!isMounted || environmentType !== 'browser') return;
    if (redirectAttempted) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTelegramRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isMounted, environmentType, redirectAttempted, handleTelegramRedirect]);
  
  const isIOS = userAgent.includes('iPhone') || userAgent.includes('iPad');
  const isAndroid = userAgent.includes('Android');
  const isMobile = isIOS || isAndroid;
  
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // ✅ Mini App случай (не должен происходить на redirect странице)
  if (environmentType === 'mini-app') {
    console.error('🚨 ОШИБКА v15: Mini App обнаружен на redirect странице - это неправильно!');
    setEnvironmentType('telegram-web');
    return null;
  }
  
  // ✅ Telegram клиент (основной случай для redirect страницы)
  if (environmentType === 'telegram-web') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">3GIS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Запускаем 3GIS Mini App
          </h1>
          <p className="text-gray-600 mb-4">
            Вы в Telegram! Автоматически открываем Mini App с русскоязычными заведениями
          </p>
          
          {/* Информация о детекции */}
          {detectedAs && (
            <div className="mb-4 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Детекция: {detectedAs === 'telegram' ? 'Telegram клиент' : detectedAs}
              </div>
              {detectionMethod && (
                <div className="text-xs text-green-600 mt-1">
                  Метод: {detectionMethod}
                </div>
              )}
            </div>
          )}
          
          {startParam && (
            <div className="mt-3 mb-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              Параметр запуска: {startParam}
            </div>
          )}
          
          {autoMiniAppAttempted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center text-green-700 mb-2">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">✅ Команда запуска отправлена</span>
              </div>
              <p className="text-sm text-green-600">
                3GIS Mini App должен открыться автоматически через несколько секунд
              </p>
              <p className="text-xs text-green-500 mt-2">
                Если не открылся - нажмите кнопку ниже
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center text-blue-700 mb-2">
                <Timer className="w-5 h-5 mr-2 animate-spin" />
                <span className="font-medium">🚀 Подготовка к запуску</span>
              </div>
              <p className="text-sm text-blue-600">
                Инициализируем запуск Mini App...
              </p>
            </div>
          )}

          <button
            onClick={handleManualClick}
            className="w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Открыть 3GIS Mini App
          </button>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>📱 3GIS - русскоязычный справочник организаций в США</p>
            <p className="text-xs mt-1">Рестораны • Врачи • Юристы • Красота • Авто • Финансы</p>
          </div>
          
          {/* Debug info для development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 pt-4 border-t">
              <details className="text-left">
                <summary className="text-xs text-gray-400 cursor-pointer">
                  🔧 Debug Info v15 (Hybrid Middleware)
                </summary>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p><strong>Environment:</strong> {environmentType}</p>
                  <p><strong>Detected As:</strong> {detectedAs}</p>
                  <p><strong>Was Redirected:</strong> {wasRedirected ? 'да' : 'нет'}</p>
                  <p><strong>Detection Method:</strong> {detectionMethod}</p>
                  <p><strong>WebApp Available:</strong> {(window as any)?.Telegram?.WebApp ? 'да' : 'нет'}</p>
                  <p><strong>WebApp Version:</strong> {(window as any)?.Telegram?.WebApp?.version || 'н/д'}</p>
                  <p><strong>Start Param:</strong> {startParam || 'отсутствует'}</p>
                  <p><strong>Auto Attempted:</strong> {autoMiniAppAttempted ? 'да' : 'нет'}</p>
                  <p><strong>User Agent:</strong> {userAgent.substring(0, 40)}...</p>
                </div>
              </details>
              
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href="/tg-debug"
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-center"
                >
                  🔍 Диагностика
                </a>
                <a
                  href="/tg-detect"
                  className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-center"
                >
                  🤔 JS Детекция
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // ✅ Обычный браузер
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">3GIS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            3GIS Mini App
          </h1>
          <p className="text-gray-600">
            Русскоязычный справочник организаций в США
          </p>
          
          {/* Информация о детекции */}
          {detectedAs === 'browser' && (
            <div className="mt-3 mb-4 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm">
              <div className="flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Обнаружен обычный браузер
              </div>
              <div className="text-xs text-orange-600 mt-1">
                Для лучшего опыта используйте Telegram
              </div>
            </div>
          )}
          
          {startParam && (
            <div className="mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              Параметр: {startParam}
            </div>
          )}
        </div>

        {/* Автоматический редирект индикатор */}
        {!redirectAttempted && countdown > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
            <div className="flex items-center justify-center mb-2">
              <Timer className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">
                Автоматическое перенаправление
              </span>
            </div>
            <div className="text-2xl font-bold text-green-700 mb-2">
              {countdown}
            </div>
            <p className="text-sm text-green-600 mb-3">
              Перенаправляем в Telegram через {countdown} сек...
            </p>
            <button 
              onClick={handleManualClick}
              className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
            >
              Перейти сейчас
            </button>
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={handleManualClick}
            disabled={redirectAttempted}
            className="w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            {redirectAttempted ? 'Перенаправление выполнено' : 'Открыть в Telegram'}
          </button>
        </div>

        {/* Инструкции для устройств */}
        {isMobile ? (
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center">
              <Smartphone className="w-4 h-4 mr-2" />
              {isIOS ? 'Для iPhone/iPad:' : 'Для Android:'}
            </h3>
            <ol className="text-sm text-green-700 text-left space-y-1">
              <li>1. Нажмите кнопку "Открыть в Telegram" выше</li>
              <li>2. В диалоге выберите "Открыть в Telegram"</li>
              <li>3. Если Telegram не установлен - установите из {isIOS ? 'App Store' : 'Google Play'}</li>
              <li>4. Mini App откроется автоматически</li>
            </ol>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">
              На компьютере:
            </h3>
            <ol className="text-sm text-gray-600 text-left space-y-1">
              <li>1. Установите Telegram Desktop</li>
              <li>2. Нажмите "Открыть в Telegram"</li>
              <li>3. Найдите @{botUsername} и запустите Mini App</li>
              <li>4. Или используйте веб-версию Telegram</li>
            </ol>
          </div>
        )}

        {/* Ссылка для скачивания Telegram */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500 mb-3">
            Нет Telegram?
          </p>
          <a
            href={isIOS 
              ? "https://apps.apple.com/app/telegram-messenger/id686449807"
              : isAndroid 
              ? "https://play.google.com/store/apps/details?id=org.telegram.messenger"
              : "https://desktop.telegram.org/"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-500 hover:text-blue-600 font-medium transition-colors"
          >
            <Download className="w-4 h-4 mr-1" />
            Скачать Telegram
          </a>
          
          {/* Ссылки на диагностику */}
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-gray-500 mb-2">Отладка:</p>
            <div className="flex gap-2">
              <a
                href="/tg-debug"
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                🔍 Диагностика
              </a>
              <a
                href="/tg-detect"
                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
              >
                🤔 JS Детекция
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
