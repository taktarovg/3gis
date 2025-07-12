// src/components/telegram/TelegramRedirectHandler.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { ExternalLink, Smartphone, Download, ArrowRight, Check, Timer } from 'lucide-react';
import { TelegramMetaTags } from '@/components/seo/TelegramMetaTags';

interface TelegramRedirectHandlerProps {
  children: React.ReactNode;
}

/**
 * ✅ ИСПРАВЛЕННЫЙ компонент для обработки открытия /tg ссылок в браузере
 * Исправления для правильной работы с LaunchParamsRetrieveError:
 * - Не полагается на SDK хуки для определения среды
 * - Использует нативные проверки Telegram WebApp
 * - Правильно обрабатывает LaunchParamsRetrieveError как нормальное поведение
 */
export function TelegramRedirectHandler({ children }: TelegramRedirectHandlerProps) {
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState<boolean | null>(null);
  const [userAgent, setUserAgent] = useState('');
  const [startParam, setStartParam] = useState<string>('');
  const [detectionComplete, setDetectionComplete] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState(3);

  // ✅ ИСПРАВЛЕНИЕ: Нативное определение Telegram среды БЕЗ использования SDK хуков
  const detectTelegramEnvironment = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const ua = navigator.userAgent;
    const urlParams = new URLSearchParams(window.location.search);
    const href = window.location.href;
    
    // ✅ ИСПРАВЛЕНИЕ: Сначала проверяем нативный Telegram WebApp объект
    const telegramWebApp = (window as any)?.Telegram?.WebApp;
    
    // ✅ КРИТИЧНО: Основные проверки без полагания на SDK
    const checks = {
      // Проверка 1: Telegram WebApp объект существует и готов
      hasWebApp: !!telegramWebApp,
      
      // Проверка 2: WebApp имеет initData (главный индикатор работы в Telegram)
      hasInitData: !!telegramWebApp?.initData && telegramWebApp.initData.length > 0,
      
      // Проверка 3: WebApp version указывает на реальный Telegram
      hasVersion: !!telegramWebApp?.version && telegramWebApp.version !== 'dev',
      
      // Проверка 4: WebApp platform определен
      hasPlatform: !!telegramWebApp?.platform,
      
      // Проверка 5: WebApp готов к работе
      isReady: telegramWebApp?.isExpanded !== undefined,
      
      // Проверка 6: URL параметры от Telegram (резервная проверка)
      hasUrlParams: urlParams.has('tgWebAppData') || 
                   urlParams.has('tgWebAppVersion') || 
                   urlParams.has('tgWebAppPlatform'),
      
      // Проверка 7: User Agent содержит Telegram
      hasTelegramUA: ua.includes('TelegramBot') || 
                    ua.includes('Telegram') ||
                    ua.includes('tgWebApp'),
      
      // Проверка 8: URL содержит tgWebApp параметры
      hasWebAppInUrl: href.includes('tgWebApp'),
      
      // Проверка 9: Referrer от Telegram
      hasTelegramReferrer: document.referrer.includes('telegram') || 
                          document.referrer.includes('t.me'),
      
      // Проверка 10: Специфичные для Telegram методы доступны
      hasTelegramMethods: typeof telegramWebApp?.ready === 'function' &&
                         typeof telegramWebApp?.expand === 'function'
    };
    
    console.log('🔍 ИСПРАВЛЕННЫЕ проверки Telegram среды:', checks);
    console.log('🔍 Telegram WebApp object:', telegramWebApp);
    console.log('🔍 WebApp initData present:', !!telegramWebApp?.initData);
    console.log('🔍 WebApp version:', telegramWebApp?.version);
    console.log('🔍 WebApp platform:', telegramWebApp?.platform);
    
    // ✅ ИСПРАВЛЕНИЕ: Более строгие критерии определения Telegram
    // Считаем что в Telegram, только если есть WebApp с initData ИЛИ достаточно положительных проверок
    const criticalIndicators = checks.hasWebApp && (checks.hasInitData || checks.hasVersion);
    const additionalChecks = Object.values(checks).filter(Boolean).length;
    
    const isInTelegram = criticalIndicators || additionalChecks >= 4;
    
    console.log('🔍 ИСПРАВЛЕННЫЙ результат определения среды:', {
      criticalIndicators,
      additionalChecks,
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

  // ✅ Автоматический редирект с обратным отсчетом
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

  // ✅ ИСПРАВЛЕНИЕ: Основная логика определения среды БЕЗ полагания на SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent;
    setUserAgent(ua);

    // Получаем startapp параметр из URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlStartParam = urlParams.get('startapp') || urlParams.get('start') || '';
    setStartParam(urlStartParam);

    console.log('🚀 TelegramRedirectHandler: ИСПРАВЛЕННАЯ инициализация');
    console.log('📱 User Agent:', ua);
    console.log('🔗 Start Param:', urlStartParam);

    // ✅ ИСПРАВЛЕНИЕ: Даем больше времени для инициализации Telegram WebApp
    // но не полагаемся на SDK хуки которые могут выдавать ошибки
    const detectWithDelay = () => {
      // Используем нашу нативную функцию определения
      const isInTelegram = detectTelegramEnvironment();
      setIsTelegramEnvironment(isInTelegram);
      setDetectionComplete(true);

      // Если НЕ в Telegram, запускаем автоматический редирект
      if (!isInTelegram) {
        console.log('🔍 Не в Telegram среде - запускаем автоматический редирект');
        setTimeout(handleAutomaticRedirect, 1000);
      } else {
        console.log('📱 В Telegram среде - продолжаем с детьми');
      }
    };

    // ✅ ИСПРАВЛЕНИЕ: Увеличиваем задержку и добавляем дополнительные проверки
    let timeoutId: NodeJS.Timeout;
    
    // Проверяем сразу
    const initialCheck = detectTelegramEnvironment();
    if (initialCheck) {
      // Если сразу определили Telegram - используем сразу
      detectWithDelay();
    } else {
      // Если не определили - даем время для загрузки
      timeoutId = setTimeout(detectWithDelay, 2000); // Увеличиваем до 2 секунд
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
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
            <p className="text-gray-700 font-medium">Определяем среду выполнения...</p>
            <p className="text-gray-500 text-sm mt-2">
              Проверяем доступность Telegram WebApp
            </p>
          </div>
        </div>
      </>
    );
  }

  // Если в Telegram - показываем детей (основное приложение)
  if (isTelegramEnvironment) {
    console.log('✅ Показываем основное приложение в Telegram');
    return (
      <>
        <TelegramMetaTags startParam={startParam} />
        {children}
      </>
    );
  }

  // ✅ ИСПРАВЛЕНИЕ: Если не в Telegram - показываем экран для открытия в Telegram
  console.log('🌐 Показываем экран "Открыть в Telegram"');
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
                  <p><strong>WebApp Version:</strong> {(window as any)?.Telegram?.WebApp?.version || 'нет'}</p>
                  <p><strong>WebApp Platform:</strong> {(window as any)?.Telegram?.WebApp?.platform || 'нет'}</p>
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
