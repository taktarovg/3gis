// src/components/environment/EnvironmentDetector.tsx
'use client';

import { useEffect, useState, type PropsWithChildren } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Smartphone, Monitor, RefreshCw } from 'lucide-react';

/**
 * ✅ Детектор среды выполнения с умной обработкой
 * Различает Telegram, браузер и мобильные устройства
 * Предоставляет соответствующие инструкции пользователю
 */

interface EnvironmentDetectorProps {
  children: React.ReactNode;
}

type EnvironmentType = 'telegram' | 'browser' | 'mobile' | 'unknown';

export function EnvironmentDetector({ children }: EnvironmentDetectorProps) {
  const [environment, setEnvironment] = useState<EnvironmentType>('unknown');
  const [isChecking, setIsChecking] = useState(true);
  const [showRetryOption, setShowRetryOption] = useState(false);

  useEffect(() => {
    const detectEnvironment = () => {
      console.log('🔍 Детекция среды выполнения...');
      
      // ✅ Проверяем Telegram WebApp
      const hasTelegramWebApp = !!(window as any)?.Telegram?.WebApp;
      
      // ✅ Проверяем URL параметры Telegram
      const urlParams = new URLSearchParams(window.location.search);
      const hasTelegramParams = 
        urlParams.has('tgWebAppPlatform') || 
        urlParams.has('tgWebAppData') ||
        window.location.href.includes('tgWebApp');
      
      // ✅ Проверяем User Agent на Telegram
      const userAgent = navigator.userAgent;
      const isTelegramUserAgent = userAgent.includes('Telegram');
      
      // ✅ Проверяем мобильное устройство
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      console.log('🔍 Environment detection results:', {
        hasTelegramWebApp,
        hasTelegramParams,
        isTelegramUserAgent,
        isMobile,
        userAgent: userAgent.substring(0, 100) + '...'
      });
      
      // ✅ Определяем среду по приоритету
      if (hasTelegramWebApp || isTelegramUserAgent) {
        setEnvironment('telegram');
      } else if (hasTelegramParams) {
        // Если есть Telegram параметры, но нет WebApp - возможно браузер с параметрами
        setEnvironment('telegram');
      } else if (isMobile) {
        setEnvironment('mobile');
      } else {
        setEnvironment('browser');
      }
      
      setIsChecking(false);
      
      // ✅ Показываем опцию retry через 3 секунды если не Telegram
      if (!hasTelegramWebApp && !isTelegramUserAgent) {
        setTimeout(() => setShowRetryOption(true), 3000);
      }
    };

    // ✅ Задержка для полной загрузки Telegram WebApp
    const timeoutId = setTimeout(detectEnvironment, 300);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // ✅ Пока идет проверка
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Определение среды выполнения...</p>
          <p className="text-gray-500 text-sm mt-2">Проверяем Telegram WebApp</p>
        </div>
      </div>
    );
  }

  // ✅ Если Telegram - показываем приложение
  if (environment === 'telegram') {
    console.log('✅ Telegram environment detected - rendering app');
    return <>{children}</>;
  }

  // ✅ Функции для переадресации
  const openInTelegram = () => {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ThreeGIS_bot';
    const telegramUrl = `https://t.me/${botUsername}/app`;
    
    // Пытаемся открыть в Telegram приложении
    window.location.href = `tg://resolve?domain=${botUsername}&appname=app`;
    
    // Fallback на веб-версию через 1 секунду
    setTimeout(() => {
      window.open(telegramUrl, '_blank');
    }, 1000);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  // ✅ Экран для браузера на десктопе
  if (environment === 'browser') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Иконка */}
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Monitor className="w-10 h-10 text-blue-600" />
            </div>

            {/* Заголовок */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Откройте в Telegram
            </h1>

            {/* Описание */}
            <p className="text-gray-600 mb-8 leading-relaxed">
              <strong>3GIS</strong> - это Telegram Mini App. 
              Для полного функционала откройте приложение через Telegram.
            </p>

            {/* Кнопки действий */}
            <div className="space-y-4">
              <Button 
                onClick={openInTelegram} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
                size="lg"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Открыть в Telegram
              </Button>

              {showRetryOption && (
                <Button 
                  onClick={refreshPage} 
                  variant="outline" 
                  className="w-full py-3 rounded-xl font-medium"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Обновить страницу
                </Button>
              )}
            </div>

            {/* Инструкции */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Как открыть:</h3>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Найдите @ThreeGIS_bot в Telegram</li>
                <li>2. Нажмите "Запустить" или "Start"</li>
                <li>3. Выберите "Открыть приложение"</li>
              </ol>
            </div>

            {/* Дополнительная информация */}
            <p className="text-xs text-gray-500 mt-6">
              3GIS работает на всех платформах: iOS, Android, Windows, macOS
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Экран для мобильного устройства
  if (environment === 'mobile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            {/* Иконка */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-blue-600" />
            </div>

            {/* Заголовок */}
            <h1 className="text-xl font-bold text-gray-900 mb-3">
              Установите Telegram
            </h1>

            {/* Описание */}
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Для использования <strong>3GIS</strong> необходимо приложение Telegram.
            </p>

            {/* Кнопки действий */}
            <div className="space-y-3">
              <Button 
                onClick={openInTelegram} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Открыть в Telegram
              </Button>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => window.open('https://apps.apple.com/app/telegram-messenger/id686449807', '_blank')} 
                  variant="outline" 
                  className="flex-1 text-xs py-2"
                >
                  App Store
                </Button>
                <Button 
                  onClick={() => window.open('https://play.google.com/store/apps/details?id=org.telegram.messenger', '_blank')} 
                  variant="outline" 
                  className="flex-1 text-xs py-2"
                >
                  Google Play
                </Button>
              </div>

              {showRetryOption && (
                <Button 
                  onClick={refreshPage} 
                  variant="ghost" 
                  className="w-full text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Обновить
                </Button>
              )}
            </div>

            {/* Инструкции */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg text-left">
              <h3 className="font-medium text-gray-900 mb-1 text-sm">После установки:</h3>
              <ol className="text-xs text-gray-600 space-y-1">
                <li>1. Найдите @ThreeGIS_bot</li>
                <li>2. Нажмите "Start"</li>
                <li>3. Откройте приложение</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Fallback для неизвестной среды
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            Неизвестная среда
          </h1>
          <p className="text-gray-600 mb-6">
            Приложение 3GIS лучше всего работает в Telegram.
          </p>
          <div className="space-y-3">
            <Button onClick={openInTelegram} className="w-full">
              Открыть в Telegram
            </Button>
            <Button onClick={refreshPage} variant="outline" className="w-full">
              Обновить страницу
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}