// src/components/debug/TelegramDebug.tsx
'use client';

import { useEffect, useState } from 'react';
import { useLaunchParams, useRawInitData } from '@telegram-apps/sdk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Компонент для отладки Telegram SDK v3.x
 * Показывает текущее состояние всех хуков и данных
 */
export function TelegramDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Получаем данные из SDK v3.x без условных вызовов (Rules of Hooks)
  // useLaunchParams(true) - включает SSR режим для Next.js
  const launchParams = useLaunchParams(true);
  // useRawInitData() - НЕ принимает параметров в SDK v3.x
  const initDataRaw = useRawInitData();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]); // Последние 20 логов
  };

  useEffect(() => {
    addLog(`Launch params: ${launchParams ? 'OK' : 'NULL'}`);
  }, [launchParams]);

  useEffect(() => {
    addLog(`Init data: ${initDataRaw ? 'OK' : 'NULL'}`);
  }, [initDataRaw]);

  // Показываем только в development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const webAppData = launchParams?.tgWebAppData;
  const user = webAppData?.user;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {!isVisible ? (
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-black/80 text-white border-gray-600 hover:bg-black/90"
        >
          🐛 Debug
        </Button>
      ) : (
        <Card className="w-96 max-h-96 overflow-hidden bg-black/95 text-white border-gray-600">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Telegram SDK v3.x Debug</CardTitle>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {/* Статусы хуков */}
            <div className="space-y-1">
              <h4 className="font-semibold text-yellow-400">Hook Status:</h4>
              <div className="flex flex-wrap gap-1">
                <Badge variant={launchParams ? "default" : "destructive"}>
                  useLaunchParams: {launchParams ? "✓" : "✗"}
                </Badge>
                <Badge variant={initDataRaw ? "default" : "destructive"}>
                  useRawInitData: {initDataRaw ? "✓" : "✗"}
                </Badge>
              </div>
            </div>

            {/* Данные launchParams */}
            {launchParams && (
              <div className="space-y-1">
                <h4 className="font-semibold text-green-400">Launch Params:</h4>
                <div className="bg-black/50 p-2 rounded text-xs font-mono">
                  <div>Platform: {String(launchParams.tgWebAppPlatform || 'unknown')}</div>
                  <div>Version: {String(launchParams.tgWebAppVersion || 'unknown')}</div>
                  <div>Bot Inline: {String(launchParams.tgWebAppBotInline || false)}</div>
                  <div>Start Param: {String(launchParams.tgWebAppStartParam || 'none')}</div>
                </div>
              </div>
            )}

            {/* Данные пользователя */}
            {user && (
              <div className="space-y-1">
                <h4 className="font-semibold text-blue-400">User Data:</h4>
                <div className="bg-black/50 p-2 rounded text-xs font-mono">
                  <div>ID: {String(user.id || '')}</div>
                  <div>Name: {String(user.first_name || '')} {String(user.last_name || '')}</div>
                  {user.username && <div>Username: @{String(user.username)}</div>}
                  <div>Language: {String(user.language_code || 'unknown')}</div>
                  <div>Premium: {String(user.is_premium || false)}</div>
                  <div>Photo: {user.photo_url ? '✓' : '✗'}</div>
                </div>
              </div>
            )}

            {/* InitData */}
            {initDataRaw && (
              <div className="space-y-1">
                <h4 className="font-semibold text-purple-400">Init Data:</h4>
                <div className="bg-black/50 p-2 rounded text-xs font-mono">
                  <div>Length: {initDataRaw.length} chars</div>
                  <div className="truncate">Preview: {initDataRaw.substring(0, 50)}...</div>
                </div>
              </div>
            )}

            {/* Платформа */}
            <div className="space-y-1">
              <h4 className="font-semibold text-orange-400">Platform:</h4>
              <div className="bg-black/50 p-2 rounded text-xs font-mono">
                <div>User Agent: {navigator.userAgent.substring(0, 30)}...</div>
                <div>Is Mobile: {/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Yes' : 'No'}</div>
                <div>Telegram App: {navigator.userAgent.includes('Telegram') ? 'Yes' : 'No'}</div>
              </div>
            </div>

            {/* Логи */}
            <div className="space-y-1">
              <h4 className="font-semibold text-gray-400">Logs:</h4>
              <div className="bg-black/50 p-2 rounded text-xs font-mono max-h-24 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-gray-500">No logs yet...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="text-gray-300">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-2">
              <Button
                onClick={() => setLogs([])}
                variant="outline"
                size="sm"
                className="text-xs h-6 border-gray-600 text-white hover:bg-white/20"
              >
                Clear Logs
              </Button>
              <Button
                onClick={() => {
                  const debugData = {
                    launchParams,
                    initDataRaw: initDataRaw ? initDataRaw.substring(0, 100) + '...' : null,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                  };
                  console.log('📊 Telegram Debug Data:', debugData);
                  addLog('Debug data logged to console');
                }}
                variant="outline"
                size="sm"
                className="text-xs h-6 border-gray-600 text-white hover:bg-white/20"
              >
                Log to Console
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Хук для отслеживания состояния Telegram SDK v3.x
 * Исправлен useEffect - убрана зависимость errors из dependency array
 */
export function useTelegramDebugState() {
  const [state, setState] = useState({
    hasLaunchParams: false,
    hasInitData: false,
    hasUser: false,
    platform: 'unknown',
    errors: [] as string[]
  });

  // Используем хуки согласно SDK v3.x документации
  const launchParams = useLaunchParams(true); // SSR режим
  const initDataRaw = useRawInitData(); // Без параметров

  useEffect(() => {
    // Создаем errors локально внутри useEffect
    const errors: string[] = [];
    
    // Проверяем ошибки инициализации
    if (!launchParams) {
      errors.push('Launch parameters not available');
    }
    if (!initDataRaw) {
      errors.push('Raw init data not available');
    }
    
    setState({
      hasLaunchParams: !!launchParams,
      hasInitData: !!initDataRaw,
      hasUser: !!launchParams?.tgWebAppData?.user,
      platform: String(launchParams?.tgWebAppPlatform || 'unknown'),
      errors // Используем локальную переменную
    });
  }, [launchParams, initDataRaw]); // Убрали errors из зависимостей

  return state;
}
