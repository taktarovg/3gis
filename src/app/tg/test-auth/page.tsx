'use client';

import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import { useRawInitData, useLaunchParams } from '@telegram-apps/sdk-react';
import { Loader2 } from 'lucide-react';

export default function TestAuthPage() {
  const { user, isLoading, error, isAuthenticated } = useTelegramAuth();
  const initDataRaw = useRawInitData();
  const launchParams = useLaunchParams(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Загрузка авторизации...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center">🧪 Тест авторизации 3GIS</h1>
        
        {/* Статус авторизации */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold mb-2">📊 Статус авторизации</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Авторизован:</span>
              <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                {isAuthenticated ? '✅ Да' : '❌ Нет'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Загрузка:</span>
              <span>{isLoading ? '⏳ Да' : '✅ Нет'}</span>
            </div>
            <div className="flex justify-between">
              <span>Ошибка:</span>
              <span className={error ? 'text-red-600' : 'text-green-600'}>
                {error ? '❌ Да' : '❌ Нет'}
              </span>
            </div>
          </div>
          {error && (
            <div className="mt-2 p-2 bg-red-100 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* SDK данные */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="font-semibold mb-2">🛠 SDK v3.x данные</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>initDataRaw:</span>
              <span className={initDataRaw ? 'text-green-600' : 'text-red-600'}>
                {initDataRaw ? '✅ Есть' : '❌ Нет'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>launchParams:</span>
              <span className={launchParams ? 'text-green-600' : 'text-red-600'}>
                {launchParams ? '✅ Есть' : '❌ Нет'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>tgWebAppData:</span>
              <span className={launchParams?.tgWebAppData ? 'text-green-600' : 'text-red-600'}>
                {launchParams?.tgWebAppData ? '✅ Есть' : '❌ Нет'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Telegram User:</span>
              <span className={launchParams?.tgWebAppData?.user ? 'text-green-600' : 'text-red-600'}>
                {launchParams?.tgWebAppData?.user ? '✅ Есть' : '❌ Нет'}
              </span>
            </div>
          </div>
        </div>

        {/* Информация о пользователе */}
        {user && (
          <div className="bg-white rounded-lg p-4 shadow">
            <h2 className="font-semibold mb-2">👤 Информация о пользователе</h2>
            <div className="flex items-center space-x-3 mb-3">
              {user.avatar && (
                <img 
                  src={user.avatar} 
                  alt="Аватар" 
                  className="w-16 h-16 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = 'https://avatar.iran.liara.run/public';
                  }}
                />
              )}
              <div>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-600">@{user.username}</p>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>ID:</span>
                <span>{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Telegram ID:</span>
                <span>{user.telegramId}</span>
              </div>
              <div className="flex justify-between">
                <span>Premium:</span>
                <span>{user.isPremium ? '⭐ Да' : '❌ Нет'}</span>
              </div>
              <div className="flex justify-between">
                <span>Аватар URL:</span>
                <span className="text-xs break-all">
                  {user.avatar || 'Нет'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Сырые данные для отладки */}
        <details className="bg-white rounded-lg p-4 shadow">
          <summary className="font-semibold cursor-pointer">🔍 Сырые данные (для отладки)</summary>
          <div className="mt-3 space-y-2">
            <div>
              <p className="text-sm font-medium">initDataRaw:</p>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {initDataRaw || 'null'}
              </pre>
            </div>
            <div>
              <p className="text-sm font-medium">launchParams:</p>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(launchParams, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
