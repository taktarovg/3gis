'use client';

import { useEffect, useState } from 'react';
import { Crown, Calendar, Star, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTelegramStars } from '@/hooks/use-telegram-stars';

interface SubscriptionStatusProps {
  businessId: number;
}

interface Subscription {
  tier: string;
  endDate: string;
  status: string;
  starsAmount: number;
}

export function SubscriptionStatus({ businessId }: SubscriptionStatusProps) {
  const { rawInitData } = useTelegramStars();
  
  const { data: subscription, isLoading, error } = useQuery<Subscription | null>({
    queryKey: ['business-subscription', businessId],
    queryFn: async () => {
      if (!rawInitData) {
        throw new Error('Нет данных авторизации');
      }

      const response = await fetch(`/api/businesses/${businessId}/subscription`, {
        headers: {
          'Authorization': `tma ${rawInitData}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ошибка загрузки подписки');
      }

      const data = await response.json();
      return data.subscription;
    },
    enabled: !!rawInitData && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: false
  });
  
  if (isLoading) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center text-red-600">
          <Crown className="w-5 h-5 mr-2" />
          <span className="text-sm">Ошибка загрузки статуса подписки</span>
        </div>
      </div>
    );
  }
  
  if (!subscription || subscription.status === 'EXPIRED') {
    return (
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
            <Crown className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Базовый план</h3>
            <p className="text-sm text-gray-600">Обновите до премиум для больших возможностей</p>
          </div>
        </div>
      </div>
    );
  }
  
  const endDate = new Date(subscription.endDate);
  const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  const tierConfig = {
    BASIC: { name: 'Базовый', color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-100' },
    STANDARD: { name: 'Стандарт', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
    PREMIUM: { name: 'Премиум', color: 'from-yellow-400 to-yellow-600', bgColor: 'bg-yellow-50' }
  };
  
  const config = tierConfig[subscription.tier as keyof typeof tierConfig] || tierConfig.BASIC;
  
  return (
    <div className={`bg-gradient-to-r ${config.color} rounded-xl p-4 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{config.name} план</h3>
            <div className="flex items-center text-sm opacity-90 mt-1">
              <Calendar className="w-4 h-4 mr-1" />
              <span>
                {daysLeft > 0 ? `${daysLeft} дней осталось` : 'Истекает сегодня'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center text-sm opacity-90 mb-1">
            <Star className="w-4 h-4 mr-1 fill-current" />
            <span>{subscription.starsAmount} Stars</span>
          </div>
          <div className="text-xs opacity-75">
            {subscription.status === 'ACTIVE' ? '✅ Активна' : '⏳ Обработка'}
          </div>
        </div>
      </div>
      
      {/* Полоска прогресса */}
      <div className="mt-4">
        <div className="bg-white bg-opacity-20 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-300"
            style={{ 
              width: `${Math.max(0, Math.min(100, (daysLeft / 30) * 100))}%` 
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs opacity-75 mt-1">
          <span>Подписка</span>
          <span>{endDate.toLocaleDateString('ru-RU')}</span>
        </div>
      </div>
      
      {/* Предупреждение о скором истечении */}
      {daysLeft <= 7 && daysLeft > 0 && (
        <div className="mt-3 bg-white bg-opacity-20 rounded-lg p-2">
          <div className="text-xs font-medium">
            ⏰ Подписка истекает через {daysLeft} дней
          </div>
          <div className="text-xs opacity-90 mt-1">
            Продлите подписку, чтобы сохранить все премиум возможности
          </div>
        </div>
      )}
    </div>
  );
}
