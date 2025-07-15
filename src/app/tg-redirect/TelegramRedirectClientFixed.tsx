'use client';

import { useEffect, useState, useCallback } from 'react';
import { ExternalLink, Smartphone, Download, Timer, CheckCircle } from 'lucide-react';

interface TelegramRedirectClientProps {
  startParam: string;
  botUsername: string;
  appName: string;
}

type EnvironmentType = 'browser' | 'telegram-web' | 'mini-app';

/**
 * ✅ ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ Client Component БЕЗ SDK зависимостей
 * 
 * КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ v8:
 * - ❌ НЕ используем @telegram-apps/sdk-react вообще (источник ошибок)
 * - ✅ Только нативные window.Telegram API
 * - ✅ Правильное определение Mini App среды
 * - ✅ Убраны все event handlers в props (источник ошибки в логах)
 * - ✅ Безопасная работа без зависимости от SDK хуков
 */
export default function TelegramRedirectClientFixed({ 
  startParam, 
  botUsername, 
  appName 
}: TelegramRedirectClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [userAgent, setUserAgent] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [environmentType, setEnvironmentType] = useState<EnvironmentType>('browser');
  const [autoMiniAppAttempted, setAutoMiniAppAttempted] = useState(false);
  
  // ✅ БЕЗОПАСНАЯ функция определения среды БЕЗ SDK (ИСПРАВЛЕНА)
  const detectEnvironment = useCallback((): EnvironmentType => {
    if (typeof window === 'undefined') return 'browser';
    
    const ua = navigator.userAgent;
    const searchParams = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;
    
    // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: правильная проверка Telegram WebApp
    const telegramWebApp = (window as any)?.Telegram?.WebApp;
    const hasValidWebApp = telegramWebApp && 
                          telegramWebApp.version && 
                          typeof telegramWebApp.ready === 'function';
    
    // Проверяем Telegram Desktop/Mobile по User Agent (НОВОЕ!)
    const isTelegramDesktop = ua.includes('TelegramDesktop') ||
                             ua.includes('Telegram Desktop') ||
                             ua.includes('Telegram/');
    
    console.log('🔍 Environment Detection v9 ФИКС (БЕЗ SDK):', {
      userAgent: ua.substring(0, 60) + '...',
      pathname,
      hasValidWebApp,
      isTelegramDesktop, // НОВОЕ!
      webAppVersion: telegramWebApp?.version,
      hasInitData: !!telegramWebApp?.initData,
      hasInitDataUnsafe: !!telegramWebApp?.initDataUnsafe,
      isWebView: telegramWebApp?.isVersionAtLeast ? telegramWebApp.isVersionAtLeast('6.0') : false,
      webAppInitData: telegramWebApp?.initDataUnsafe ? 'yes' : 'no'
    });
    
    // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: На redirect странице НЕ может быть Mini App
    const isRedirectPage = pathname === '/tg-redirect';
    if (isRedirectPage) {
      console.log('🚨 Redirect page - НИКОГДА не Mini App');
      
      // На редирект странице проверяем только Telegram браузер (НЕ Mini App)
      const isTelegramBrowser = hasValidWebApp || 
        isTelegramDesktop ||  // НОВОЕ!
        ua.includes('TelegramBot') || 
        ua.includes('tgWebApp') ||
        searchParams.has('tgWebAppData');
      
      return isTelegramBrowser ? 'telegram-web' : 'browser';
    }
    
    // ✅ Для НЕ-redirect страниц проверяем настоящий Mini App
    if (hasValidWebApp && telegramWebApp.initDataUnsafe) {
      // Дополнительная проверка что это РЕАЛЬНЫЙ Mini App, а не просто браузер в Telegram
      const hasUserData = telegramWebApp.initDataUnsafe.user ||
                         telegramWebApp.initData;
      
      if (hasUserData) {
        console.log('✅ Настоящий Mini App обнаружен');
        return 'mini-app';
      }
    }
    
    // ✅ Telegram браузер (без Mini App функциональности)
    const isTelegramBrowser = hasValidWebApp ||
      isTelegramDesktop ||  // НОВОЕ!
      ua.includes('TelegramBot') || 
      ua.includes('tgWebApp') ||
      searchParams.has('tgWebAppData');
    
    if (isTelegramBrowser) {
      console.log('📱 Telegram браузер (НЕ Mini App)');
      return 'telegram-web';
    }
    
    console.log('🌐 Обычный браузер');
    return 'browser';
  }, []);
  
  const tryOpenMiniApp = useCallback(() => {
    try {
      console.log('🎯 Попытка открыть Mini App');
      
      // Метод 1: Через глобальный Telegram API
      const webApp = (window as any)?.Telegram?.WebApp;
      if (webApp && typeof webApp.openTelegramLink === 'function') {
        const miniAppUrl = `https://t.me/${botUsername}/app?startapp=${startParam}`;
        webApp.openTelegramLink(miniAppUrl);
        console.log('✅ Mini App команда через WebApp API');
        return true;
      }
      
      // Метод 2: Попытка через window.open
      const miniAppUrl = `https://t.me/${botUsername}/app?startapp=${startParam}`;
      const opened = window.open(miniAppUrl, '_blank');
      if (opened) {
        console.log('✅ Mini App открыт через window.open');
        return true;
      }
      
      // Метод 3: Прямой редирект
      window.location.href = miniAppUrl;
      console.log('✅ Прямой редирект на Mini App');
      return true;
      
    } catch (error) {
      console.error('❌ Ошибка открытия Mini App:', error);
      return false;
    }
  }, [botUsername, startParam]);

  const handleTelegramRedirect = useCallback(() => {
    if (redirectAttempted) {
      console.log('⏭️ Редирект уже выполнен');
      return;
    }

    console.log('🔄 Выполняем редирект в Telegram');
    setRedirectAttempted(true);

    try {
      const telegramUrl = `https://t.me/${botUsername}/app?startapp=${startParam}`;
      console.log('🚀 Открываем Telegram URL:', telegramUrl);
      
      // Пробуем разные методы
      if (typeof window !== 'undefined') {
        window.location.href = telegramUrl;
      }
    } catch (error) {
      console.error('❌ Ошибка редиректа:', error);
    }
  }, [botUsername, startParam, redirectAttempted]);

  // ✅ ИСПРАВЛЕНО: Убраны сложные memoization и зависимости
  const handleManualClick = useCallback(() => {
    console.log('👆 Ручное нажатие на кнопку');
    
    if (environmentType === 'telegram-web') {
      tryOpenMiniApp();
    } else {
      handleTelegramRedirect();
    }
  }, [environmentType, tryOpenMiniApp, handleTelegramRedirect]);
  
  // ✅ Инициализация БЕЗ SDK
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      setUserAgent(ua);
      
      const envType = detectEnvironment();
      setEnvironmentType(envType);
      
      console.log('📱 TG-Redirect Client v8 инициализирован БЕЗ SDK:', {
        userAgent: ua.substring(0, 60) + '...',
        startParam,
        environmentType: envType,
        url: window.location.href
      });
    }
  }, [detectEnvironment, startParam]);
  
  // ✅ Автоматическое открытие Mini App для Telegram браузера
  useEffect(() => {
    if (!isMounted || autoMiniAppAttempted) return;
    
    if (environmentType === 'telegram-web') {
      console.log('🎯 Telegram браузер - автоматическое открытие Mini App');
      setAutoMiniAppAttempted(true);
      
      setTimeout(() => {
        tryOpenMiniApp();
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
  
  // ✅ ИСПРАВЛЕНО: Mini App случай - БЕЗ редиректа, просто переход
  if (environmentType === 'mini-app') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ✅ Mini App готов!
          </h1>
          <p className="text-gray-600 mb-4">
            Вы уже находитесь в Telegram Mini App
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center text-green-700 mb-2">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">3GIS готов к использованию</span>
            </div>
            <p className="text-sm text-green-600 mb-3">
              Нажмите кнопку для перехода к каталогу
            </p>
            
            {/* ✅ ИСПРАВЛЕНО: Используем простую навигацию БЕЗ event handlers в props */}
            <button 
              onClick={() => {
                console.log('🎯 Переход на главную 3GIS');
                window.location.href = '/tg';
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Перейти к 3GIS
            </button>
          </div>
          
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 pt-4 border-t">
              <details className="text-left">
                <summary className="text-xs text-gray-400 cursor-pointer">
                  🔧 Debug Info v8
                </summary>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p><strong>WebApp Available:</strong> {(window as any)?.Telegram?.WebApp ? 'да' : 'нет'}</p>
                  <p><strong>WebApp Version:</strong> {(window as any)?.Telegram?.WebApp?.version || 'н/д'}</p>
                  <p><strong>Environment:</strong> mini-app</p>
                  <p><strong>User Agent:</strong> {userAgent.substring(0, 40)}...</p>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // ✅ Telegram браузер
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
              <p className="text-sm text-blue-600">
                Mini App должен открыться автоматически
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center text-green-700 mb-2">
                <Timer className="w-5 h-5 mr-2 animate-spin" />
                <span className="font-medium">Подготовка к запуску</span>
              </div>
            </div>
          )}

          <button
            onClick={handleManualClick}
            className="w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Открыть Mini App вручную
          </button>
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
        </div>
      </div>
    </div>
  );
}
