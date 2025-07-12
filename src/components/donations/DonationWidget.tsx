'use client';

import { useState } from 'react';
import { Heart, Star, X, Loader2 } from 'lucide-react';

// ✅ ПРОСТАЯ версия DonationWidget без сложной логики для устранения SSR проблем
export function DonationWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleOpenClick = () => {
    setIsOpen(true);
  };
  
  const handleCloseClick = () => {
    setIsOpen(false);
  };

  const handleDonation = async (amount: string) => {
    setIsLoading(true);
    
    try {
      // Простая заглушка для донатов
      console.log('Donation clicked:', amount);
      alert(`Спасибо за желание поддержать проект! Функция доната будет доступна в следующих версиях. Сумма: ${amount} Stars`);
      setIsOpen(false);
    } catch (error) {
      console.error('Donation error:', error);
      alert('Ошибка при донате, попробуйте еще раз');
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
            onClick={handleOpenClick}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
            type="button"
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
          onClick={handleCloseClick}
          disabled={isLoading}
          className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          type="button"
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
        <DonationOption 
          icon="☕"
          title="Кофе для команды"
          amount="100"
          description="Поддержать проект"
          onDonate={handleDonation}
          isLoading={isLoading}
        />
        <DonationOption 
          icon="🍕"
          title="Пицца для команды"
          amount="250"
          description="Больше функций"
          onDonate={handleDonation}
          isLoading={isLoading}
        />
        <DonationOption 
          icon="🚀"
          title="Турбо развитие"
          amount="500"
          description="Новые города"
          onDonate={handleDonation}
          isLoading={isLoading}
        />
        <DonationOption 
          icon="💎"
          title="Премиум поддержка"
          amount="1000"
          description="VIP статус"
          onDonate={handleDonation}
          isLoading={isLoading}
        />
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

// ✅ Простой компонент для варианта доната
function DonationOption({ 
  icon, 
  title, 
  amount, 
  description, 
  onDonate, 
  isLoading 
}: {
  icon: string;
  title: string;
  amount: string;
  description: string;
  onDonate: (amount: string) => void;
  isLoading: boolean;
}) {
  return (
    <button
      onClick={() => onDonate(amount)}
      disabled={isLoading}
      className="border border-gray-200 rounded-lg p-4 text-left hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
      type="button"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-medium text-sm text-gray-900 group-hover:text-blue-900">
        {title}
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-gray-500">{amount} ⭐</div>
        <div className="text-xs text-green-600 font-medium">
          ~${(parseInt(amount) / 100).toFixed(1)}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </button>
  );
}
