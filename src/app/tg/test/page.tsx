'use client';

import { useTelegram } from '@/components/providers/TelegramProvider';
import { useRawInitData } from '@telegram-apps/sdk-react'; // ✅ ИСПРАВЛЕНИЕ: Отдельный хук для SDK v3.x

export default function TestPage() {
  const { user, launchParams, isReady, isTelegramEnvironment, error } = useTelegram();
  
  // ✅ ИСПРАВЛЕНИЕ SDK v3.x: Используем отдельный хук для rawInitData
  const rawInitData = useRawInitData();

  if (!isReady) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">3GIS Telegram SDK v3.x Test</h1>
      
      <div className="bg-gray-100 p-3 rounded">
        <h2 className="font-semibold">Status</h2>
        <p>Ready: {isReady ? '✅' : '❌'}</p>
        <p>Telegram Environment: {isTelegramEnvironment ? '✅' : '❌'}</p>
        <p>Error: {error || 'None'}</p>
      </div>

      <div className="bg-gray-100 p-3 rounded">
        <h2 className="font-semibold">User Data</h2>
        <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre>
      </div>

      <div className="bg-gray-100 p-3 rounded">
        <h2 className="font-semibold">Raw Init Data</h2>
        <pre className="text-xs">{rawInitData || 'No raw init data'}</pre>
      </div>

      <div className="bg-gray-100 p-3 rounded">
        <h2 className="font-semibold">Launch Params</h2>
        <pre className="text-xs">{JSON.stringify(launchParams, null, 2)}</pre>
      </div>
    </div>
  );
}
