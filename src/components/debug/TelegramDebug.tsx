// src/components/debug/TelegramDebug.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * СТАБИЛЬНАЯ РЕАЛИЗАЦИЯ: Используем Native Telegram WebApp API
 * Заменяет проблемные хуки из SDK v3.x для гарантированной совместимости
 * 
 * Причина использования Native API вместо SDK:
 * - Native API официально поддерживается Telegram
 * - Более стабильный и предсказуемый
 * - Избегаем проблем с экспортами в SDK v3.x
 * - Уменьшаем размер bundle
 */
function useTelegramNativeData() {
  const [webAppData, setWebAppData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const webApp = window.Telegram?.WebApp;
      
      if (webApp) {
        // Создаем структуру данных аналогичную SDK v3.x
        const nativeData = {
          // Основная информация WebApp
          version: webApp.version,
          platform: webApp.platform,
          colorScheme: webApp.colorScheme,
          isExpanded: webApp.isExpanded,
          viewportHeight: webApp.viewportHeight,
          viewportStableHeight: webApp.viewportStableHeight,
          
          // Данные пользователя (аналог tgWebAppData)
          tgWebAppData: webApp.initDataUnsafe,
          user: webApp.initDataUnsafe?.user,
          
          // Сырые данные инициализации
          initDataRaw: webApp.initData,
          
          // Параметры запуска (аналог launchParams)
          tgWebAppPlatform: webApp.platform,
          tgWebAppVersion: webApp.version,
          tgWebAppStartParam: (webApp.initDataUnsafe as any)?.start_param, // ✅ Type assertion для start_param (существует в реальном API)
          tgWebAppBotInline: false,
          
          // Тема
          themeParams: webApp.themeParams,
          
          // Доступные методы
          availableMethods: {
            ready: typeof webApp.ready === 'function',
            expand: typeof webApp.expand === 'function',
            close: typeof webApp.close === 'function',
            showAlert: typeof webApp.showAlert === 'function',
            showConfirm: typeof webApp.showConfirm === 'function',
            hapticFeedback: !!webApp.HapticFeedback,
            backButton: !!webApp.BackButton,
            mainButton: !!webApp.MainButton,
            secondaryButton: !!(webApp as any).SecondaryButton // ✅ Type assertion для SecondaryButton (новая функция API)
          }
        };
        
        setWebAppData(nativeData);
      } else {
        // Мок данные для разработки (аналогично SDK v3.x mock)
        const mockData = {
          version: '7.0',
          platform: 'tdesktop',
          colorScheme: 'light',
          isExpanded: true,
          viewportHeight: 600,
          viewportStableHeight: 600,
          
          tgWebAppData: {
            user: {
              id: 99281932,
              first_name: 'Георгий',
              last_name: 'Тактаров',
              username: 'taktarovgv',
              language_code: 'ru',
              is_premium: false,
              allows_write_to_pm: true
            },
            auth_date: Math.floor(Date.now() / 1000),
            hash: '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'
          },
          user: {
            id: 99281932,
            first_name: 'Георгий',
            last_name: 'Тактаров',
            username: 'taktarovgv',
            language_code: 'ru',
            is_premium: false,
            allows_write_to_pm: true
          },
          
          initDataRaw: 'user=%7B%22id%22%3A99281932%2C%22first_name%22%3A%22%D0%93%D0%B5%D0%BE%D1%80%D0%B3%D0%B8%D0%B9%22%7D&auth_date=1640995200&hash=abc123',
          
          tgWebAppPlatform: 'tdesktop',
          tgWebAppVersion: '7.0',
          tgWebAppStartParam: 'debug',
          tgWebAppBotInline: false,
          
          themeParams: {
            bg_color: '#ffffff',
            text_color: '#000000',
            hint_color: '#999999',
            link_color: '#3390ec',
            button_color: '#3390ec',
            button_text_color: '#ffffff'
          },
          
          availableMethods: {
            ready: false,
            expand: false,
            close: false,
            showAlert: false,
            showConfirm: false,
            hapticFeedback: false,
            backButton: false,
            mainButton: false,
            secondaryButton: false
          }
        };
        
        setWebAppData(mockData);
      }
      
      setIsLoading(false);
    }
  }, []);

  return { webAppData, isLoading };
}

/**
 * Компонент для отладки Telegram WebApp (Native API)
 * СТАБИЛЬНАЯ АЛЬТЕРНАТИВА проблемным хукам из SDK v3.x
 */
export function TelegramDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { webAppData, isLoading } = useTelegramNativeData();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]); // Последние 20 логов
  };

  useEffect(() => {
    if (!isLoading) {
      addLog(`WebApp data: ${webAppData ? 'LOADED' : 'NULL'}`);
      addLog(`Native API: ${typeof window !== 'undefined' && window.Telegram?.WebApp ? 'AVAILABLE' : 'FALLBACK'}`);
    }
  }, [webAppData, isLoading]);

  // Показываем только в development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Loading состояние
  if (isLoading) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button variant="outline" size="sm" className="bg-black/80 text-white border-gray-600" disabled>
          🔄 Loading...
        </Button>
      </div>
    );
  }

  const user = webAppData?.user;
  const isNative = typeof window !== 'undefined' && !!window.Telegram?.WebApp;

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
              <CardTitle className="text-sm">
                3GIS Debug {isNative ? '(Native API)' : '(Mock)'}
              </CardTitle>
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
          <CardContent className="space-y-3 text-xs overflow-y-auto">
            {/* Статусы API */}
            <div className="space-y-1">
              <h4 className="font-semibold text-yellow-400">API Status:</h4>
              <div className="flex flex-wrap gap-1">
                <Badge variant={isNative ? "default" : "secondary"}>
                  Native: {isNative ? "✓" : "Mock"}
                </Badge>
                <Badge variant={webAppData?.initDataRaw ? "default" : "destructive"}>
                  InitData: {webAppData?.initDataRaw ? "✓" : "✗"}
                </Badge>
                <Badge variant={user ? "default" : "destructive"}>
                  User: {user ? "✓" : "✗"}
                </Badge>
              </div>
            </div>

            {/* Данные WebApp */}
            {webAppData && (
              <div className="space-y-1">
                <h4 className="font-semibold text-green-400">WebApp Info:</h4>
                <div className="bg-black/50 p-2 rounded text-xs font-mono">
                  <div>Platform: {String(webAppData.tgWebAppPlatform || 'unknown')}</div>
                  <div>Version: {String(webAppData.tgWebAppVersion || 'unknown')}</div>
                  <div>Start Param: {String(webAppData.tgWebAppStartParam || 'none')}</div>
                  <div>Color Scheme: {String(webAppData.colorScheme || 'unknown')}</div>
                  {webAppData.viewportHeight && (
                    <div>Viewport: {webAppData.viewportHeight}px</div>
                  )}
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
                  {user.photo_url && <div>Photo: ✓</div>}
                </div>
              </div>
            )}

            {/* InitData */}
            {webAppData?.initDataRaw && (
              <div className="space-y-1">
                <h4 className="font-semibold text-purple-400">Init Data:</h4>
                <div className="bg-black/50 p-2 rounded text-xs font-mono">
                  <div>Length: {webAppData.initDataRaw.length} chars</div>
                  <div className="truncate">Preview: {webAppData.initDataRaw.substring(0, 50)}...</div>
                </div>
              </div>
            )}

            {/* Тема */}
            {webAppData?.themeParams && (
              <div className="space-y-1">
                <h4 className="font-semibold text-pink-400">Theme:</h4>
                <div className="bg-black/50 p-2 rounded text-xs font-mono">
                  {Object.entries(webAppData.themeParams).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <span className="w-16 truncate">{key}:</span>
                      <span 
                        className="inline-block w-4 h-4 ml-1 mr-1 rounded border border-gray-500"
                        style={{ backgroundColor: String(value) }}
                      ></span>
                      <span className="font-mono text-xs">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Доступные методы */}
            {webAppData?.availableMethods && (
              <div className="space-y-1">
                <h4 className="font-semibold text-orange-400">Methods:</h4>
                <div className="bg-black/50 p-2 rounded text-xs">
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(webAppData.availableMethods).slice(0, 6).map(([method, available]) => (
                      <div key={method} className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-1 ${available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="truncate text-xs">{method}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Платформа */}
            <div className="space-y-1">
              <h4 className="font-semibold text-cyan-400">Browser:</h4>
              <div className="bg-black/50 p-2 rounded text-xs font-mono">
                {typeof window !== 'undefined' ? (
                  <>
                    <div>UA: {navigator.userAgent.substring(0, 30)}...</div>
                    <div>Mobile: {/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Yes' : 'No'}</div>
                    <div>TG App: {navigator.userAgent.includes('Telegram') ? 'Yes' : 'No'}</div>
                  </>
                ) : (
                  <div>SSR Mode</div>
                )}
              </div>
            </div>

            {/* Логи */}
            <div className="space-y-1">
              <h4 className="font-semibold text-gray-400">Logs:</h4>
              <div className="bg-black/50 p-2 rounded text-xs font-mono max-h-20 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-gray-500">No logs yet...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="text-gray-300 text-xs">
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
                Clear
              </Button>
              <Button
                onClick={() => {
                  const debugData = {
                    isNative,
                    webAppData: webAppData ? {
                      ...webAppData,
                      initDataRaw: webAppData.initDataRaw ? webAppData.initDataRaw.substring(0, 100) + '...' : null
                    } : null,
                    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'SSR',
                    timestamp: new Date().toISOString()
                  };
                  console.log('📊 3GIS Debug Data:', debugData);
                  addLog('Debug data logged to console');
                }}
                variant="outline"
                size="sm"
                className="text-xs h-6 border-gray-600 text-white hover:bg-white/20"
              >
                Console
              </Button>
              {isNative && webAppData?.availableMethods?.hapticFeedback && (
                <Button
                  onClick={() => {
                    try {
                      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
                      addLog('Haptic feedback triggered');
                    } catch (error) {
                      addLog('Haptic feedback failed');
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 border-gray-600 text-white hover:bg-white/20"
                >
                  Haptic
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Хук для отслеживания состояния Telegram WebApp (Native API)
 * СТАБИЛЬНАЯ АЛЬТЕРНАТИВА проблемным хукам из SDK v3.x
 */
export function useTelegramDebugState() {
  const [state, setState] = useState({
    hasWebApp: false,
    hasInitData: false,
    hasUser: false,
    platform: 'unknown',
    isNative: false,
    errors: [] as string[]
  });

  const { webAppData, isLoading } = useTelegramNativeData();

  useEffect(() => {
    if (!isLoading) {
      const errors: string[] = [];
      const isNative = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
      
      // Проверяем ошибки инициализации
      if (!isNative && process.env.NODE_ENV === 'production') {
        errors.push('Native Telegram WebApp not available in production');
      }
      if (!webAppData?.initDataRaw) {
        errors.push('Raw init data not available');
      }
      if (!webAppData?.user) {
        errors.push('User data not available');
      }
      
      setState({
        hasWebApp: !!webAppData,
        hasInitData: !!webAppData?.initDataRaw,
        hasUser: !!webAppData?.user,
        platform: String(webAppData?.tgWebAppPlatform || 'unknown'),
        isNative,
        errors
      });
    }
  }, [webAppData, isLoading]);

  return { ...state, isLoading };
}

/**
 * Утилиты для работы с Telegram WebApp (Native API)
 * СТАБИЛЬНАЯ АЛЬТЕРНАТИВА проблемным функциям из SDK v3.x
 */
export const TelegramNativeUtils = {
  /**
   * Проверка доступности Telegram WebApp
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
  },

  /**
   * Получение данных пользователя
   */
  getUser() {
    if (!this.isAvailable()) return null;
    return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
  },

  /**
   * Получение initData для аутентификации
   */
  getInitData(): string | null {
    if (!this.isAvailable()) return null;
    return window.Telegram?.WebApp?.initData || null;
  },

  /**
   * Получение start_param
   */
  getStartParam(): string | null {
    if (!this.isAvailable()) return null;
    return (window.Telegram?.WebApp?.initDataUnsafe as any)?.start_param || null; // ✅ Type assertion
  },

  /**
   * Haptic feedback
   */
  hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
    if (this.isAvailable()) {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(type);
    }
  },

  /**
   * Показ алерта
   */
  showAlert(message: string): void {
    if (this.isAvailable()) {
      window.Telegram?.WebApp?.showAlert(message);
    } else {
      alert(message);
    }
  },

  /**
   * Закрытие приложения
   */
  close(): void {
    if (this.isAvailable()) {
      window.Telegram?.WebApp?.close();
    }
  }
};
