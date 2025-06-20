// src/components/auth/MobileAuthHandler.tsx
'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Smartphone, RefreshCw, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Импорты SDK v3.x согласно актуальной документации
import { useLaunchParams, useRawInitData } from '@telegram-apps/sdk-react';

interface MobileAuthHandlerProps {
  children: React.ReactNode;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

/**
 * Специализированный компонент для обработки авторизации на мобильных устройствах
 * Обеспечивает лучший UX при работе с Telegram Mini App на смартфонах
 */
export function MobileAuthHandler({ 
  children, 
  isLoading, 
  error, 
  isAuthenticated 
}: MobileAuthHandlerProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [showAdvancedHelp, setShowAdvancedHelp] = useState(false);
  const [platform, setPlatform] = useState<{
    isMobile: boolean;
    isAndroid: boolean;
    isIOS: boolean;
    isTelegramApp: boolean;
    platform: string;
  }>({
    isMobile: false,
    isAndroid: false,
    isIOS: false,
    isTelegramApp: false,
    platform: 'unknown'
  });

  // Получаем данные из SDK v3.x без условных вызовов (Rules of Hooks)
  const launchParams = useLaunchParams(true); // SSR-совместимый режим
  const initDataRaw = useRawInitData();

  // Определяем платформу при монтировании компонента
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isTelegramApp = userAgent.includes('telegram');
    
    // Определяем платформу из launchParams (SDK v3.x)
    const sdkPlatform = launchParams?.tgWebAppPlatform || 'unknown';

    setPlatform({
      isMobile,
      isAndroid,
      isIOS,
      isTelegramApp,
      platform: sdkPlatform
    });

    console.log('📱 Platform detection:', {
      isMobile,
      isAndroid,
      isIOS,
      isTelegramApp,
      platform: sdkPlatform,
      userAgent: userAgent.substring(0, 100),
      hasLaunchParams: !!launchParams,
      hasInitDataRaw: !!initDataRaw
    });
  }, [launchParams, initDataRaw]);

  // Автоматическая повторная попытка для мобильных устройств
  useEffect(() => {
    if (error && platform.isMobile && retryCount < 2) {
      console.log(`🔄 Auto-retry ${retryCount + 1}/2 for mobile device in 3 seconds...`);
      
      const timeout = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        window.location.reload();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [error, platform.isMobile, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    console.log('🔄 Manual retry attempt:', retryCount + 1);
    window.location.reload();
  };

  const handleAdvancedRetry = () => {
    console.log('🧹 Advanced retry: clearing storage...');
    // Очищаем localStorage и пробуем снова
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Cannot clear storage:', e);
    }
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  // Если авторизация прошла успешно
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Loading state с учетом мобильной специфики
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-6 bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
              <div className="absolute -inset-4 bg-blue-500/10 rounded-full animate-ping"></div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                3<span className="text-yellow-500">GIS</span>
              </h2>
              <p className="text-gray-600 text-sm">
                {platform.isMobile ? 'Подключаемся к Telegram...' : 'Авторизация...'}
              </p>
            </div>

            {/* Информация о платформе */}
            <div className="flex items-center space-x-2 text-blue-500 bg-blue-50 px-3 py-2 rounded-lg">
              <Smartphone className="h-4 w-4" />
              <span className="text-xs font-medium">
                {platform.isMobile 
                  ? `Mobile • ${platform.platform}`
                  : 'Desktop'
                }
              </span>
            </div>
            
            {/* Прогресс-бар */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full animate-pulse transition-all duration-1000" 
                   style={{ width: `${Math.min(100, (retryCount + 1) * 33)}%` }}></div>
            </div>
            
            {/* Дополнительная информация */}
            <div className="text-xs text-gray-500 text-center leading-relaxed space-y-1">
              <p>
                {platform.isMobile 
                  ? 'На мобильных устройствах инициализация может занять больше времени'
                  : 'Проверяем ваши данные Telegram'
                }
              </p>
              
              {/* Показываем техническую информацию для отладки */}
              {(retryCount > 0 || process.env.NODE_ENV === 'development') && (
                <div className="bg-gray-50 rounded p-2 mt-2 text-left">
                  <p className="text-xs text-gray-600">Debug:</p>
                  <ul className="text-xs text-gray-500 space-y-0.5">
                    <li>Platform: {platform.platform}</li>
                    <li>Launch params: {launchParams ? '✓' : '✗'}</li>
                    <li>Init data: {initDataRaw ? '✓' : '✗'}</li>
                    <li>Telegram app: {platform.isTelegramApp ? '✓' : '✗'}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state с мобильными рекомендациями
  if (error) {
    const isDataNotAvailable = error.includes('Telegram data not available') || 
                               error.includes('Ожидание данных Telegram');
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <div className="text-center max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <AlertCircle className="h-16 w-16 text-red-500" />
              <div className="absolute -inset-4 bg-red-500/10 rounded-full animate-pulse"></div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                {platform.isMobile ? 'Проблема с подключением' : 'Ошибка авторизации'}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {isDataNotAvailable
                  ? (platform.isMobile 
                      ? 'Telegram данные недоступны. Убедитесь, что приложение открыто через официального бота.'
                      : 'Данные Telegram недоступны. Попробуйте открыть приложение через бота @ThreeGIS_bot.'
                    )
                  : error
                }
              </p>
            </div>

            {/* Статус попыток */}
            {retryCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 w-full">
                <p className="text-xs text-yellow-800">
                  Попытка {retryCount + 1}/3
                  {platform.isMobile && ' • Мобильное устройство'}
                </p>
              </div>
            )}

            {/* Техническая информация */}
            <div className="bg-gray-50 rounded-lg p-3 w-full">
              <p className="text-xs text-gray-600 mb-2">Техническая информация:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Платформа:</span>
                  <br />
                  <span className="font-mono">{platform.platform}</span>
                </div>
                <div>
                  <span className="text-gray-500">Устройство:</span>
                  <br />
                  <span className="font-mono">
                    {platform.isMobile 
                      ? (platform.isIOS ? 'iOS' : platform.isAndroid ? 'Android' : 'Mobile')
                      : 'Desktop'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Telegram App:</span>
                  <br />
                  <span className="font-mono">{platform.isTelegramApp ? 'Да' : 'Нет'}</span>
                </div>
                <div>
                  <span className="text-gray-500">SDK Data:</span>
                  <br />
                  <span className="font-mono">
                    {launchParams && initDataRaw ? 'OK' : 'Отсутствует'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 w-full">
              <Button
                onClick={handleRetry}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={retryCount >= 3}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryCount >= 3 ? 'Слишком много попыток' : 'Попробовать снова'}
              </Button>

              {platform.isMobile && retryCount >= 1 && (
                <Button
                  onClick={() => setShowAdvancedHelp(!showAdvancedHelp)}
                  variant="outline"
                  className="w-full"
                >
                  {showAdvancedHelp ? 'Скрыть справку' : 'Нужна помощь?'}
                </Button>
              )}
            </div>

            {/* Расширенная справка для мобильных устройств */}
            {showAdvancedHelp && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full space-y-3">
                <h3 className="font-medium text-blue-900 text-sm flex items-center">
                  <Wifi className="h-4 w-4 mr-2" />
                  Шаги для решения проблемы:
                </h3>
                <ul className="text-xs text-blue-800 space-y-2">
                  <li>1. Полностью закройте и перезапустите Telegram</li>
                  <li>2. Проверьте стабильность интернет-соединения</li>
                  <li>3. Найдите бота @ThreeGIS_bot и нажмите "Запустить"</li>
                  <li>4. Обновите Telegram до последней версии</li>
                  {platform.isAndroid && (
                    <li>5. На Android: очистите кэш Telegram в настройках</li>
                  )}
                  {platform.isIOS && (
                    <li>5. На iOS: переустановите Telegram из App Store</li>
                  )}
                </ul>
                <Button
                  onClick={handleAdvancedRetry}
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                >
                  Очистить данные и перезагрузить
                </Button>
              </div>
            )}
            
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              {platform.isMobile 
                ? 'Приложение работает только внутри Telegram через бота @ThreeGIS_bot'
                : 'Это приложение предназначено для работы в Telegram Mini Apps'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback - показываем детей, если нет ошибок и загрузки
  return <>{children}</>;
}

/**
 * Хук для определения платформы и диагностики Telegram SDK v3.x
 */
export function useTelegramPlatform() {
  const [platformInfo, setPlatformInfo] = useState<{
    isMobile: boolean;
    isAndroid: boolean;
    isIOS: boolean;
    isDesktop: boolean;
    isTelegramApp: boolean;
    platform: string;
    hasWebAppData: boolean;
    hasInitData: boolean;
    debugInfo: string;
  }>({
    isMobile: false,
    isAndroid: false,
    isIOS: false,
    isDesktop: false,
    isTelegramApp: false,
    platform: 'unknown',
    hasWebAppData: false,
    hasInitData: false,
    debugInfo: ''
  });

  // Получаем данные из SDK v3.x без условных вызовов (Rules of Hooks)
  const launchParams = useLaunchParams(true);
  const initDataRaw = useRawInitData();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent.toLowerCase();
    
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isDesktop = !isMobile;
    const isTelegramApp = userAgent.includes('telegram');
    
    // Получаем платформу из SDK v3.x
    const sdkPlatform = launchParams?.tgWebAppPlatform || 'unknown';
    const hasWebAppData = !!(launchParams?.tgWebAppData);
    const hasInitData = !!initDataRaw;

    const debugInfo = JSON.stringify({
      userAgent: userAgent.substring(0, 50) + '...',
      launchParamsKeys: launchParams ? Object.keys(launchParams) : [],
      initDataLength: initDataRaw?.length || 0,
      timestamp: new Date().toISOString()
    }, null, 2);

    setPlatformInfo({
      isMobile,
      isAndroid,
      isIOS,
      isDesktop,
      isTelegramApp,
      platform: sdkPlatform,
      hasWebAppData,
      hasInitData,
      debugInfo
    });
  }, [launchParams, initDataRaw]);

  return platformInfo;
}

/**
 * Компонент для отображения отладочной информации о платформе
 */
export function PlatformDebugInfo() {
  const platformInfo = useTelegramPlatform();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg max-w-xs">
      <h4 className="font-bold mb-2">Platform Debug (Dev Only)</h4>
      <div className="space-y-1">
        <div>Device: {platformInfo.isMobile ? 'Mobile' : 'Desktop'}</div>
        <div>OS: {platformInfo.isIOS ? 'iOS' : platformInfo.isAndroid ? 'Android' : 'Other'}</div>
        <div>Platform: {platformInfo.platform}</div>
        <div>Telegram: {platformInfo.isTelegramApp ? 'Yes' : 'No'}</div>
        <div>WebApp Data: {platformInfo.hasWebAppData ? 'Yes' : 'No'}</div>
        <div>Init Data: {platformInfo.hasInitData ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
}
