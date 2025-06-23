'use client';

import { useState } from 'react';
import { PremiumPlansModal } from '@/components/premium/PremiumPlansModal';
import { SubscriptionStatus } from '@/components/premium/SubscriptionStatus';
import { DonationWidget } from '@/components/donations/DonationWidget';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TestPaymentsPage() {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [businessId] = useState(1); // Тестовое заведение
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link 
          href="/tg" 
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Тестирование Telegram Stars</h1>
      </div>
      
      <div className="max-w-lg mx-auto space-y-6">
        {/* Статус подписки */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Статус подписки заведения</h2>
          <SubscriptionStatus businessId={businessId} />
        </div>
        
        {/* Кнопка открытия премиум планов */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Премиум планы</h2>
          <button
            onClick={() => setShowPremiumModal(true)}
            className="w-full bg-blue-500 text-white py-4 rounded-lg font-medium text-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            ⭐ Открыть премиум планы
          </button>
        </div>
        
        {/* Донаты */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Поддержка проекта</h2>
          <DonationWidget />
        </div>
        
        {/* Инструкции */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-yellow-800">📋 Инструкции для тестирования:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
            <li>Убедитесь что у вас есть Telegram Stars в приложении</li>
            <li>Выберите план для тестирования или сделайте донат</li>
            <li>Подтвердите оплату в Telegram (появится нативное окно оплаты)</li>
            <li>Проверьте активацию подписки или успешный донат</li>
            <li>Обновите страницу чтобы увидеть изменения статуса</li>
          </ol>
        </div>
        
        {/* Technical Info */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-gray-800">🔧 Техническая информация:</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>SDK версия:</strong> @telegram-apps/sdk v3.x</p>
            <p><strong>Тестовое заведение ID:</strong> {businessId}</p>
            <p><strong>Валюта:</strong> XTR (Telegram Stars)</p>
            <p><strong>Webhook:</strong> /api/payments/webhook</p>
          </div>
        </div>
      </div>
      
      {/* Модал премиум планов */}
      <PremiumPlansModal
        businessId={businessId}
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSuccess={() => {
          alert('🎉 Подписка активирована! Обновите страницу для просмотра изменений.');
          window.location.reload();
        }}
      />
    </div>
  );
}
