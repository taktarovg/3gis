// src/components/telegram/TelegramRedirectHandler.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { ExternalLink, Smartphone, Download, ArrowRight, Check, Timer } from 'lucide-react';
import { TelegramMetaTags } from '@/components/seo/TelegramMetaTags';

interface TelegramRedirectHandlerProps {
  children: React.ReactNode;
}

/**
 * ✅ УЛУЧШЕННЫЙ компонент для обработки открытия /tg ссылок в браузере
 * Исправления для корректной работы с https://www.3gis.biz/tg:
 * - Автоматический редирект в Telegram с задержкой
 * - Улучшенная UX для пользователей
 * - Правильная обработка LaunchParamsRetrieveError
 * - Поддержка всех типов устройств
 */
export function TelegramRedirectHandler({ children }: TelegramRedirectHandlerProps) {
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState<boolean | null>(null);
  const [userAgent, setUserAgent] = useState('');
  const [startParam, setStartParam] = useState<string>('');
  const [detectionComplete, setDetectionComplete] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState(3);

  // ✅ Улучшенное определение Telegram среды
  const detectTelegramEnvironment = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const ua = navigator.userAgent;
    const urlParams = new URLSearchParams(window.location.search);
    const href = window.location.href;
    
    // ✅ РАСШИРЕННЫЕ проверки для надежного определения
    const checks = {
      // Проверка 1: Telegram WebApp объект доступен
      hasWebApp: !!(window as any)?.Telegram?.WebApp,
      
      // Проверка 2: initData в WebApp (главный индикатор)
      hasInitData: !!(window as any)?.Telegram?.WebApp?.initData,
      
      // Проверка 3: URL параметры от Telegram
      hasUrlParams: urlParams.has('tgWebAppData') || 
                   urlParams.has('tgWebAppVersion') || 
                   urlParams.has('tgWebAppPlatform'),
      
      // Проверка 4: User Agent содержит Telegram
      hasTelegramUA: ua.includes('TelegramBot') || 
                    ua.includes('Telegram') ||
                    ua.includes('tgWebApp'),
      
      // Проверка 5: URL содержит tgWebApp параметры
      hasWebAppInUrl: href.includes('tgWebApp'),
      
      // Проверка 6: Referrer от Telegram
      hasTelegramReferrer: document.referrer.includes('telegram') || 
                          document.referrer.includes('t.me'),
      
      // Проверка 7: WebApp ready состояние
      isWebAppReady: !!(window as any)?.Telegram?.WebApp?.ready,
      
      // Проверка 8: Telegram platform detection
      isPlatformTelegram: !!(window as any)?.Telegram?.WebApp?.platform
    };
    
    console.log('🔍 Детальные проверки Telegram среды:', checks);
    console.log('🔍 User Agent:', ua);
    console.log('🔍 URL:', href);
    console.log('🔍 URL Params:', Object.fromEntries(urlParams.entries()));
    console.log('🔍 Referrer:', document.referrer);
    
    // ✅ Считаем что в Telegram если есть хотя бы 2 положительные проверки
    // ИЛИ если есть критичные индикаторы (initData, WebApp ready)
    const positiveChecks = Object.values(checks).filter(Boolean).length;
    const hasCriticalIndicators = checks.hasInitData || 
                                 (checks.hasWebApp && checks.isWebAppReady);
    
    const isInTelegram = positiveChecks >= 2 || hasCriticalIndicators;
    
    console.log('🔍 Результат определения среды:', {
      positiveChecks,
      hasCriticalIndicators,
      isInTelegram,
      environment: isInTelegram ? 'Telegram' : 'Browser'
    });
    
    return isInTelegram;
  }, []);

  // ✅ Формирование правильной ссылки на Telegram Mini App
  const getTelegramLink = useCallback(() => {
    const botUsername = 'ThreeGIS_bot';
    const appName = 'app';
    
    return startParam 
      ? `https://t.me/${botUsername}/${appName}?startapp=${encodeURIComponent(startParam)}`
      : `https://t.me/${botUsername}/${appName}`;
  }, [startParam]);

  // ✅ НОВОЕ: Автоматический редирект с обратным отсчетом
  const handleAutomaticRedirect = useCallback(() => {
    if (redirectAttempted) return;
    
    setRedirectAttempted(true);
    const telegramUrl = getTelegramLink();
    
    console.log('🔄 Начинаем автоматический редирект в Telegram:', telegramUrl);
    
    // Запускаем обратный отсчет
    const countdownInterval = setInterval(() => {
      setAutoRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          
          // Выполняем редирект
          console.log('🚀 Выполняем автоматический редирект в Telegram');
          
          try {
            // Для мобильных устройств пытаемся множественные подходы
            if (userAgent.includes('Mobile')) {
              // Подход 1: Прямая ссылка
              window.location.href = telegramUrl;
              
              // Подход 2: Открытие в новом окне (fallback)
              setTimeout(() => {
                window.open(telegramUrl, '_blank');
              }, 500);
              
            } else {
              // Для десктопа открываем в новой вкладке
              const newWindow = window.open(telegramUrl, '_blank');
              
              // Если не удалось открыть (блокировщик попапов), 
              // перенаправляем текущую вкладку
              setTimeout(() => {
                if (!newWindow || newWindow.closed) {
                  window.location.href = telegramUrl;
                }
              }, 1000);
            }
          } catch (error) {
            console.error('❌ Ошибка автоматического редиректа:', error);
            // Fallback - просто переходим по ссылке
            window.location.href = telegramUrl;
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
  }, [redirectAttempted, getTelegramLink, userAgent]);

  // ✅ Основная логика определения и обработки
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent;
    setUserAgent(ua);

    // Получаем startapp параметр из URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlStartParam = urlParams.get('startapp') || urlParams.get('start') || '';
    setStartParam(urlStartParam);

    console.log('🚀 TelegramRedirectHandler: начало инициализации');
    console.log('📱 User Agent:', ua);
    console.log('🔗 Start Param:', urlStartParam);

    // ✅ Даем время для полной загрузки Telegram WebApp
    const detectWithDelay = () => {
      const isInTelegram = detectTelegramEnvironment();
      setIsTelegramEnvironment(isInTelegram);
      setDetectionComplete(true);

      // Если НЕ в Telegram, запускаем автоматический редирект
      if (!isInTelegram) {
        console.log('🔍 Не в Telegram среде - запускаем автоматический редирект');
        setTimeout(handleAutomaticRedirect, 1000); // Задержка перед началом отсчета
      }
    };

    // ✅ Увеличиваем задержку для надежности определения
    const timeoutId = setTimeout(detectWithDelay, 1500);
    return () => clearTimeout(timeoutId);
  }, [detectTelegramEnvironment, handleAutomaticRedirect]);

  const isIOS = userAgent.includes('iPhone') || userAgent.includes('iPad');
  const isAndroid = userAgent.includes('Android');
  const isMobile = isIOS || isAndroid;

  // Показываем загрузку пока определяем среду
  if (isTelegramEnvironment === null || !detectionComplete) {
    return (
      <>
        <TelegramMetaTags startParam={startParam} />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-white">3GIS</span>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Проверяем среду выполнения...</p>
            <p className="text-gray-500 text-sm mt-2">
              Определяем способ запуска приложения
            </p>
          </div>
        </div>
      </>
    );
  }

  // Если в Telegram - показываем детей (основное приложение)
  if (isTelegramEnvironment) {
    return (
      <>
        <TelegramMetaTags startParam={startParam} />
        {children}
      </>
    );
  }

  // Если не в Telegram - показываем экран для открытия в Telegram
  return (
    <>
      <TelegramMetaTags startParam={startParam} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
                Специальная ссылка: {startParam}
              </div>
            )}
          </div>

          {/* ✅ АВТОМАТИЧЕСКИЙ РЕДИРЕКТ ИНДИКАТОР */}
          {!redirectAttempted && autoRedirectCountdown > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <Timer className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-semibold text-green-800">
                  Автоматическое перенаправление
                </span>
              </div>
              <div className="text-2xl font-bold text-green-700 mb-2">
                {autoRedirectCountdown}
              </div>
              <p className="text-sm text-green-600">
                Перенаправляем в Telegram через {autoRedirectCountdown} сек...
              </p>
              <button 
                onClick={handleAutomaticRedirect}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Перейти сейчас
              </button>
            </div>
          )}

          {/* ✅ ГЛАВНАЯ КНОПКА */}
          <div className="mb-6">
            <a
              href={getTelegramLink()}
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => {
                // Аналитика
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'telegram_redirect_click', {
                    source: 'browser',
                    user_agent: userAgent,
                    is_mobile: isMobile,
                    start_param: startParam,
                    method: 'manual_click'
                  });
                }
              }}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Открыть в Telegram
            </a>
          </div>

          {/* Статус редиректа */}
          {redirectAttempted && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-center text-yellow-700">
                <Check className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">
                  Попытка перенаправления выполнена
                </span>
              </div>
              <p className="text-xs text-yellow-600 mt-1">
                Если автоматический переход не сработал, используйте кнопку выше
              </p>
            </div>
          )}

          {/* Инструкции для мобильных устройств */}
          {isMobile && (
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                <Smartphone className="w-4 h-4 mr-2" />
                {isIOS ? 'Для iPhone/iPad:' : 'Для Android:'}
              </h3>
              <ol className="text-sm text-green-700 text-left space-y-1">
                <li>1. Нажмите кнопку "Открыть в Telegram" выше</li>
                <li>2. В появившемся диалоге выберите "Открыть в Telegram"</li>
                <li>3. Если Telegram не установлен - установите из {isIOS ? 'App Store' : 'Google Play'}</li>
                <li>4. Mini App откроется автоматически</li>
              </ol>
            </div>
          )}

          {/* Инструкции для десктопа */}
          {!isMobile && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                На компьютере:
              </h3>
              <ol className="text-sm text-gray-600 text-left space-y-1">
                <li>1. Установите Telegram Desktop</li>
                <li>2. Нажмите "Открыть в Telegram"</li>
                <li>3. Найдите @ThreeGIS_bot и запустите Mini App</li>
                <li>4. Или используйте веб-версию Telegram</li>
              </ol>
            </div>
          )}

          {/* Альтернативные способы доступа */}
          <div className="bg-yellow-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-yellow-800 mb-3">
              Альтернативные способы:
            </h3>
            <div className="text-sm text-yellow-700 space-y-2">
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span>📱 Прямая ссылка:</span>
                <a 
                  href="https://t.me/ThreeGIS_bot" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  t.me/ThreeGIS_bot
                </a>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span>🌐 Веб-версия:</span>
                <a 
                  href="https://web.telegram.org/k/#@ThreeGIS_bot" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
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
              className="inline-flex items-center text-blue-500 hover:text-blue-600 font-medium"
            >
              <Download className="w-4 h-4 mr-1" />
              Скачать Telegram
            </a>
          </div>

          {/* ✅ ТЕХНИЧЕСКАЯ ИНФОРМАЦИЯ (только в development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-4 border-t">
              <details className="text-left">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                  🔧 Техническая информация
                </summary>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p><strong>User Agent:</strong> {userAgent.substring(0, 60)}...</p>
                  <p><strong>URL:</strong> {window.location.href}</p>
                  <p><strong>Start Param:</strong> {startParam || 'отсутствует'}</p>
                  <p><strong>Telegram WebApp:</strong> {(window as any)?.Telegram?.WebApp ? 'доступен' : 'недоступен'}</p>
                  <p><strong>Init Data:</strong> {(window as any)?.Telegram?.WebApp?.initData ? 'есть' : 'нет'}</p>
                  <p><strong>Redirect Attempted:</strong> {redirectAttempted ? 'да' : 'нет'}</p>
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
                  Эта ссылка содержит специальные параметры для прямого перехода к нужному разделу.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
