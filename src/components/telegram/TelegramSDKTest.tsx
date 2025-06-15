'use client';

import { 
  useLaunchParams, 
  useRawInitData, 
  useRawLaunchParams,
  useWebApp,
  useViewport,
  useThemeParams 
} from '@telegram-apps/sdk-react';
import { useEffect } from 'react';

/**
 * ТЕСТОВЫЙ КОМПОНЕНТ ДЛЯ ПРОВЕРКИ SDK v3.x ХУКОВ
 * Проверяет правильность использования всех основных хуков
 */
export function TelegramSDKTest() {
  // ✅ Правильное использование хуков SDK v3.x без параметров
  const launchParams = useLaunchParams();
  const initDataRaw = useRawInitData();
  const rawLaunchParams = useRawLaunchParams();
  const webApp = useWebApp();
  const viewport = useViewport();
  const themeParams = useThemeParams();

  useEffect(() => {
    console.log('🔍 SDK v3.x Hooks Test Results:');
    console.log('📦 Launch Params:', launchParams);
    console.log('📄 Init Data Raw:', initDataRaw);
    console.log('🗂️ Raw Launch Params:', rawLaunchParams);
    console.log('🌐 Web App:', webApp);
    console.log('📱 Viewport:', viewport);
    console.log('🎨 Theme Params:', themeParams);

    // Проверка структуры данных v3.x
    if (launchParams) {
      console.log('✅ Launch Params Structure:');
      console.log('- tgWebAppData:', launchParams.tgWebAppData);
      console.log('- tgWebAppBotInline:', launchParams.tgWebAppBotInline);
      
      if (launchParams.tgWebAppData) {
        console.log('👤 User Data:', launchParams.tgWebAppData.user);
        console.log('📅 Auth Date:', launchParams.tgWebAppData.auth_date);
        console.log('🔑 Query ID:', launchParams.tgWebAppData.query_id);
      }
    }

    if (initDataRaw) {
      console.log('✅ Raw Init Data Length:', initDataRaw.length);
      console.log('✅ Raw Init Data Sample:', initDataRaw.substring(0, 100) + '...');
    }

  }, [launchParams, initDataRaw, rawLaunchParams, webApp, viewport, themeParams]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🧪 Telegram SDK v3.x Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Launch Params */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-3">📦 Launch Params</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Status: {launchParams ? '✅ Loaded' : '❌ Not Available'}</div>
            {launchParams && (
              <>
                <div>Bot Inline: {launchParams.tgWebAppBotInline ? 'Yes' : 'No'}</div>
                <div>Has Data: {launchParams.tgWebAppData ? 'Yes' : 'No'}</div>
                {launchParams.tgWebAppData?.user && (
                  <div>User ID: {launchParams.tgWebAppData.user.id}</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Init Data Raw */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-3">📄 Raw Init Data</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Status: {initDataRaw ? '✅ Available' : '❌ Not Available'}</div>
            {initDataRaw && (
              <>
                <div>Length: {initDataRaw.length} chars</div>
                <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-2 break-all">
                  {initDataRaw.substring(0, 80)}...
                </div>
              </>
            )}
          </div>
        </div>

        {/* Web App */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-3">🌐 Web App</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Status: {webApp ? '✅ Available' : '❌ Not Available'}</div>
            {webApp && (
              <>
                <div>Version: {webApp.version}</div>
                <div>Platform: {webApp.platform}</div>
                <div>Is Expanded: {webApp.isExpanded ? 'Yes' : 'No'}</div>
              </>
            )}
          </div>
        </div>

        {/* Theme Params */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-3">🎨 Theme</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Status: {themeParams ? '✅ Available' : '❌ Not Available'}</div>
            {themeParams && (
              <>
                <div>Color Scheme: {themeParams.colorScheme}</div>
                <div>BG Color: 
                  <span 
                    className="inline-block w-4 h-4 ml-2 rounded border"
                    style={{ backgroundColor: themeParams.bgColor }}
                  ></span>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Debug Info */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">🐛 Debug Info</h3>
        <div className="text-sm space-y-2">
          <div>Environment: {process.env.NODE_ENV}</div>
          <div>User Agent: {typeof window !== 'undefined' ? navigator.userAgent : 'Server'}</div>
          <div>Location: {typeof window !== 'undefined' ? window.location.href : 'Server'}</div>
        </div>
      </div>

    </div>
  );
}
