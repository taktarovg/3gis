// src/components/auth/TelegramAuth.tsx
'use client';

import { useSimpleAuth } from '@/hooks/use-simple-auth';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface TelegramAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Компонент-обертка для авторизации через Telegram в 3GIS
 * Показывает loading state или ошибку пока происходит авторизация
 */
export function TelegramAuth({ children, fallback }: TelegramAuthProps) {
  const { user, isLoading, error } = useSimpleAuth();
  
  // Показываем loading state
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <div className="absolute -inset-2 bg-blue-500/20 rounded-full animate-pulse"></div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                3<span className="text-yellow-500">GIS</span>
              </h2>
              <p className="text-gray-600">
                Авторизация через Telegram...
              </p>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            
            <p className="text-sm text-gray-500">
              Подождите, мы проверяем ваши данные
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Показываем ошибку авторизации
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <AlertCircle className="h-16 w-16 text-red-500" />
              <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-pulse"></div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                Ошибка авторизации
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {error}
              </p>
            </div>
            
            <div className="space-y-3 w-full">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Попробовать снова
              </Button>
              
              <p className="text-xs text-gray-500 px-4">
                Убедитесь, что открываете приложение через официального Telegram бота @ThreeGIS_bot
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Показываем экран, если пользователь не найден
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
          <div className="flex flex-col items-center space-y-6">
            <div className="text-6xl">🔐</div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">
                Требуется авторизация
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Для использования 3GIS необходимо войти через Telegram
              </p>
            </div>
            
            <div className="space-y-3 w-full">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Войти через Telegram
              </Button>
              
              <p className="text-xs text-gray-500 px-4">
                Если проблема повторяется, попробуйте перезапустить Telegram
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Авторизация прошла успешно, показываем основное приложение
  return <>{children}</>;
}

/**
 * Компонент для отображения информации о текущем пользователе
 */
export function UserInfo() {
  const { user } = useSimpleAuth();
  
  if (!user) return null;
  
  return (
    <div className="flex items-center space-x-3">
      {user.avatar && (
        <Image 
          src={user.avatar} 
          alt={`${user.firstName} ${user.lastName}`}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
        />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">
          {user.firstName} {user.lastName}
        </span>
        {user.username && (
          <span className="text-xs text-gray-500">
            @{user.username}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Хук для проверки авторизации в компонентах
 */
export function useAuthGuard() {
  const { user, isLoading, error } = useSimpleAuth();
  
  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user && !error,
    requiresAuth: !user && !isLoading,
  };
}
