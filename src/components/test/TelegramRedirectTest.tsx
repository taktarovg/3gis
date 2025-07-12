// src/components/test/TelegramRedirectTest.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Smartphone, Monitor, Globe } from 'lucide-react';
import { useTelegramDetection, TelegramUtils } from '@/hooks/useTelegramDetection';

/**
 * Компонент для тестирования функционала редиректа в Telegram
 * Показывается только в development режиме
 */
export function TelegramRedirectTest() {
  const detection = useTelegramDetection();
  const [testResults, setTestResults] = useState<string[]>([]);

  // Показываем только в development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const testOpenInTelegram = () => {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ThreeGIS_bot';
    addTestResult(`Attempting to open t.me/${botUsername}/app`);
    TelegramUtils.openInTelegram(botUsername, undefined, detection.isMobile);
    addTestResult(`Telegram link opened for ${detection.isMobile ? 'mobile' : 'desktop'}`);
  };

  const testRedirectPage = () => {
    addTestResult('Opening redirect page in new tab');
    window.open('/tg-redirect', '_blank');
  };

  const testBrowserDetection = () => {
    const supported = TelegramUtils.isTelegramSupported();
    addTestResult(`Telegram support: ${supported ? 'YES' : 'NO'}`);
    addTestResult(`User Agent: ${navigator.userAgent.substring(0, 50)}...`);
  };

  const testInstructions = () => {
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ThreeGIS_bot';
    const instructions = TelegramUtils.getInstructions(botUsername, detection.platform, detection.isMobile);
    addTestResult(`Generated ${instructions.length} instructions for ${detection.platform}`);
    console.log('📋 Instructions:', instructions);
  };

  return (
    <Card className="mt-6 border-2 border-dashed border-orange-300 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          🧪 Telegram Redirect Test
          <Badge variant="outline" className="text-xs">
            Development Only
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Тестирование функционала перенаправления в Telegram приложение
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Информация о текущем окружении */}
        <div className="bg-white rounded-lg p-3 border">
          <h4 className="font-semibold text-sm mb-2">Текущее окружение:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              {detection.isMobile ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
              <span>{detection.isMobile ? 'Mobile' : 'Desktop'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>{detection.platform}</span>
            </div>
            <div className="col-span-2">
              <Badge variant={detection.isTelegramWebApp ? "default" : "secondary"} className="text-xs">
                {detection.isTelegramWebApp ? "✅ В Telegram WebApp" : "🌐 В браузере"}
              </Badge>
              {detection.isTelegramBrowser && (
                <Badge variant="outline" className="text-xs ml-1">
                  Telegram Browser
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Кнопки тестирования */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={testOpenInTelegram}
            size="sm"
            className="text-xs"
            variant="outline"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Открыть в TG
          </Button>

          <Button
            onClick={testRedirectPage}
            size="sm"
            className="text-xs"
            variant="outline"
          >
            🔄 Redirect Page
          </Button>

          <Button
            onClick={testBrowserDetection}
            size="sm"
            className="text-xs"
            variant="outline"
          >
            🔍 Detect Browser
          </Button>

          <Button
            onClick={testInstructions}
            size="sm"
            className="text-xs"
            variant="outline"
          >
            📋 Instructions
          </Button>
        </div>

        {/* Результаты тестов */}
        {testResults.length > 0 && (
          <div className="bg-gray-900 text-green-400 rounded p-2 text-xs font-mono max-h-32 overflow-y-auto">
            <div className="text-white text-xs mb-1">Test Results:</div>
            {testResults.map((result, index) => (
              <div key={index} className="text-xs">
                {result}
              </div>
            ))}
          </div>
        )}

        {/* Быстрые ссылки для тестирования */}
        <div className="bg-blue-50 rounded p-3 border border-blue-200">
          <h4 className="font-semibold text-sm mb-2 text-blue-800">Быстрые тесты:</h4>
          <div className="grid grid-cols-1 gap-1 text-xs">
            <a 
              href="/tg-redirect" 
              target="_blank" 
              className="text-blue-600 hover:underline"
            >
              • /tg-redirect - Страница редиректа
            </a>
            <a 
              href="/tg" 
              target="_blank" 
              className="text-blue-600 hover:underline"
            >
              • /tg - Главная страница Mini App
            </a>
            <button
              onClick={() => {
                const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ThreeGIS_bot';
                const url = `https://t.me/${botUsername}/app`;
                navigator.clipboard.writeText(url);
                addTestResult('Telegram URL copied to clipboard');
              }}
              className="text-left text-blue-600 hover:underline"
            >
              • Copy Telegram URL to clipboard
            </button>
          </div>
        </div>

        {/* Middleware тест */}
        <div className="bg-yellow-50 rounded p-3 border border-yellow-200">
          <h4 className="font-semibold text-sm mb-2 text-yellow-800">Middleware Test:</h4>
          <p className="text-xs text-yellow-700 mb-2">
            Откройте /tg в новой вкладке браузера - должен сработать редирект на /tg-redirect
          </p>
          <Button
            onClick={() => {
              window.open('/tg', '_blank');
              addTestResult('Opened /tg in new tab to test middleware redirect');
            }}
            size="sm"
            className="text-xs"
            variant="outline"
          >
            🧪 Test Middleware
          </Button>
        </div>

        {/* Ошибки если есть */}
        {detection.errors.length > 0 && (
          <div className="bg-red-50 rounded p-3 border border-red-200">
            <h4 className="font-semibold text-sm mb-2 text-red-800">Ошибки:</h4>
            <ul className="text-xs text-red-700 space-y-1">
              {detection.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
