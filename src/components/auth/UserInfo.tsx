// src/components/auth/UserInfo.tsx
'use client';

import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import Image from 'next/image';

/**
 * Компонент для отображения информации о текущем пользователе
 */
export function UserInfo() {
  const { user } = useTelegramAuth();
  
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
  const { user, isLoading, error, isAuthenticated } = useTelegramAuth();
  
  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    requiresAuth: !user && !isLoading,
  };
}
