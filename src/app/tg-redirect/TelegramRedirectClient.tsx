'use client';

import { useEffect, useState, useCallback } from 'react';
import { ExternalLink, Smartphone, Download, Timer, AlertCircle } from 'lucide-react';
import { useLaunchParams } from '@telegram-apps/sdk-react';

interface TelegramRedirectClientProps {
  startParam: string;
  botUsername: string;
  appName: string;
}

/**
 * ✅ БЕЗОПАСНЫЙ Client Component с правильным использованием Telegram SDK v3.3.1
 * 
 * ИСПРАВЛЕНИЯ:
 * - useLaunchParams(true) для SSR совместимости  
 * - Правильная обработка Telegram среды
 * - Безопасные event handlers
 * - Нет зацикливания редиректов
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
  const [isInTelegram, setIsInTelegram] = useState(false);
  
  // ✅ ПРАВИЛЬНОЕ использование useLaunchParams с SSR флагом
  const launchParams = useLaunchParams(true); // SSR флаг для Next.js 15
  
  // ✅ Безопасная инициализация клиентской среды
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      setUserAgent(ua);
      
      // ✅ Улучшенное определение Telegram среды
      const telegramDetection = 
        ua.includes('TelegramBot') || 
        ua.includes('Telegram/') ||
        ua.includes('tgWebApp') ||
        window.location.search.includes('tgWebAppData') ||
        window.location.search.includes('tgWebAppVersion') ||
        // Проверяем наличие Telegram WebApp API
        !!(window as any)?.Telegram?.WebApp ||
        // Проверяем launch params из SDK
        !!launchParams;
      
      setIsInTelegram(telegramDetection);
      
      console.log('📱 TG-Redirect Client инициализирован:', {
        userAgent: ua.substring(0, 60) + '...',
        startParam,
        isInTelegram: telegramDetection,
        launchParams: launchParams ? 'доступны' : 'недоступны',
        url: window.location.href
      });
    }
  }, [launchParams, startParam]);
  
  // ✅ Проверяем нужно ли перенаправление
  useEffect(() => {
    if (!isMounted || isInTelegram) {
      // Если мы УЖЕ в Telegram - не перенаправляем
      console.log('🛡️ Редирект отменен - уже в Telegram среде');
      return;
    }
    
    if (redirectAttempted) return;
    
    // ✅ Автоматический редирект только если НЕ в Telegram
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
  }, [isMounted, isInTelegram, redirectAttempted]);
  
  // ✅ Безопасная функция редиректа
  const handleTelegramRedirect = useCallback(() => {
    if (redirectAttempted || isInTelegram) return;
    
    setRedirectAttempted(true);
    
    // ✅ Используем startParam из props или launchParams
    const actualStartParam = startParam || launchParams?.tgWebAppStartParam || '';
    
    const telegramUrl = actualStartParam 
      ? `https://t.me/${botUsername}/${appName}?startapp=${encodeURIComponent(actualStartParam)}`
      : `https://t.me/${botUsername}/${appName}`;
    
    console.log('🚀 Выполняем редирект в Telegram:', {
      url: telegramUrl,
      startParam: actualStartParam,
      method: 'window.location.href'
    });
    
    try {
      // ✅ Универсальный подход для всех устройств
      window.location.href = telegramUrl;
    } catch (error) {
      console.error('❌ Ошибка редиректа:', error);
      // Fallback - открываем в новом окне
      window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    }
  }, [redirectAttempted, isInTelegram, startParam, launchParams, botUsername, appName]);
  
  // ✅ Безопасная обработка мануального клика
  const handleManualClick = useCallback(() => {
    console.log('📊 Мануальный клик по кнопке редиректа');
    handleTelegramRedirect();
  }, [handleTelegramRedirect]);
  
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
  
  // ✅ Если уже в Telegram - показываем соответствующее сообщение
  if (isInTelegram) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">3GIS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Вы уже в Telegram!
          </h1>
          <p className="text-gray-600 mb-4">
            3GIS Mini App должен открыться автоматически
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-center text-green-700 mb-2">
              <ExternalLink className="w-5 h-5 mr-2" />
              <span className="font-medium">Mini App активен</span>
            </div>
            <p className="text-sm text-green-600">
              Если Mini App не открылся, попробуйте перезапустить чат с @{botUsername}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
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
                <p><strong>User Agent:</strong> {userAgent.substring(0, 60)}...</p>
                <p><strong>Start Param (props):</strong> {startParam || 'отсутствует'}</p>
                <p><strong>Launch Params (SDK):</strong> {launchParams ? 'доступны' : 'недоступны'}</p>
                <p><strong>Is In Telegram:</strong> {isInTelegram ? 'да' : 'нет'}</p>
                <p><strong>Redirect Attempted:</strong> {redirectAttempted ? 'да' : 'нет'}</p>
                <p><strong>Countdown:</strong> {countdown}</p>
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
