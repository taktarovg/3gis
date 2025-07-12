// src/app/tg-redirect/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useTelegramDetection, TelegramUtils } from '@/hooks/useTelegramDetection';

/**
 * Страница-редирект для открытия 3GIS в нативном приложении Telegram
 * Определяет, открыта ли ссылка в браузере или в Telegram, и предлагает соответствующие действия
 */
export default function TelegramRedirectPage() {
  const detection = useTelegramDetection();
  const [timeLeft, setTimeLeft] = useState(5); // Автоматический редирект через 5 секунд
  const [redirectStarted, setRedirectStarted] = useState(false);

  useEffect(() => {
    if (detection.isLoading) return;

    // Если уже в Telegram WebApp, редиректим сразу на приложение
    if (detection.isTelegramWebApp && !redirectStarted) {
      setRedirectStarted(true);
      window.location.href = '/tg';
      return;
    }

    // Автоматический редирект через 5 секунд для удобства пользователя
    if (!detection.isTelegramWebApp && !redirectStarted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Вызываем функцию напрямую здесь, чтобы избежать зависимости
            const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ThreeGIS_bot';
            TelegramUtils.openInTelegram(botUsername, undefined, detection.isMobile);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [detection.isLoading, detection.isTelegramWebApp, detection.isMobile, redirectStarted]);

  const handleOpenInTelegram = () => {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ThreeGIS_bot';
    TelegramUtils.openInTelegram(botUsername, undefined, detection.isMobile);
  };

  const handleManualOpen = () => {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ThreeGIS_bot';
    const instructions = TelegramUtils.getInstructions(botUsername, detection.platform, detection.isMobile).join('\n');
    alert(instructions);
  };

  const handleViewInBrowser = () => {
    window.location.href = '/tg';
  };

  // Loading состояние
  if (detection.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Определяем ваше устройство...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Если уже в Telegram WebApp
  if (detection.isTelegramWebApp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Отлично!</h1>
            <p className="text-gray-600 mb-4">Вы уже в Telegram. Перенаправляем в 3GIS...</p>
            <div className="animate-pulse text-sm text-gray-500">Загрузка...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ThreeGIS_bot';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-16 h-16 mr-3">
              <Image
                src="/icons/icon-192.png"
                alt="3GIS Logo"
                width={64}
                height={64}
                className="rounded-xl"
              />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              3GIS
            </div>
          </div>
          <CardTitle className="text-xl text-gray-800">
            Откройте 3GIS в приложении Telegram
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Для лучшего опыта рекомендуем использовать нативное приложение Telegram
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Информация об устройстве */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Информация об устройстве:</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant={detection.isMobile ? "default" : "secondary"}>
                {detection.isMobile ? "Мобильное" : "Десктоп"}
              </Badge>
              <Badge variant="outline">{detection.platform}</Badge>
              <Badge variant={detection.isTelegramWebApp ? "default" : "destructive"}>
                {detection.isTelegramWebApp ? "Telegram WebApp" : "Браузер"}
              </Badge>
              {detection.isTelegramBrowser && (
                <Badge variant="secondary">Telegram Browser</Badge>
              )}
            </div>
          </div>

          {/* Основная кнопка с таймером */}
          <div className="text-center space-y-4">
            <Button
              onClick={handleOpenInTelegram}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 text-lg"
            >
              🚀 Открыть в Telegram
              {timeLeft > 0 && (
                <span className="ml-2 text-blue-200">({timeLeft}с)</span>
              )}
            </Button>
            
            {timeLeft > 0 && (
              <p className="text-sm text-gray-500">
                Автоматическое открытие через {timeLeft} секунд
              </p>
            )}
          </div>

          {/* Альтернативные действия */}
          <div className="space-y-3">
            <Button
              onClick={handleViewInBrowser}
              variant="outline"
              className="w-full"
            >
              🌐 Открыть в браузере (ограниченный функционал)
            </Button>
            
            <Button
              onClick={handleManualOpen}
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-800"
            >
              📱 Инструкция по ручному открытию
            </Button>
          </div>

          {/* Инструкции в зависимости от платформы */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Инструкция:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              {TelegramUtils.getInstructions(botUsername, detection.platform, detection.isMobile).map((instruction, index) => (
                <li key={index}>{index + 1}. {instruction}</li>
              ))}
            </ol>
          </div>

          {/* Проверка поддержки Telegram */}
          {!TelegramUtils.isTelegramSupported() && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Внимание:</h3>
              <p className="text-sm text-yellow-700">
                Ваш браузер может не поддерживать открытие Telegram ссылок. 
                Рекомендуем скопировать ссылку вручную: t.me/{botUsername}
              </p>
            </div>
          )}

          {/* Преимущества использования в Telegram */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Преимущества в Telegram:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✓ Автоматическая авторизация</li>
              <li>✓ Быстрый доступ к контактам</li>
              <li>✓ Уведомления о новых заведениях</li>
              <li>✓ Возможность делиться с друзьями</li>
              <li>✓ Интеграция с чатами</li>
            </ul>
          </div>

          {/* Ошибки если есть */}
          {detection.errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Ошибки:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                {detection.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Debug информация в development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer">
                Debug Info (только в разработке)
              </summary>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                {JSON.stringify({
                  detection: {
                    ...detection,
                    telegramData: detection.telegramData ? {
                      ...detection.telegramData,
                      initDataRaw: detection.telegramData.initDataRaw ? 
                        detection.telegramData.initDataRaw.substring(0, 100) + '...' : null
                    } : null
                  }
                }, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
