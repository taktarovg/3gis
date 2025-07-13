'use client';

import { useEffect, useState, useCallback } from 'react';
import { ExternalLink, Smartphone, Download, Timer, AlertCircle, CheckCircle } from 'lucide-react';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import { openTelegramLink, openLink } from '@telegram-apps/sdk';
import { detectEnvironment, type EnvironmentType } from '@/components/redirect/EnvironmentDetector';
import { createRedirectHandlers } from '@/components/redirect/RedirectHandlers';

interface TelegramRedirectClientProps {
  startParam: string;
  botUsername: string;
  appName: string;
}

/**
 * ✅ ИСПРАВЛЕН Client Component - УБРАН БЕСКОНЕЧНЫЙ ЦИКЛ РЕДИРЕКТОВ
 * 
 * КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ v5:
 * - ❌ УДАЛЕН автоматический редирект для mini-app среды (причина бесконечного цикла)
 * - ✅ TelegramRedirectClient теперь ТОЛЬКО для браузеров ВНЕ Telegram
 * - ✅ Правильное определение среды без ложных срабатываний
 * - ✅ Безопасная логика редиректов без циклов
 */
export default function TelegramRedirectClient({ 
  startParam, 
  botUsername, 
  appName 
}: TelegramRedirectClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [userAgent, setUserAgent] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [environmentType, setEnvironmentType] = useState<EnvironmentType>('browser');
  const [autoMiniAppAttempted, setAutoMiniAppAttempted] = useState(false);
  
  const launchParams = useLaunchParams(true);
  
  // ✅ Создаем обработчики редиректов
  const redirectHandlers = createRedirectHandlers({
    startParam,
    botUsername,
    appName,
    launchParams,
    environmentType,
    redirectAttempted,
    setRedirectAttempted
  });
  
  // ✅ Инициализация
  useEffect(() => {
    setIsMounted(true);
    
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      setUserAgent(ua);
      
      const envInfo = detectEnvironment(launchParams);
      setEnvironmentType(envInfo.type);
      
      console.log('📱 TG-Redirect Client инициализирован:', {
        userAgent: ua.substring(0, 60) + '...',
        startParam,
        environmentType: envInfo.type,
        launchParams: launchParams ? 'доступны' : 'недоступны',
        url: window.location.href
      });
    }
  }, [launchParams, startParam]);
  
  // ✅ Автоматическое открытие Mini App для Telegram браузера
  useEffect(() => {
    if (!isMounted || autoMiniAppAttempted) return;
    
    if (environmentType === 'telegram-web') {
      console.log('🎯 Обнаружен Telegram браузер - попытка автоматического открытия Mini App');
      setAutoMiniAppAttempted(true);
      
      setTimeout(() => {
        redirectHandlers.tryOpenMiniApp();
      }, 1000);
    }
  }, [isMounted, environmentType, autoMiniAppAttempted, redirectHandlers]);
  
  // ❌ УДАЛЕН проблемный useEffect для mini-app редиректа!
  // Это была причина бесконечного цикла
  
  // ✅ Автоматический редирект для обычного браузера
  useEffect(() => {
    if (!isMounted || environmentType !== 'browser') return;
    if (redirectAttempted) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          redirectHandlers.handleTelegramRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isMounted, environmentType, redirectAttempted, redirectHandlers]);
  
  const isIOS = userAgent.includes('iPhone') || userAgent.includes('iPad');
  const isAndroid = userAgent.includes('Android');
  const isMobile = isIOS || isAndroid;
  
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Mini App показываем БЕЗ редиректа
  if (environmentType === 'mini-app') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Mini App активен!
          </h1>
          <p className="text-gray-600 mb-4">
            Вы уже находитесь в Telegram Mini App.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-center text-green-700 mb-2">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">3GIS готов к использованию</span>
            </div>
            <p className="text-sm text-green-600 mb-3">
              Нажмите кнопку ниже для перехода к каталогу
            </p>
            <button 
              onClick={() => {
                console.log('🎯 Переход на главную 3GIS');
                window.location.href = '/tg';
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Перейти к 3GIS
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // ✅ Telegram браузер
  if (environmentType === 'telegram-web') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">3GIS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Открываем Mini App
          </h1>
          <p className="text-gray-600 mb-4">
            Вы в Telegram! Автоматически открываем 3GIS Mini App
          </p>
          
          {autoMiniAppAttempted ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center text-blue-700 mb-2">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Команда отправлена</span>
              </div>
              <p className="text-sm text-blue-600">
                Mini App должен открыться автоматически
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center text-green-700 mb-2">
                <Timer className="w-5 h-5 mr-2 animate-spin" />
                <span className="font-medium">Подготовка к запуску</span>
              </div>
            </div>
          )}

          <button
            onClick={redirectHandlers.handleManualClick}
            className="w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Открыть Mini App вручную
          </button>
        </div>
      </div>
    );
  }
  
  // ✅ Обычный браузер
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">3GIS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            3GIS Mini App
          </h1>
          <p className="text-gray-600">
            Русскоязычный справочник организаций в США
          </p>
        </div>

        {/* Автоматический редирект индикатор */}
        {!redirectAttempted && countdown > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
            <div className="flex items-center justify-center mb-2">
              <Timer className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">
                Автоматическое перенаправление
              </span>
            </div>
            <div className="text-2xl font-bold text-green-700 mb-2">
              {countdown}
            </div>
            <p className="text-sm text-green-600 mb-3">
              Перенаправляем в Telegram через {countdown} сек...
            </p>
            <button 
              onClick={redirectHandlers.handleManualClick}
              className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors"
            >
              Перейти сейчас
            </button>
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={redirectHandlers.handleManualClick}
            disabled={redirectAttempted}
            className="w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            {redirectAttempted ? 'Перенаправление выполнено' : 'Открыть в Telegram'}
          </button>
        </div>

        {/* Инструкции для устройств */}
        {isMobile ? (
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center">
              <Smartphone className="w-4 h-4 mr-2" />
              {isIOS ? 'Для iPhone/iPad:' : 'Для Android:'}
            </h3>
            <ol className="text-sm text-green-700 text-left space-y-1">
              <li>1. Нажмите кнопку "Открыть в Telegram" выше</li>
              <li>2. В диалоге выберите "Открыть в Telegram"</li>
              <li>3. Если Telegram не установлен - установите из {isIOS ? 'App Store' : 'Google Play'}</li>
              <li>4. Mini App откроется автоматически</li>
            </ol>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">
              На компьютере:
            </h3>
            <ol className="text-sm text-gray-600 text-left space-y-1">
              <li>1. Установите Telegram Desktop</li>
              <li>2. Нажмите "Открыть в Telegram"</li>
              <li>3. Найдите @{botUsername} и запустите Mini App</li>
              <li>4. Или используйте веб-версию Telegram</li>
            </ol>
          </div>
        )}

        {/* Ссылка для скачивания Telegram */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-500 mb-3">
            Нет Telegram?
          </p>
          <a
            href={isIOS 
              ? "https://apps.apple.com/app/telegram-messenger/id686449807"
              : isAndroid 
              ? "https://play.google.com/store/apps/details?id=org.telegram.messenger"
              : "https://desktop.telegram.org/"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-500 hover:text-blue-600 font-medium transition-colors"
          >
            <Download className="w-4 h-4 mr-1" />
            Скачать Telegram
          </a>
        </div>
      </div>
    </div>
  );
}
