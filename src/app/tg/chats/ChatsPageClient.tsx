'use client';

import { useState } from 'react';
import { ChatsList } from '@/components/chats/ChatsList';
import { SuggestChatModal } from '@/components/chats/SuggestChatModal';
import { useTelegramPopup } from '@/hooks/use-telegram-popup';
import { InfiniteLoopTesterWrapper } from '@/components/debug/InfiniteLoopTesterWrapper';
import { hapticFeedbackImpactOccurred } from '@telegram-apps/sdk';

export default function ChatsPageClient() {
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const { showAlert } = useTelegramPopup();

  const handleAddClick = () => {
    // Haptic feedback при нажатии кнопки
    try {
      if (hapticFeedbackImpactOccurred.isAvailable()) {
        hapticFeedbackImpactOccurred('light');
      }
    } catch {}

    setShowSuggestModal(true);
  };

  const handleSuggestSuccess = () => {
    // Показываем нативное уведомление Telegram
    showAlert('Ваш чат отправлен на модерацию. Спасибо за участие! 🙏');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20" data-scrollable>
      {/* Header с кнопкой добавления */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">
            💬 Русские чаты в США
          </h1>
          <button
            onClick={handleAddClick}
            className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
          >
            ➕ Добавить
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Найдите свое сообщество среди русскоговорящих
        </p>
      </div>
      
      <div className="p-4">
        <ChatsList />
      </div>
      
      {/* Модальное окно для предложения чата */}
      <SuggestChatModal
        isOpen={showSuggestModal}
        onClose={() => setShowSuggestModal(false)}
        onSuccess={handleSuggestSuccess}
      />
      
      {/* ✅ Тестер бесконечного цикла (только в dev режиме) */}
      <InfiniteLoopTesterWrapper />
    </div>
  );
}
