'use client';

import { useEffect, useState } from 'react';

/**
 * ТЕСТОВЫЙ КОМПОНЕНТ ДЛЯ ПРОВЕРКИ TELEGRAM WEBAPP API
 * Проверяет доступность и работу нативного Telegram WebApp API
 * Заменяет проблемные SDK v3.x хуки
 */
export function TelegramSDKTest() {
  const [telegramData, setTelegramData] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const webApp = window.Telegram?.WebApp;
      
      if (webApp) {
        setIsAvailable(true);
        
        const data = {
          // Основные данные WebApp
          version: webApp.version,
          platform: webApp.platform,
          colorScheme: webApp.colorScheme,
          isExpanded: webApp.isExpanded,
          viewportHeight: webApp.viewportHeight,
          viewportStableHeight: webApp.viewportStableHeight,
          
          // Данные пользователя
          initData: webApp.initData,
          initDataUnsafe: webApp.initDataUnsafe,
          
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
          }
        };
        
        setTelegramData(data);
        
        console.log('🔍 Telegram WebApp Test Results:');
        console.log('📦 WebApp Data:', data);
        console.log('👤 User Data:', webApp.initDataUnsafe?.user);
        console.log('🎨 Theme Params:', webApp.themeParams);
        
      } else {
        setIsAvailable(false);
        console.log('❌ Telegram WebApp not available');
      }
    }
  }, []);

  const testHapticFeedback = () => {
    if (telegramData?.availableMethods.hapticFeedback) {
      window.Telegram?.WebApp.HapticFeedback?.impactOccurred('medium');
    }
  };

  const testAlert = () => {
    if (telegramData?.availableMethods.showAlert) {
      window.Telegram?.WebApp.showAlert('Тест нативного Telegram WebApp API!');
    } else {
      alert('Fallback alert: Telegram WebApp недоступен');
    }
  };

  const testBackButton = () => {
    if (telegramData?.availableMethods.backButton) {
      const backBtn = window.Telegram?.WebApp.BackButton;
      if (backBtn?.isVisible) {
        backBtn.hide();
      } else {
        backBtn?.show();
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🧪 Telegram WebApp API Test</h2>
      
      <div className="mb-6">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isAvailable 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isAvailable ? '✅ Telegram WebApp Available' : '❌ Telegram WebApp Not Available'}
        </div>
      </div>

      {isAvailable && telegramData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Основная информация */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-3">📱 WebApp Info</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Version:</strong> {telegramData.version}</div>
              <div><strong>Platform:</strong> {telegramData.platform}</div>
              <div><strong>Color Scheme:</strong> {telegramData.colorScheme}</div>
              <div><strong>Is Expanded:</strong> {telegramData.isExpanded ? 'Yes' : 'No'}</div>
              <div><strong>Viewport:</strong> {telegramData.viewportHeight}px</div>
              <div><strong>Stable Height:</strong> {telegramData.viewportStableHeight}px</div>
            </div>
          </div>

          {/* Данные пользователя */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-3">👤 User Data</h3>
            <div className="text-sm text-gray-600 space-y-1">
              {telegramData.initDataUnsafe?.user ? (
                <>
                  <div><strong>ID:</strong> {telegramData.initDataUnsafe.user.id}</div>
                  <div><strong>First Name:</strong> {telegramData.initDataUnsafe.user.first_name}</div>
                  <div><strong>Last Name:</strong> {telegramData.initDataUnsafe.user.last_name || 'N/A'}</div>
                  <div><strong>Username:</strong> {telegramData.initDataUnsafe.user.username || 'N/A'}</div>
                  <div><strong>Language:</strong> {telegramData.initDataUnsafe.user.language_code || 'N/A'}</div>
                  <div><strong>Is Premium:</strong> {telegramData.initDataUnsafe.user.is_premium ? 'Yes' : 'No'}</div>
                </>
              ) : (
                <div>No user data available</div>
              )}
            </div>
          </div>

          {/* Тема */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-3">🎨 Theme</h3>
            <div className="text-sm text-gray-600 space-y-2">
              {telegramData.themeParams ? (
                <>
                  <div className="flex items-center">
                    <strong>BG Color:</strong>
                    <span 
                      className="inline-block w-6 h-6 ml-2 rounded border"
                      style={{ backgroundColor: telegramData.themeParams.bg_color }}
                    ></span>
                    <span className="ml-2 font-mono text-xs">
                      {telegramData.themeParams.bg_color}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <strong>Text Color:</strong>
                    <span 
                      className="inline-block w-6 h-6 ml-2 rounded border"
                      style={{ backgroundColor: telegramData.themeParams.text_color }}
                    ></span>
                    <span className="ml-2 font-mono text-xs">
                      {telegramData.themeParams.text_color}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <strong>Button Color:</strong>
                    <span 
                      className="inline-block w-6 h-6 ml-2 rounded border"
                      style={{ backgroundColor: telegramData.themeParams.button_color }}
                    ></span>
                    <span className="ml-2 font-mono text-xs">
                      {telegramData.themeParams.button_color}
                    </span>
                  </div>
                </>
              ) : (
                <div>No theme data available</div>
              )}
            </div>
          </div>

          {/* Доступные методы */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="text-lg font-semibold mb-3">🛠 Available Methods</h3>
            <div className="text-sm text-gray-600 space-y-1">
              {Object.entries(telegramData.availableMethods).map(([method, available]) => (
                <div key={method} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <strong>{method}:</strong>
                  <span className="ml-1">{available ? 'Available' : 'Not Available'}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            ⚠️ Development Mode
          </h3>
          <p className="text-yellow-700">
            Telegram WebApp API недоступен. Это нормально при разработке вне Telegram.
            Для полного тестирования откройте приложение через Telegram бота.
          </p>
        </div>
      )}

      {/* Кнопки тестирования */}
      {isAvailable && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">🧪 Test Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={testHapticFeedback}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              disabled={!telegramData?.availableMethods.hapticFeedback}
            >
              Test Haptic Feedback
            </button>
            
            <button
              onClick={testAlert}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Test Alert
            </button>
            
            <button
              onClick={testBackButton}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              disabled={!telegramData?.availableMethods.backButton}
            >
              Toggle Back Button
            </button>
          </div>
        </div>
      )}

      {/* Raw Data */}
      {isAvailable && telegramData?.initData && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">🔍 Raw Init Data</h3>
          <div className="text-xs font-mono bg-white p-3 rounded border break-all">
            {telegramData.initData}
          </div>
        </div>
      )}

    </div>
  );
}
