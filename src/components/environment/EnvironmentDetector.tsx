// src/components/environment/EnvironmentDetector.tsx
'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Smartphone, AlertTriangle } from 'lucide-react';

interface EnvironmentState {
  isTelegramEnvironment: boolean;
  isMobile: boolean;
  userAgent: string;
  hasWebAppParams: boolean;
  loading: boolean;
}

/**
 * ✅ Компонент для детекции среды выполнения (SDK v3.x совместимый)
 * Безопасно определяет, запущено ли приложение внутри Telegram
 * Основан на актуальной документации @telegram-apps/sdk v3.10.1
 */
export function EnvironmentDetector({ children }: { children: React.ReactNode }) {
  const [env, setEnv] = useState<EnvironmentState>({
    isTelegramEnvironment: false,
    isMobile: false,
    userAgent: '',
    hasWebAppParams: false,
    loading: true
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Детекция среды выполнения с множественными проверками
    const detectEnvironment = () => {
      const userAgent = navigator.userAgent || '';
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      // ✅ Множественные проверки Telegram среды согласно SDK v3.x
      const checks = {
        // 1. Наличие объекта Telegram WebApp (основной индикатор)
        hasWebApp: !!(window as any)?.Telegram?.WebApp,
        
        // 2. Наличие параметров WebApp в URL (для прямых ссылок)
        hasWebAppParams: window.location.search.includes('tgWebApp') || 
                        window.location.hash.includes('tgWebApp'),
        
        // 3. User-Agent содержит Telegram
        hasTelegramUA: userAgent.includes('Telegram'),
        
        // 4. Наличие специфичных параметров запуска v3.x
        hasLaunchParams: window.location.search.includes('tgWebAppStartParam') ||
                        window.location.search.includes('tgWebAppPlatform') ||
                        window.location.hash.includes('tgWebAppStartParam'),
        
        // 5. Референсер от Telegram
        hasTelegramReferrer: document.referrer.includes('telegram') || 
                           document.referrer.includes('t.me'),

        // 6. Проверка через window.parent (для iframe)
        isInFrame: window !== window.parent,
        
        // 7. Наличие postMessage функций Telegram (разные платформы)
        hasPostMessage: !!(window as any)?.TelegramWebviewProxy?.postEvent ||
                       !!(window as any)?.external?.notify ||
                       !!(window as any)?.TelegramGameProxy,
                       
        // 8. Проверка наличия Telegram bridge функций
        hasTelegramBridge: !!(window as any)?.TelegramWebview ||
                          !!(window as any)?.TelegramWebApp
      };

      // ✅ Определяем Telegram среду по любому из критериев
      const isTelegramEnvironment = Object.values(checks).some(Boolean);

      console.log('🔍 Environment Detection (SDK v3.x):', {
        checks,
        isTelegramEnvironment,
        userAgent: userAgent.substring(0, 100) + '...',
        url: window.location.href,
        referrer: document.referrer
      });

      setEnv({
        isTelegramEnvironment,
        isMobile,
        userAgent,
        hasWebAppParams: checks.hasWebAppParams || checks.hasLaunchParams,
        loading: false
      });
    };

    // ✅ Небольшая задержка для полной загрузки окружения
    const timeoutId = setTimeout(detectEnvironment, 100);
    
    // ✅ Также проверяем после полной загрузки страницы
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', detectEnvironment);
    }
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('DOMContentLoaded', detectEnvironment);
    };
  }, []);

  // ✅ Показываем загрузку
  if (env.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Определение среды выполнения...</p>
        </div>
      </div>
    );
  }

  // ✅ Если НЕ в Telegram - показываем экран перенаправления
  if (!env.isTelegramEnvironment) {
    return <RedirectToTelegramScreen isMobile={env.isMobile} />;
  }

  // ✅ Если в Telegram - показываем основное приложение
  return <>{children}</>;
}

/**
 * ✅ Экран для пользователей, открывших ссылку вне Telegram
 * Совместимо с Next.js 15.3.3 и современными стандартами UX
 */
function RedirectToTelegramScreen({ isMobile }: { isMobile: boolean }) {
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ThreeGIS_bot';
  const appName = process.env.NEXT_PUBLIC_WEBSITE_NAME || '3GIS';
  
  // ✅ Генерируем правильную ссылку для Telegram Mini App
  const telegramLink = `https://t.me/${botUsername}/app`;
  
  const handleOpenInTelegram = () => {
    // ✅ Для мобильных устройств пробуем протокол, затем веб-ссылку
    if (isMobile) {
      const telegramProtocol = `tg://resolve?domain=${botUsername}&appname=app`;
      
      try {
        // Пробуем сначала через протокол
        window.location.href = telegramProtocol;
        
        // Fallback через веб-ссылку через задержку
        setTimeout(() => {
          window.open(telegramLink, '_blank', 'noopener,noreferrer');
        }, 1500);
      } catch (error) {
        // Если протокол не работает, сразу веб-ссылка
        window.open(telegramLink, '_blank', 'noopener,noreferrer');
      }
    } else {
      // ✅ Для десктопа открываем в новой вкладке
      window.open(telegramLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(telegramLink);
      alert('Ссылка скопирована в буфер обмена!');
    } catch (error) {
      // Fallback для старых браузеров
      prompt('Скопируйте эту ссылку:', telegramLink);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* ✅ Иконка предупреждения */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        {/* ✅ Заголовок */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Откройте в Telegram
        </h1>

        {/* ✅ Описание */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {appName} - это Telegram Mini App. Для корректной работы приложение должно быть открыто внутри мессенджера Telegram.
        </p>

        {/* ✅ Кнопка открытия */}
        <button
          onClick={handleOpenInTelegram}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors mb-4 flex items-center justify-center gap-2"
        >
          {isMobile ? <Smartphone className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
          Открыть в Telegram
        </button>

        {/* ✅ Альтернативная кнопка */}
        <button
          onClick={handleCopyLink}
          className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
        >
          Скопировать ссылку
        </button>

        {/* ✅ Инструкции */}
        <div className="mt-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-2">Как открыть:</h3>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Откройте Telegram</li>
            <li>2. Найдите бота @{botUsername}</li>
            <li>3. Нажмите кнопку "Запустить приложение"</li>
          </ol>
        </div>

        {/* ✅ Дополнительная информация */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">
            {appName} использует возможности Telegram для обеспечения безопасности и лучшего пользовательского опыта.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * ✅ Хук для получения информации о среде выполнения
 * Может использоваться в других компонентах для условной логики
 */
export function useEnvironmentDetection() {
  const [env, setEnv] = useState({
    isTelegramEnvironment: false,
    isMobile: false,
    userAgent: '',
    loading: true
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = navigator.userAgent || '';
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    const isTelegramEnvironment = !!(window as any)?.Telegram?.WebApp ||
                                 userAgent.includes('Telegram') ||
                                 window.location.search.includes('tgWebApp') ||
                                 window.location.hash.includes('tgWebApp');

    setEnv({
      isTelegramEnvironment,
      isMobile,
      userAgent,
      loading: false
    });
  }, []);

  return env;
}