'use client';

import { useState } from 'react';
import { useTelegramStars } from '@/hooks/use-telegram-stars';
import { PREMIUM_PLANS, PremiumPlan } from '@/lib/telegram-stars/plans';
import { Star, Check, X, Loader2 } from 'lucide-react';

interface PremiumPlansModalProps {
  businessId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PremiumPlansModal({ 
  businessId, 
  isOpen, 
  onClose, 
  onSuccess 
}: PremiumPlansModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);
  const { openBusinessSubscription, isAuthenticated } = useTelegramStars();
  
  if (!isOpen) return null;
  
  const handlePurchase = async (plan: PremiumPlan) => {
    if (!isAuthenticated) {
      alert('Необходима авторизация через Telegram');
      return;
    }
    
    setIsLoading(true);
    setSelectedPlan(plan);
    
    try {
      const result = await openBusinessSubscription({
        businessId,
        plan
      });
      
      if (result.status === 'paid') {
        onSuccess?.();
        onClose();
        alert('Подписка успешно активирована! 🎉');
      } else if (result.status === 'cancelled') {
        // Пользователь отменил платеж
        console.log('Payment cancelled by user');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при оплате');
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">⭐ Премиум планы</h2>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Plans */}
        <div className="p-6 space-y-4">
          {Object.entries(PREMIUM_PLANS).map(([key, plan]) => (
            <div 
              key={key}
              className={`border rounded-xl p-4 transition-all ${
                key === 'standard' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 
                key === 'premium' ? 'border-yellow-500 bg-yellow-50' :
                'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    {key === 'standard' && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        Популярный
                      </span>
                    )}
                    {key === 'premium' && (
                      <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
                        Лучший
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-700">
                      {plan.starsAmount} Stars
                    </span>
                    <span className="text-xs text-gray-500">
                      (~${plan.dollarPrice})
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => handlePurchase(key as PremiumPlan)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedPlan === key
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : key === 'standard'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : key === 'premium'  
                      ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                      : 'bg-gray-800 text-white hover:bg-gray-900'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {selectedPlan === key ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Обработка...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <span>Выбрать</span>
                    </div>
                  )}
                </button>
              </div>
              
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Подписка на {plan.duration} дней • Автоматическая активация
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-xl">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-2">
              💫 Оплата через Telegram Stars
            </p>
            <p className="text-xs text-gray-500">
              Подписка активируется автоматически после успешной оплаты.
              Никаких скрытых платежей или автопродления.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
