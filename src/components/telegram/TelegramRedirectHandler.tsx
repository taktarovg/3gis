// src/components/telegram/TelegramRedirectHandler.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { ExternalLink, Smartphone, Download } from 'lucide-react';
import { TelegramMetaTags } from '@/components/seo/TelegramMetaTags';

interface TelegramRedirectHandlerProps {
  children: React.ReactNode;
}

/**
 * ✅ Компонент для обработки открытия /tg ссылок в браузере
 * Автоматически предлагает открыть в Telegram или показывает инструкции
 */
export function TelegramRedirectHandler({ children }: TelegramRedirectHandlerProps) {
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState<boolean | null>(null);
  const [userAgent, setUserAgent] = useState('');
  const [startParam, setStartParam] = useState<string>('');

  // ✅ Используем useCallback для стабильности ссылки в useEffect
  const handleTelegramRedirect = useCallback((startParam: string, userAgent: string) => {
    const botUsername = 'ThreeGIS_bot';
    const appName = 'app';
    
    // Формируем ссылку на Telegram Mini App
    const telegramUrl = startParam 
      ? `https://t.me/${botUsername}/${appName}?startapp=${encodeURIComponent(startParam)}`
      : `https://t.me/${botUsername}/${appName}`;

    console.log('🔗 Telegram URL:', telegramUrl);

    // Пытаемся автоматически открыть в Telegram с задержкой
    setTimeout(() => {
      try {
        // Для мобильных устройств пытаемся открыть через специальные протоколы
        if (userAgent.includes('Mobile')) {
          // Создаем невидимый iframe для попытки открытия в приложении
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = telegramUrl;
          document.body.appendChild(iframe);
          
          // Удаляем iframe через секунду
          setTimeout(() => {
            if (iframe.parentNode) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        }
        
        // Прямой переход как fallback
        setTimeout(() => {
          window.location.href = telegramUrl;
        }, 1500);
        
      } catch (error) {
        console.error('Ошибка автоматического редиректа:', error);
      }
    }, 500);
  }, []); // пустые зависимости, так как логика статична

  const getTelegramLink = useCallback(() => {
    const botUsername = 'ThreeGIS_bot';
    const appName = 'app';
    
    return startParam 
      ? `https://t.me/${botUsername}/${appName}?startapp=${encodeURIComponent(startParam)}`
      : `https://t.me/${botUsername}/${appName}`;
  }, [startParam]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent;
    setUserAgent(ua);

    // Получаем startapp параметр из URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlStartParam = urlParams.get('startapp') || '';
    setStartParam(urlStartParam);

    // Проверяем, находимся ли мы в Telegram
    const isInTelegram = !!(
      (window as any)?.Telegram?.WebApp ||
      ua.includes('TelegramBot') ||
      window.location.href.includes('tgWebAppPlatform') ||
      window.location.search.includes('tgWebAppData') ||
      // Дополнительные проверки для различных Telegram клиентов
      ua.includes('Telegram') ||
      // Проверка через URL параметры, которые передает Telegram
      urlParams.has('tgWebAppData') ||
      urlParams.has('tgWebAppVersion')
    );

    console.log('🔍 Environment detection:', {
      isInTelegram,
      userAgent: ua,
      hasWebApp: !!(window as any)?.Telegram?.WebApp,
      urlParams: Object.fromEntries(urlParams.entries())
    });

    setIsTelegramEnvironment(isInTelegram);

    // Если не в Telegram, пытаемся автоматически открыть в Telegram
    if (!isInTelegram) {
      console.log('🔍 Не в Telegram среде, подготавливаем редирект...');
      handleTelegramRedirect(urlStartParam, ua);
    }
  }, [handleTelegramRedirect]); // добавляем зависимость

  const isIOS = userAgent.includes('iPhone') || userAgent.includes('iPad');
  const isAndroid = userAgent.includes('Android');
  const isMobile = isIOS || isAndroid;

  // Показываем загрузку пока определяем среду
  if (isTelegramEnvironment === null) {
    return (
      <>
        <TelegramMetaTags startParam={startParam} />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Проверяем среду выполнения...</p>
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
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 text-center">
          {/* Лого и заголовок */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">3GIS</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              3GIS Mini App
            </h1>
            <p className="text-gray-600">
              Русскоязычный справочник организаций в США
            </p>
            {startParam && (
              <p className="text-sm text-blue-600 mt-2">
                Специальная ссылка: {startParam}
              </p>
            )}
          </div>

          {/* Основная кнопка для открытия в Telegram */}
          <div className="mb-6">
            <a
              href={getTelegramLink()}
              className="inline-flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors shadow-lg"
              onClick={() => {
                // Дополнительная аналитика
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'telegram_redirect_click', {
                    source: 'browser',
                    user_agent: userAgent,
                    is_mobile: isMobile,
                    start_param: startParam
                  });
                }
              }}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Открыть в Telegram
            </a>
          </div>

          {/* Инструкции для мобильных устройств */}
          {isMobile && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                <Smartphone className="w-4 h-4 mr-2" />
                {isIOS ? 'Для iPhone/iPad:' : 'Для Android:'}
              </h3>
              <ol className="text-sm text-blue-700 text-left space-y-1">
                <li>1. Нажмите кнопку "Открыть в Telegram" выше</li>
                <li>2. В появившемся диалоге выберите "Открыть в Telegram"</li>
                <li>3. Если Telegram не установлен - установите из {isIOS ? 'App Store' : 'Google Play'}</li>
                <li>4. Приложение откроется автоматически в Mini App режиме</li>
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
            <h3 className="font-semibold text-yellow-800 mb-2">
              Альтернативные способы:
            </h3>
            <div className="text-sm text-yellow-700 space-y-2">
              <div>
                📱 <strong>Прямая ссылка:</strong>{' '}
                <a 
                  href="https://t.me/ThreeGIS_bot" 
                  className="text-blue-600 underline"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  t.me/ThreeGIS_bot
                </a>
              </div>
              <div>
                🌐 <strong>Веб-версия:</strong>{' '}
                <a 
                  href="https://web.telegram.org/k/#@ThreeGIS_bot" 
                  className="text-blue-600 underline"
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
