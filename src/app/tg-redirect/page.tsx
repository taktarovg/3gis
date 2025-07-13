// src/app/tg-redirect/page.tsx - ИСПРАВЛЕННАЯ страница для открытия в Telegram
'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Smartphone, Download, Timer } from 'lucide-react';

/**
 * ✅ ИСПРАВЛЕНО: Простая страница редиректа БЕЗ Server/Client конфликтов
 * 
 * ИСПРАВЛЕНИЯ:
 * - Убрали все сложные компоненты которые могли вызывать Server/Client конфликты
 * - Простое определение среды через window объект
 * - Никаких onClick в Server компонентах
 * - Все обработчики событий только в Client компонентах
 * - Нет зацикливания с middleware
 */
export default function TelegramRedirectPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [startParam, setStartParam] = useState('');
  const [userAgent, setUserAgent] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  // ✅ Простое определение клиентской среды
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      setUserAgent(navigator.userAgent);
      
      // Получаем startParam из URL
      const urlParams = new URLSearchParams(window.location.search);
      const param = urlParams.get('startapp') || urlParams.get('start') || '';
      setStartParam(param);
      
      console.log('📱 TG-Redirect инициализирован:', {
        userAgent: navigator.userAgent,
        startParam: param,
        url: window.location.href
      });
    }
  }, []);
  
  // ✅ Автоматический редирект с обратным отсчетом
  useEffect(() => {
    if (!isMounted || redirectAttempted) return;
    
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
  }, [isMounted, redirectAttempted]);
  
  // ✅ Функция редиректа в Telegram
  const handleTelegramRedirect = () => {
    if (redirectAttempted) return;
    
    setRedirectAttempted(true);
    
    const botUsername = 'ThreeGIS_bot';
    const appName = 'app';
    
    const telegramUrl = startParam 
      ? `https://t.me/${botUsername}/${appName}?startapp=${encodeURIComponent(startParam)}`
      : `https://t.me/${botUsername}/${appName}`;
    
    console.log('🚀 Редирект в Telegram:', telegramUrl);
    
    try {
      // Универсальный подход для всех устройств
      window.location.href = telegramUrl;
    } catch (error) {
      console.error('❌ Ошибка редиректа:', error);
      // Fallback - открываем в новом окне
      window.open(telegramUrl, '_blank');
    }
  };
  
  // ✅ Определяем мобильное устройство
  const isIOS = userAgent.includes('iPhone') || userAgent.includes('iPad');
  const isAndroid = userAgent.includes('Android');
  const isMobile = isIOS || isAndroid;
  
  // ✅ Функция для аналитики (БЕЗ Server/Client конфликтов)
  const handleManualClick = () => {
    // Простая аналитика через console (можно расширить)
    console.log('📊 Пользователь кликнул вручную');
    handleTelegramRedirect();
  };
  
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
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
            <p className="text-sm text-green-600">
              Перенаправляем в Telegram через {countdown} сек...
            </p>
            <button 
              onClick={handleManualClick}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              Перейти сейчас
            </button>
          </div>
        )}

        {/* ✅ ГЛАВНАЯ КНОПКА - только на клиенте */}
        <div className="mb-6">
          <button
            onClick={handleManualClick}
            className="w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Открыть в Telegram
          </button>
        </div>

        {/* Статус редиректа */}
        {redirectAttempted && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-center text-yellow-700">
              <ExternalLink className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                Попытка перенаправления выполнена
              </span>
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              Если автоматический переход не сработал, попробуйте еще раз
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
                <p><strong>Start Param:</strong> {startParam || 'отсутствует'}</p>
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
                Эта ссылка содержит специальные параметры для прямого перехода к нужному разделу.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
