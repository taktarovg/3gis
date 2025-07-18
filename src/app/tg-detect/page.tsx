'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Smartphone, Monitor } from 'lucide-react';

/**
 * ✅ СТРАНИЦА JAVASCRIPT ДЕТЕКЦИИ v15
 * 
 * Используется для определения Telegram Mini App через JavaScript API
 * когда server-side детекция дает неопределенный результат
 */

interface DetectionResult {
  isTelegram: boolean;
  method: string;
  details: Record<string, any>;
}

export default function TelegramDetectionPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [countdown, setCountdown] = useState(5);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const redirectPath = searchParams.get('redirect') || '/tg';
  const startApp = searchParams.get('startapp');
  
  /**
   * ✅ ПЕРЕНАПРАВЛЕНИЕ НА ОСНОВЕ РЕЗУЛЬТАТА
   */
  const handleRedirect = useCallback((isTelegram: boolean): void => {
    if (isTelegram) {
      // Telegram подтвержден - идем к целевой странице с флагом
      const targetUrl = new URL(redirectPath, window.location.origin);
      targetUrl.searchParams.set('_detected', 'telegram');
      
      if (startApp) {
        targetUrl.searchParams.set('startapp', startApp);
      }
      
      console.log('[TG Detection JS] ✅ Redirecting to Telegram Mini App:', targetUrl.pathname);
      router.push(targetUrl.pathname + targetUrl.search);
    } else {
      // Обычный браузер - идем на страницу редиректа
      const redirectUrl = new URL('/tg-redirect', window.location.origin);
      redirectUrl.searchParams.set('_detected', 'browser');
      
      if (startApp) {
        redirectUrl.searchParams.set('startapp', startApp);
      }
      
      console.log('[TG Detection JS] ❌ Redirecting to browser redirect page');
      router.push(redirectUrl.pathname + redirectUrl.search);
    }
  }, [redirectPath, startApp, router]);
  
  useEffect(() => {
    performTelegramDetection();
  }, []);
  
  useEffect(() => {
    if (detectionResult && !isLoading) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleRedirect(detectionResult.isTelegram);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [detectionResult, isLoading, handleRedirect]);
  
  /**
   * ✅ JAVASCRIPT ДЕТЕКЦИЯ TELEGRAM (клиентская сторона)
   */
  async function performTelegramDetection(): Promise<void> {
    console.log('[TG Detection JS] Starting JavaScript-based detection...');
    
    const result: DetectionResult = {
      isTelegram: false,
      method: 'unknown',
      details: {}
    };
    
    try {
      // Метод 1: Проверка window.Telegram.WebApp (основной)
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        console.log('[TG Detection JS] ✅ Method 1: window.Telegram.WebApp detected');
        
        result.isTelegram = true;
        result.method = 'WebApp_API';
        result.details = {
          version: window.Telegram.WebApp.version,
          platform: window.Telegram.WebApp.platform,
          isExpanded: window.Telegram.WebApp.isExpanded,
          colorScheme: window.Telegram.WebApp.colorScheme,
          initData: !!window.Telegram.WebApp.initData
        };
        
        setDetectionResult(result);
        setIsLoading(false);
        return;
      }
      
      // Метод 2: Проверка TelegramWebviewProxy (iOS)
      if (typeof window !== 'undefined' && 
          ((window as any).TelegramWebviewProxy || (window as any).TelegramWebviewProxyProto)) {
        console.log('[TG Detection JS] ✅ Method 2: TelegramWebviewProxy detected (iOS)');
        
        result.isTelegram = true;
        result.method = 'iOS_WebviewProxy';
        result.details = {
          hasProxy: !!(window as any).TelegramWebviewProxy,
          hasProxyProto: !!(window as any).TelegramWebviewProxyProto
        };
        
        setDetectionResult(result);
        setIsLoading(false);
        return;
      }
      
      // Метод 3: Проверка TelegramWebview (Android)
      if (typeof window !== 'undefined' && (window as any).TelegramWebview) {
        console.log('[TG Detection JS] ✅ Method 3: TelegramWebview detected (Android)');
        
        result.isTelegram = true;
        result.method = 'Android_Webview';
        result.details = {
          hasWebview: !!(window as any).TelegramWebview
        };
        
        setDetectionResult(result);
        setIsLoading(false);
        return;
      }
      
      // Метод 4: Проверка через postMessage API
      try {
        const messagePromise = new Promise((resolve) => {
          const messageHandler = (event: MessageEvent) => {
            if (event.data?.type === 'telegram_ping_response') {
              window.removeEventListener('message', messageHandler);
              resolve(true);
            }
          };
          
          window.addEventListener('message', messageHandler);
          
          // Отправляем ping сообщение
          window.postMessage({ type: 'telegram_ping' }, '*');
          
          // Таймаут через 1 секунду
          setTimeout(() => {
            window.removeEventListener('message', messageHandler);
            resolve(false);
          }, 1000);
        });
        
        const hasPostMessage = await messagePromise;
        if (hasPostMessage) {
          console.log('[TG Detection JS] ✅ Method 4: PostMessage API responded');
          
          result.isTelegram = true;
          result.method = 'PostMessage_API';
          result.details = { postMessageResponse: true };
          
          setDetectionResult(result);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log('[TG Detection JS] Method 4 failed:', error);
      }
      
      // Метод 5: Проверка характеристик WebRTC (fallback)
      const supportsWebRTC = !!(window.RTCPeerConnection);
      if (!supportsWebRTC) {
        console.log('[TG Detection JS] 🤔 Method 5: No WebRTC support (might be Telegram)');
        
        result.isTelegram = true;
        result.method = 'WebRTC_Absence';
        result.details = { 
          webRTCSupport: false,
          note: 'Telegram WebApp often lacks WebRTC support' 
        };
        
        setDetectionResult(result);
        setIsLoading(false);
        return;
      }
      
      // Метод 6: Анализ navigator и window объектов
      // ✅ ИСПРАВЛЕНО: Безопасная проверка экспериментальных API
      const navigatorFeatures = {
        mediaDevices: !!navigator.mediaDevices,
        serviceWorker: !!navigator.serviceWorker,
        permissions: !!navigator.permissions,
        bluetooth: !!(navigator as any).bluetooth, // Безопасное приведение типа
        usb: !!(navigator as any).usb // Безопасное приведение типа
      };
      
      const windowFeatures = {
        localStorage: (() => {
          try {
            return !!window.localStorage;
          } catch {
            return false;
          }
        })(),
        indexedDB: !!window.indexedDB,
        webGL: (() => {
          try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
          } catch {
            return false;
          }
        })()
      };
      
      // Если отсутствует множество браузерных API - возможно Telegram WebView
      const missingFeatures = Object.values({...navigatorFeatures, ...windowFeatures}).filter(v => !v).length;
      
      if (missingFeatures >= 3) {
        console.log('[TG Detection JS] 🤔 Method 6: Multiple browser features missing (might be Telegram WebView)');
        
        result.isTelegram = true;
        result.method = 'Feature_Analysis';
        result.details = {
          navigatorFeatures,
          windowFeatures,
          missingFeaturesCount: missingFeatures
        };
        
        setDetectionResult(result);
        setIsLoading(false);
        return;
      }
      
      // Все методы провалены - скорее всего обычный браузер
      console.log('[TG Detection JS] ❌ All detection methods failed - likely regular browser');
      
      result.isTelegram = false;
      result.method = 'Regular_Browser';
      result.details = {
        navigatorFeatures,
        windowFeatures,
        userAgent: navigator.userAgent
      };
      
    } catch (error) {
      console.error('[TG Detection JS] Detection error:', error);
      
      result.isTelegram = false;
      result.method = 'Error';
      result.details = { error: (error as Error).message };
    }
    
    setDetectionResult(result);
    setIsLoading(false);
  }
  
  /**
   * ✅ РУЧНОЙ ОБХОД для пользователя
   */
  const manualOverride = useCallback((forceTelegram: boolean): void => {
    console.log(`[TG Detection JS] Manual override: ${forceTelegram ? 'Telegram' : 'Browser'}`);
    handleRedirect(forceTelegram);
  }, [handleRedirect]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          {/* Заголовок */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              {isLoading ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              ) : detectionResult?.isTelegram ? (
                <Smartphone className="w-8 h-8 text-green-600" />
              ) : (
                <Monitor className="w-8 h-8 text-orange-600" />
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Определение платформы
            </h1>
            
            <p className="text-gray-600">
              Проверяем, используете ли вы Telegram Mini App
            </p>
          </div>
          
          {/* Процесс загрузки */}
          {isLoading && (
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-3">
                Анализируем ваше окружение...
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}
          
          {/* Результат детекции */}
          {detectionResult && !isLoading && (
            <div className="mb-6">
              <div className={`p-4 rounded-lg mb-4 ${
                detectionResult.isTelegram 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-orange-50 border border-orange-200'
              }`}>
                <div className={`font-semibold ${
                  detectionResult.isTelegram ? 'text-green-800' : 'text-orange-800'
                }`}>
                  {detectionResult.isTelegram ? '✅ Telegram Mini App' : '❌ Обычный браузер'}
                </div>
                
                <div className={`text-sm mt-1 ${
                  detectionResult.isTelegram ? 'text-green-600' : 'text-orange-600'
                }`}>
                  Метод: {detectionResult.method}
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                {detectionResult.isTelegram 
                  ? `Перенаправление через ${countdown} сек...`
                  : `Перенаправление через ${countdown} сек...`
                }
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(5 - countdown) * 20}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Кнопки ручного управления */}
          {detectionResult && !isLoading && (
            <div className="space-y-3">
              <button
                onClick={() => manualOverride(true)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                📱 Я использую Telegram
              </button>
              
              <button
                onClick={() => manualOverride(false)}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                🌐 Я использую браузер
              </button>
            </div>
          )}
          
          {/* Детали для разработчиков */}
          {detectionResult && process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                🔧 Детали детекции (dev mode)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(detectionResult.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ ИСПРАВЛЕНО: Убраны дублирующиеся декларации типов
// Используем типы из /src/types/telegram.ts
