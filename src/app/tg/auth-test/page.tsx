// src/app/tg/auth-test/page.tsx
'use client';

import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Loader2, User, Database, Wifi, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthTestPage() {
  const { user, isLoading, error, isAuthenticated } = useSimpleAuth();
  const { logout } = useAuthStore();

  const telegramData = typeof window !== 'undefined' && window.Telegram?.WebApp ? {
    initData: window.Telegram.WebApp.initData,
    user: window.Telegram.WebApp.initDataUnsafe?.user,
    platform: window.Telegram.WebApp.platform,
    version: window.Telegram.WebApp.version,
  } : null;

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const testApiConnection = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      console.log('API Test Result:', data);
      alert(`API работает! Найдено ${data.length} категорий`);
    } catch (error) {
      console.error('API Test Error:', error);
      alert('Ошибка API: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Заголовок */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            3<span className="text-yellow-500">GIS</span> Auth Test
          </h1>
          <p className="text-gray-600">Диагностика системы авторизации</p>
        </div>

        {/* Статус авторизации */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold">Статус авторизации</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Загрузка:</span>
              <span className={`flex items-center ${isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                {isLoading ? 'Загружается...' : 'Завершена'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Авторизован:</span>
              <span className={isAuthenticated ? 'text-green-600 font-medium' : 'text-red-600'}>
                {isAuthenticated ? '✅ Да' : '❌ Нет'}
              </span>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Данные пользователя */}
        {user && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Database className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-lg font-semibold">Данные пользователя</h2>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-mono">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Telegram ID:</span>
                <span className="font-mono">{user.telegramId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Имя:</span>
                <span>{user.firstName} {user.lastName}</span>
              </div>
              {user.username && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Username:</span>
                  <span>@{user.username}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Роль:</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {user.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Премиум:</span>
                <span>{user.isPremium ? '✅' : '❌'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Зарегистрирован:</span>
                <span>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Telegram данные */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <Wifi className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold">Telegram WebApp</h2>
          </div>
          
          {telegramData ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Платформа:</span>
                <span>{telegramData.platform || 'Не определена'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Версия:</span>
                <span>{telegramData.version || 'Не определена'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">InitData:</span>
                <span className={telegramData.initData ? 'text-green-600' : 'text-red-600'}>
                  {telegramData.initData ? '✅ Доступен' : '❌ Отсутствует'}
                </span>
              </div>
              {telegramData.user && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <p className="font-medium text-gray-900 mb-2">Telegram User:</p>
                  <div className="space-y-1 text-xs">
                    <div>ID: {telegramData.user.id}</div>
                    <div>Имя: {telegramData.user.first_name} {telegramData.user.last_name}</div>
                    {telegramData.user.username && <div>Username: @{telegramData.user.username}</div>}
                    <div>Язык: {telegramData.user.language_code}</div>
                    <div>Премиум: {telegramData.user.is_premium ? 'Да' : 'Нет'}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-gray-600">Telegram WebApp недоступен</p>
              <p className="text-sm text-gray-500">Откройте через Telegram бота</p>
            </div>
          )}
        </div>

        {/* Переменные окружения */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-5 w-5 text-purple-500 mr-2" />
            <h2 className="text-lg font-semibold">Environment</h2>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">NODE_ENV:</span>
              <span className="font-mono">{process.env.NODE_ENV}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SKIP_TELEGRAM_VALIDATION:</span>
              <span className="font-mono">{process.env.SKIP_TELEGRAM_VALIDATION || 'false'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">App URL:</span>
              <span className="font-mono text-xs">{process.env.NEXT_PUBLIC_APP_URL || 'не задан'}</span>
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Действия</h2>
          
          <div className="space-y-3">
            <Button 
              onClick={testApiConnection}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              <Wifi className="h-4 w-4 mr-2" />
              Тест API подключения
            </Button>
            
            {isAuthenticated && (
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
              >
                Выйти из аккаунта
              </Button>
            )}
            
            <Button 
              onClick={() => window.location.href = '/tg'}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              Вернуться в приложение
            </Button>
          </div>
        </div>

        {/* localStorage данные */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">localStorage</h2>
          
          <div className="space-y-2 text-sm">
            {typeof window !== 'undefined' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">3gis_auth_token:</span>
                  <span className={localStorage.getItem('3gis_auth_token') ? 'text-green-600' : 'text-gray-400'}>
                    {localStorage.getItem('3gis_auth_token') ? '✅ Есть' : '❌ Нет'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">auth_token:</span>
                  <span className={localStorage.getItem('auth_token') ? 'text-green-600' : 'text-gray-400'}>
                    {localStorage.getItem('auth_token') ? '✅ Есть' : '❌ Нет'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">user:</span>
                  <span className={localStorage.getItem('user') ? 'text-green-600' : 'text-gray-400'}>
                    {localStorage.getItem('user') ? '✅ Есть' : '❌ Нет'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
