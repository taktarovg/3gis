'use client';

import { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { hapticFeedbackNotificationOccurred, hapticFeedbackImpactOccurred } from '@telegram-apps/sdk';
import { useLaunchParams } from '@telegram-apps/sdk-react';

interface SuggestChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SuggestChatModal({ isOpen, onClose, onSuccess }: SuggestChatModalProps) {
  const [chatLink, setChatLink] = useState('');
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const launchParams = useLaunchParams();
  const user = launchParams.tgWebAppData?.user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('Ошибка: пользователь не определен');
      return;
    }

    setIsLoading(true);
    setError('');

    // Haptic feedback при отправке
    try {
      if (hapticFeedbackImpactOccurred.isAvailable()) {
        hapticFeedbackImpactOccurred('light');
      }
    } catch {}

    try {
      const response = await fetch('/api/chats/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteLink: chatLink.trim(),
          comment: comment.trim(),
          telegramUserId: user.id.toString()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при отправке предложения');
      }

      // Haptic feedback успеха
      try {
        if (hapticFeedbackNotificationOccurred.isAvailable()) {
          hapticFeedbackNotificationOccurred('success');
        }
      } catch {}

      // Очищаем форму
      setChatLink('');
      setComment('');
      
      // Закрываем модал и вызываем callback успеха
      onClose();
      onSuccess();

    } catch (error) {
      console.error('Error suggesting chat:', error);
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
      
      // Haptic feedback ошибки
      try {
        if (hapticFeedbackNotificationOccurred.isAvailable()) {
          hapticFeedbackNotificationOccurred('error');
        }
      } catch {}
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Haptic feedback при закрытии
    try {
      if (hapticFeedbackImpactOccurred.isAvailable()) {
        hapticFeedbackImpactOccurred('light');
      }
    } catch {}
    
    // Очищаем форму при закрытии
    setChatLink('');
    setComment('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            💬 Предложить чат
          </h2>
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Ссылка на чат */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📎 Ссылка на чат *
            </label>
            <input
              type="url"
              value={chatLink}
              onChange={(e) => setChatLink(e.target.value)}
              placeholder="https://t.me/chat_name или https://t.me/+xxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ссылка должна начинаться с https://t.me/
            </p>
          </div>

          {/* Комментарий */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💬 Комментарий *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Опишите чат: тематика, количество участников, активность..."
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 символов
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              ℹ️ Ваше предложение будет отправлено на модерацию. После проверки чат появится в каталоге.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading || !chatLink.trim() || !comment.trim()}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Отправить
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
