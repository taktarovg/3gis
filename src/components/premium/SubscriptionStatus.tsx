'use client';

import { useEffect, useState, useCallback } from 'react';
import { Crown, Calendar, Star, AlertTriangle } from 'lucide-react';

interface SubscriptionStatusProps {
  businessId: number;
}

interface Subscription {
  id: number;
  tier: string;
  startDate: string;
  endDate: string;
  status: string;
  starsAmount: number;
  dollarPrice: number;
}

export function SubscriptionStatus({ businessId }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus, businessId]);
  
  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/businesses/${businessId}/subscription`);
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить статус подписки');
      }
      
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError(error instanceof Error ? error.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [businessId]);
  
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
          <div>
            <h3 className="font-medium text-red-900">Ошибка загрузки</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!subscription || subscription.status === 'EXPIRED' || subscription.status === 'CANCELLED') {
    return (
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
              <Crown className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Базовый план</h3>
              <p className="text-sm text-gray-600">Бесплатное размещение заведения</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Доступные функции:</p>
            <p className="text-xs text-gray-600">• Основная информация</p>
            <p className="text-xs text-gray-600">• До 3 фотографий</p>
          </div>
        </div>
      </div>
    );
  }
  
  const endDate = new Date(subscription.endDate);
  const now = new Date();
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysLeft <= 7;
  
  const tierConfig = {
    BASIC: { 
      name: 'Базовый', 
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-900'
    },
    STANDARD: { 
      name: 'Стандарт', 
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-100', 
      textColor: 'text-blue-900'
    },
    PREMIUM: { 
      name: 'Премиум', 
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-900'
    }
  };
  
  const config = tierConfig[subscription.tier as keyof typeof tierConfig] || tierConfig.BASIC;
  
  return (
    <div className={`bg-gradient-to-r ${config.color} rounded-lg p-4 text-white relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{config.name} план</h3>
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-medium">
                  Активен
                </span>
              </div>
              <div className="flex items-center text-sm opacity-90 mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                <span className={isExpiringSoon ? 'text-red-200 font-medium' : ''}>
                  {daysLeft > 0 ? (
                    daysLeft === 1 ? 'Истекает завтра' : `${daysLeft} дней осталось`
                  ) : (
                    'Истекает сегодня'
                  )}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center text-sm opacity-90 mb-1">
              <Star className="w-4 h-4 mr-1 fill-current" />
              <span>{subscription.starsAmount} Stars</span>
            </div>
            <p className="text-xs opacity-75">
              ${subscription.dollarPrice / 100} потрачено
            </p>
          </div>
        </div>
        
        {isExpiringSoon && (
          <div className="mt-3 pt-3 border-t border-white border-opacity-20">
            <div className="flex items-center justify-between">
              <p className="text-sm">
                ⚠️ Подписка скоро истечет
              </p>
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-lg text-sm font-medium transition-all">
                Продлить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
