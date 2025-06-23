'use client';

import { useState } from 'react';
import { useTelegramStars } from '@/hooks/use-telegram-stars';
import { DONATION_OPTIONS, DonationType } from '@/lib/telegram-stars/plans';
import { Heart, Star, Coffee, X, Loader2 } from 'lucide-react';

export function DonationWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { openDonation, isAuthenticated } = useTelegramStars();
  
  const handleDonation = async (option: DonationType, customStars?: number) => {
    if (!isAuthenticated) {
      alert('Необходима авторизация через Telegram');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const starsAmount = customStars || DONATION_OPTIONS[option].starsAmount || 100;
      
      const result = await openDonation({
        type: option,
        starsAmount,
        message: `Донат: ${DONATION_OPTIONS[option].name}`
      });
      
      if (result.status === 'paid') {
        setIsOpen(false);
        setCustomAmount('');
        // Показать благодарность
        alert('Спасибо за поддержку! 🙏 Ваш донат поможет развивать 3GIS!');
      } else if (result.status === 'cancelled') {
        console.log('Donation cancelled by user');
      }
    } catch (error) {
      console.error('Donation error:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при донате, попробуйте еще раз');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) {
    return (
      <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-xl p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Поддержать 3GIS</h3>
              <p className="text-sm opacity-90">Помогите развивать проект для русскоязычных</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Star className="w-4 h-4 fill-current" />
            <span>Донат</span>
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Heart className="w-6 h-6 text-red-500 mr-3" />
          <h3 className="font-semibold text-lg text-gray-900">Поддержать разработку</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          disabled={isLoading}
          className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 mb-2">
          💡 <strong>3GIS помогает русскоговорящим найти нужные услуги в США</strong>
        </p>
        <p className="text-xs text-blue-700">
          Ваша поддержка поможет нам добавлять новые функции, расширяться на новые города 
          и делать поиск еще удобнее!
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        {Object.entries(DONATION_OPTIONS).filter(([key]) => key !== 'custom').map(([key, option]) => (
          <button
            key={key}
            onClick={() => handleDonation(key as DonationType)}
            disabled={isLoading}
            className="border border-gray-200 rounded-lg p-4 text-left hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="text-2xl mb-2">{option.icon}</div>
            <div className="font-medium text-sm text-gray-900 group-hover:text-blue-900">
              {option.name}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-500">{option.starsAmount} ⭐</div>
              <div className="text-xs text-green-600 font-medium">~${option.starsAmount / 100}</div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{option.description}</p>
          </button>
        ))}
      </div>
      
      {/* Кастомная сумма */}
      <div className="border-t pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Своя сумма Stars:
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="100"
              min="1"
              max="10000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Минимум 1 Star, максимум 10,000 Stars
            </p>
          </div>
          <button
            onClick={() => {
              const amount = parseInt(customAmount);
              if (amount > 0 && amount <= 10000) {
                handleDonation('custom', amount);
              } else {
                alert('Введите сумму от 1 до 10,000 Stars');
              }
            }}
            disabled={!customAmount || parseInt(customAmount) <= 0 || parseInt(customAmount) > 10000 || isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Star className="w-4 h-4 fill-current" />
            )}
            <span>{isLoading ? 'Обработка...' : 'Донат'}</span>
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-6 pt-4 border-t text-center">
        <p className="text-xs text-gray-500">
          💝 Все донаты идут на развитие проекта
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Спасибо за поддержку русскоязычного сообщества в США!
        </p>
      </div>
    </div>
  );
}
