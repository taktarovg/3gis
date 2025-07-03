'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Компонент для оптимизации работы с ссылкой https://www.3gis.biz/tg
 * Автоматически определяет среду и предлагает открыть в Telegram
 * 
 * Совместимо с @telegram-apps/sdk v3.x
 */

interface TelegramRedirectProps {
  botUsername?: string;
  appPath?: string;
  startParam?: string;
}

export function TelegramRedirect({ 
  botUsername = 'ThreeGIS_bot',
  appPath = 'app',
  startParam = 'web_redirect'
}: TelegramRedirectProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [userAgent, setUserAgent] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent.toLowerCase();
    setUserAgent(ua);

    // ✅ Проверяем, открыто ли уже в Telegram
    const isInTelegram = window.Telegram?.WebApp || 
                        ua.includes('telegram') ||
                        window.location.href.includes('tgWebAppData');

    setIsTelegram(isInTelegram);

    if (isInTelegram) {
      // Если уже в Telegram, перенаправляем на Mini App
      router.push('/tg');
      return;
    }

    // ✅ Если не в Telegram, показываем промпт
    setShowPrompt(true);

    // ✅ Автоматическое перенаправление через 3 секунды
    const autoRedirectTimer = setTimeout(() => {
      openInTelegram();
    }, 3000);

    return () => clearTimeout(autoRedirectTimer);
  }, [router, botUsername, appPath, startParam]);

  const openInTelegram = () => {
    // ✅ Создаем универсальную ссылку для открытия в Telegram
    const telegramUrl = `https://t.me/${botUsername}/${appPath}?startapp=${startParam}`;
    
    // ✅ Пробуем разные способы открытия в зависимости от платформы
    if (userAgent.includes('mobile')) {
      // На мобильных устройствах
      window.location.href = telegramUrl;
    } else {
      // На десктопе - открываем в новой вкладке
      window.open(telegramUrl, '_blank');
    }
  };

  const openWebVersion = () => {
    router.push('/tg');
  };

  // ✅ Если уже в Telegram, не показываем ничего
  if (isTelegram) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Перенаправление в 3GIS...</p>
        </div>
      </div>
    );
  }

  // ✅ Промпт для открытия в Telegram
  if (showPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          {/* Логотип */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              3GIS
            </div>
          </div>
          
          {/* Заголовок */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Открыть в Telegram?
          </h1>
          
          {/* Описание */}
          <p className="text-gray-600 mb-6">
            Для лучшего опыта рекомендуем открыть 3GIS в приложении Telegram
          </p>
          
          {/* Кнопки */}
          <div className="space-y-3">
            <button
              onClick={openInTelegram}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <span>📱</span>
              <span>Открыть в Telegram</span>
            </button>
            
            <button
              onClick={openWebVersion}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Продолжить в браузере
            </button>
          </div>
          
          {/* Таймер */}
          <p className="text-sm text-gray-500 mt-4">
            Автоматическое перенаправление через 3 секунды...
          </p>
          
          {/* Преимущества */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Преимущества Telegram версии:</p>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">🚀 Быстрее</span>
              <span className="bg-green-50 text-green-700 px-2 py-1 rounded">🔒 Безопаснее</span>
              <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">📲 Удобнее</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default TelegramRedirect;