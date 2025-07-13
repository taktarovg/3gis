'use client';

import { useEffect, useState, useCallback } from 'react';
import { ExternalLink, Smartphone, Download, Timer, AlertCircle, CheckCircle } from 'lucide-react';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import { openTelegramLink, openLink } from '@telegram-apps/sdk';

interface TelegramRedirectClientProps {
  startParam: string;
  botUsername: string;
  appName: string;
}

/**
 * ✅ ИСПРАВЛЕН Client Component с правильным определением Telegram среды
 * 
 * ИСПРАВЛЕНИЯ v3:
 * - Добавлено использование @telegram-apps/sdk для openTelegramLink
 * - Правильное различение "веб-браузер в Telegram" vs "Mini App в Telegram"
 * - Автоматическое открытие Mini App при обнаружении Telegram среды
 * - Улучшенная логика определения среды
 * - Исправлена ошибка viewport в metadata
 */
export default function TelegramRedirectClient({ 
  startParam, 
  botUsername, 
  appName 
}: TelegramRedirectClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [userAgent, setUserAgent] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [environmentType, setEnvironmentType] = useState<'browser' | 'telegram-web' | 'mini-app'>('browser');
  const [autoMiniAppAttempted, setAutoMiniAppAttempted] = useState(false);
  
  // ✅ ПРАВИЛЬНОЕ использование useLaunchParams с SSR флагом
  const launchParams = useLaunchParams(true); // SSR флаг для Next.js 15
  
  // ✅ Улучшенная функция определения среды
  const detectEnvironment = useCallback(() => {
    if (typeof window === 'undefined') return 'browser';
    
    const ua = navigator.userAgent;
    const searchParams = new URLSearchParams(window.location.search);
    const hasWebAppData = searchParams.has('tgWebAppData') || searchParams.has('tgWebAppVersion');
    
    // ✅ 1. Проверяем НАСТОЯЩИЙ Mini App (с инициализированным WebApp API)
    const hasTelegramWebApp = !!(window as any)?.Telegram?.WebApp;
    const webApp = (window as any)?.Telegram?.WebApp;
    const isWebAppInitialized = webApp && webApp.initData && webApp.version;
    
    // ✅ 2. Проверяем launch params из SDK
    const hasLaunchParams = launchParams && launchParams.tgWebAppData;
    
    // ✅ 3. Проверяем Telegram окружение (браузер внутри Telegram)
    const isTelegramBrowser = 
      ua.includes('TelegramBot') || 
      ua.includes('Telegram/') ||
      ua.includes('tgWebApp') ||
      hasWebAppData ||
      // Дополнительные проверки для Telegram браузера
      ua.includes('TgWebView') ||
      window.location.href.includes('tgWebAppPlatform=');
    
    console.log('🔍 Environment Detection:', {
      userAgent: ua.substring(0, 60) + '...',
      hasTelegramWebApp,
      isWebAppInitialized,
      hasLaunchParams,
      isTelegramBrowser,
      hasWebAppData,
      webAppVersion: webApp?.version,
      webAppInitData: webApp?.initData ? 'есть' : 'нет',
      launchParams: launchParams ? 'есть' : 'нет'
    });
    
    // ✅ Определяем тип среды
    if (isWebAppInitialized && hasLaunchParams) {
      return 'mini-app'; // НАСТОЯЩИЙ Mini App
    } else if (isTelegramBrowser || hasTelegramWebApp) {
      return 'telegram-web'; // Веб-браузер внутри Telegram
    } else {
      return 'browser'; // Обычный браузер
    }
  }, [launchParams]);
  
  // ✅ Безопасная инициализация клиентской среды
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      setUserAgent(ua);
      
      const envType = detectEnvironment();
      setEnvironmentType(envType);
      
      console.log('📱 TG-Redirect Client инициализирован:', {
        userAgent: ua.substring(0, 60) + '...',
        startParam,
        environmentType: envType,
        launchParams: launchParams ? 'доступны' : 'недоступны',
        url: window.location.href
      });
    }
  }, [detectEnvironment, launchParams, startParam]);
  
  // ✅ Автоматическое открытие Mini App если мы в Telegram браузере
  useEffect(() => {
    if (!isMounted || autoMiniAppAttempted) return;
    
    if (environmentType === 'telegram-web') {
      console.log('🎯 Обнаружен Telegram браузер - попытка автоматического открытия Mini App');
      setAutoMiniAppAttempted(true);
      
      // Небольшая задержка для лучшего UX
      setTimeout(() => {
        tryOpenMiniApp();
      }, 1000);
    }
  }, [isMounted, environmentType, autoMiniAppAttempted]);
  
  // ✅ Функция автоматического открытия Mini App с использованием @telegram-apps/sdk
  const tryOpenMiniApp = useCallback(async () => {
    try {
      const actualStartParam = startParam || launchParams?.tgWebAppStartParam || '';
      const miniAppUrl = actualStartParam 
        ? `https://t.me/${botUsername}/${appName}?startapp=${encodeURIComponent(actualStartParam)}`
        : `https://t.me/${botUsername}/${appName}`;
      
      console.log('🚀 Попытка открытия через @telegram-apps/sdk');
      
      // ✅ Попытка 1: Использование openTelegramLink из SDK
      if (openTelegramLink.isAvailable()) {
        openTelegramLink(miniAppUrl);
        console.log('✅ openTelegramLink (SDK) выполнен:', miniAppUrl);
        return;
      }
      
      // ✅ Попытка 2: Использование openLink из SDK
      if (openLink.isAvailable()) {
        openLink(miniAppUrl);
        console.log('✅ openLink (SDK) выполнен:', miniAppUrl);
        return;
      }
      
      // ✅ Попытка 3: Fallback на Telegram WebApp API
      const webApp = (window as any)?.Telegram?.WebApp;
      if (webApp) {
        console.log('🔄 Fallback на Telegram WebApp API');
        
        if (webApp.openTelegramLink) {
          webApp.openTelegramLink(miniAppUrl);
          console.log('✅ webApp.openTelegramLink выполнен:', miniAppUrl);
          return;
        }
        
        if (webApp.openLink) {
          webApp.openLink(miniAppUrl);
          console.log('✅ webApp.openLink выполнен:', miniAppUrl);
          return;
        }
      }
      
      // ✅ Попытка 4: Прямой редирект
      console.log('🔄 Fallback на прямой редирект');
      window.location.href = miniAppUrl;
      console.log('✅ Прямой редирект выполнен:', miniAppUrl);
      
    } catch (error) {
      console.error('❌ Ошибка автоматического открытия Mini App:', error);
      // Fallback на обычный редирект
      handleTelegramRedirect();
    }
  }, [startParam, launchParams, botUsername, appName]);
  
  // ✅ Автоматический редирект для обычного браузера
  useEffect(() => {
    if (!isMounted || environmentType !== 'browser') return;
    if (redirectAttempted) return;
    
    // ✅ Автоматический редирект только для обычного браузера
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
  }, [isMounted, environmentType, redirectAttempted]);
  
  // ✅ Безопасная функция редиректа
  const handleTelegramRedirect = useCallback(() => {
    if (redirectAttempted) return;
    
    setRedirectAttempted(true);
    
    // ✅ Используем startParam из props или launchParams
    const actualStartParam = startParam || launchParams?.tgWebAppStartParam || '';
    
    const telegramUrl = actualStartParam 
      ? `https://t.me/${botUsername}/${appName}?startapp=${encodeURIComponent(actualStartParam)}`
      : `https://t.me/${botUsername}/${appName}`;
    
    console.log('🚀 Выполняем редирект в Telegram:', {
      url: telegramUrl,
      startParam: actualStartParam,
      method: 'window.location.href',
      environmentType
    });
    
    try {
      // ✅ Универсальный подход для всех устройств
      window.location.href = telegramUrl;
    } catch (error) {
      console.error('❌ Ошибка редиректа:', error);
      // Fallback - открываем в новом окне
      window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    }
  }, [redirectAttempted, startParam, launchParams, botUsername, appName, environmentType]);
  
  // ✅ Безопасная обработка мануального клика
  const handleManualClick = useCallback(() => {
    console.log('📊 Мануальный клик по кнопке редиректа');
    if (environmentType === 'telegram-web') {
      tryOpenMiniApp();
    } else {
      handleTelegramRedirect();
    }
  }, [environmentType, tryOpenMiniApp, handleTelegramRedirect]);
  
  // ✅ Определяем тип устройства
  const isIOS = userAgent.includes('iPhone') || userAgent.includes('iPad');
  const isAndroid = userAgent.includes('Android');
  const isMobile = isIOS || isAndroid;
  
  // ✅ Loading state
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // ✅ Если это полноценный Mini App - перенаправляем на главную
  if (environmentType === 'mini-app') {
    // Автоматически перенаправляем на главную страницу Mini App
    useEffect(() => {
      const timer = setTimeout(() => {
        window.location.href = '/tg';
      }, 2000);
      
      return () => clearTimeout(timer);
    }, []);
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Mini App активен!
          </h1>
          <p className="text-gray-600 mb-4">
            Перенаправляем на главную страницу...
          </p>
          <div className="animate-pulse bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-center text-green-700 mb-2">
              <Timer className="w-5 h-5 mr-2" />
              <span className="font-medium">Загрузка интерфейса</span>
            </div>
            <p className="text-sm text-green-600">
              Если перенаправление не произошло, нажмите кнопку ниже
            </p>
            <button 
              onClick={() => window.location.href = '/tg'}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
            >
              Перейти к Mini App
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // ✅ Если в Telegram браузере - показываем статус автоматического открытия
  if (environmentType === 'telegram-web') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">3GIS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Открываем Mini App
          </h1>
          <p className="text-gray-600 mb-4">
            Вы в Telegram! Автоматически открываем 3GIS Mini App
          </p>
          
          {autoMiniAppAttempted ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center text-blue-700 mb-2">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Команда отправлена</span>
              </div>
              <p className="text-sm text-blue-600 mb-3">
                Mini App должен открыться автоматически
              </p>
              {startParam && (
                <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  Параметр: {startParam}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center text-green-700 mb-2">
                <Timer className="w-5 h-5 mr-2 animate-spin" />
                <span className="font-medium">Подготовка к запуску</span>
              </div>
              <p className="text-sm text-green-600">
                Инициализируем Mini App...
              </p>
            </div>
          )}

          {/* Мануальная кнопка на случай проблем */}
          <div className="mb-4">
            <button
              onClick={handleManualClick}
              className="w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Открыть Mini App вручную
            </button>
          </div>

          {/* Альтернативные способы */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              Если автоматическое открытие не сработало:
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div>1. Найдите @{botUsername} в поиске Telegram</div>
              <div>2. Нажмите кнопку "Запустить" или "Menu"</div>
              <div>3. Выберите пункт меню для запуска Mini App</div>
            </div>
          </div>

          {/* ✅ Техническая информация (только в development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-4 border-t">
              <details className="text-left">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                  🔧 Техническая информация
                </summary>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p><strong>Environment Type:</strong> {environmentType}</p>
                  <p><strong>Auto Mini App Attempted:</strong> {autoMiniAppAttempted ? 'да' : 'нет'}</p>
                  <p><strong>User Agent:</strong> {userAgent.substring(0, 60)}...</p>
                  <p><strong>Start Param:</strong> {startParam || 'отсутствует'}</p>
                  <p><strong>Launch Params:</strong> {launchParams ? 'доступны' : 'недоступны'}</p>
                  <p><strong>Telegram WebApp:</strong> {(window as any)?.Telegram?.WebApp ? 'доступен' : 'недоступен'}</p>
                  <p><strong>openTelegramLink SDK:</strong> {openTelegramLink.isAvailable() ? 'доступен' : 'недоступен'}</p>
                  <p><strong>openLink SDK:</strong> {openLink.isAvailable() ? 'доступен' : 'недоступен'}</p>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // ✅ Обычный браузер - показываем стандартную страницу редиректа
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 text-center">
        {/* Лого и заголовок */}
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
          {startParam && (
            <div className="mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              Параметр: {startParam}
            </div>
          )}
        </div>

        {/* ✅ Автоматический редирект индикатор */}
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

        {/* ✅ Главная кнопка - безопасный event handler */}
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

        {/* Статус редиректа */}
        {redirectAttempted && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-center text-yellow-700 mb-1">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                Перенаправление выполнено
              </span>
            </div>
            <p className="text-xs text-yellow-600">
              Если автоматический переход не сработал, попробуйте еще раз
            </p>
          </div>
        )}

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

        {/* Альтернативные способы */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-800 mb-3">
            Альтернативные способы:
          </h3>
          <div className="text-sm text-blue-700 space-y-2">
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <span>📱 Прямая ссылка:</span>
              <a 
                href={`https://t.me/${botUsername}`}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                target="_blank" 
                rel="noopener noreferrer"
              >
                t.me/{botUsername}
              </a>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded border">
              <span>🌐 Веб-версия:</span>
              <a 
                href={`https://web.telegram.org/k/#@${botUsername}`}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                target="_blank" 
                rel="noopener noreferrer"
              >
                web.telegram.org
              </a>
            </div>
          </div>
        </div>

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
        </div>

        {/* ✅ Техническая информация (только в development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 pt-4 border-t">
            <details className="text-left">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                🔧 Техническая информация
              </summary>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p><strong>Environment Type:</strong> {environmentType}</p>
                <p><strong>User Agent:</strong> {userAgent.substring(0, 60)}...</p>
                <p><strong>Start Param (props):</strong> {startParam || 'отсутствует'}</p>
                <p><strong>Launch Params (SDK):</strong> {launchParams ? 'доступны' : 'недоступны'}</p>
                <p><strong>Redirect Attempted:</strong> {redirectAttempted ? 'да' : 'нет'}</p>
                <p><strong>Countdown:</strong> {countdown}</p>
                <p><strong>Telegram WebApp:</strong> {(window as any)?.Telegram?.WebApp ? 'доступен' : 'недоступен'}</p>
              </div>
            </details>
          </div>
        )}

        {/* Дополнительная информация */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-gray-400">
            3GIS работает как Mini App внутри Telegram для удобства и безопасности.
            {startParam && (
              <span className="block mt-1">
                Эта ссылка содержит специальные параметры для прямого перехода.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
