'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, Settings, CheckCircle } from 'lucide-react';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Всегда включены
    analytics: false,
    marketing: false,
  });
  
  const pathname = usePathname();
  
  // НЕ показываем cookie баннер в Telegram Mini App
  const isTelegramApp = pathname.startsWith('/tg');
  
  useEffect(() => {
    // Не показываем в Telegram Mini App
    if (isTelegramApp) {
      return;
    }
    
    // Проверяем есть ли сохраненные настройки
    const savedConsent = localStorage.getItem('3gis-cookie-consent');
    if (!savedConsent) {
      setIsVisible(true);
    } else {
      const consent = JSON.parse(savedConsent);
      setPreferences(consent);
    }
  }, [isTelegramApp]);

  const handleAcceptAll = () => {
    const fullConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('3gis-cookie-consent', JSON.stringify(fullConsent));
    setPreferences(fullConsent);
    setIsVisible(false);
    
    // Инициализируем все сервисы
    initializeAnalytics();
  };

  const handleAcceptSelected = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('3gis-cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
    
    // Инициализируем только выбранные сервисы
    if (preferences.analytics) {
      initializeAnalytics();
    }
  };

  const handleRejectAll = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('3gis-cookie-consent', JSON.stringify(minimalConsent));
    setPreferences(minimalConsent);
    setIsVisible(false);
  };

  const initializeAnalytics = () => {
    // Инициализация Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  };

  // Не рендерим в Telegram Mini App
  if (isTelegramApp || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-6xl mx-auto">
        {!showSettings ? (
          // Основной баннер
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-2xl">🍪</span>
              <h3 className="font-semibold text-gray-900">Использование файлов cookie</h3>
            </div>
            
            <div className="flex-1 text-sm text-gray-600">
              Мы используем файлы cookie для улучшения работы сайта, персонализации 
              контента и анализа трафика. Вы можете управлять настройками cookie или принять все.
            </div>
            
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <button
                onClick={() => setShowSettings(true)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
              >
                <Settings className="w-4 h-4" />
                Настройки
              </button>
              
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Только необходимые
              </button>
              
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Принять все
              </button>
            </div>
          </div>
        ) : (
          // Детальные настройки
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Настройки cookie</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Необходимые cookie */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Необходимые</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Обеспечивают работу основных функций сайта. Всегда включены.
                  </p>
                </div>
                <div className="w-8 h-4 bg-green-600 rounded-full flex items-center justify-end px-1">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              
              {/* Аналитические cookie */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium">Аналитические</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Google Analytics для анализа использования сайта.
                  </p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                  className={`w-8 h-4 rounded-full flex items-center transition-colors ${
                    preferences.analytics ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                  } px-1`}
                >
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </button>
              </div>
              
              {/* Маркетинговые cookie */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium">Маркетинговые</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Для персонализации рекламы и контента.
                  </p>
                </div>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                  className={`w-8 h-4 rounded-full flex items-center transition-colors ${
                    preferences.marketing ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                  } px-1`}
                >
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </button>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleAcceptSelected}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Сохранить настройки
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              <a href="/legal/privacy" className="hover:underline">Политика конфиденциальности</a>
              {' • '}
              <a href="/legal/cookies" className="hover:underline">Подробнее о cookie</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
