'use client';

import { useState } from 'react';
import { Share2, Copy, MessageCircle, Send, Check } from 'lucide-react';
import { trackBlogEvent } from '@/components/analytics/GoogleAnalytics';

interface ShareButtonsProps {
  postId: number;
  title: string;
  url: string;
  description?: string;
}

export function ShareButtons({ postId, title, url, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async (method: string) => {
    trackBlogEvent.sharePost(postId, title, method);

    switch (method) {
      case 'telegram':
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        window.open(telegramUrl, '_blank');
        break;

      case 'whatsapp':
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
        window.open(whatsappUrl, '_blank');
        break;

      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          // Fallback для старых браузеров
          const textArea = document.createElement('textarea');
          textArea.value = url;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
        break;

      case 'native':
        if ('share' in navigator) {
          try {
            await navigator.share({
              title,
              text: description,
              url
            });
          } catch (err) {
            console.log('Share cancelled');
          }
        }
        break;
    }
  };

  return (
    <div className="relative">
      {/* Основная кнопка */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        aria-label="Поделиться статьей"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Поделиться
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Меню */}
          <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-48">
            <div className="py-2">
              {/* Telegram */}
              <button
                onClick={() => {
                  handleShare('telegram');
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Send className="w-4 h-4 mr-3 text-blue-500" />
                Telegram
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => {
                  handleShare('whatsapp');
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-3 text-green-500" />
                WhatsApp
              </button>

              {/* Копировать ссылку */}
              <button
                onClick={() => {
                  handleShare('copy');
                  setIsOpen(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-3 text-green-500" />
                    Скопировано!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-3 text-gray-500" />
                    Копировать ссылку
                  </>
                )}
              </button>

              {/* Native Share API (если поддерживается) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <>
                  <div className="border-t border-gray-100 my-2" />
                  <button
                    onClick={() => {
                      handleShare('native');
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4 mr-3 text-gray-500" />
                    Поделиться через...
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Компактная версия для мобильных устройств
export function ShareButtonsMobile({ postId, title, url, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (method: string) => {
    trackBlogEvent.sharePost(postId, title, method);

    switch (method) {
      case 'telegram':
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        window.open(telegramUrl, '_blank');
        break;

      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          // Fallback
          const textArea = document.createElement('textarea');
          textArea.value = url;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
        break;

      case 'native':
        if (typeof navigator !== 'undefined' && 'share' in navigator) {
          try {
            await navigator.share({
              title,
              text: description,
              url
            });
          } catch (err) {
            console.log('Share cancelled');
          }
        }
        break;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Telegram */}
      <button
        onClick={() => handleShare('telegram')}
        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
        aria-label="Поделиться в Telegram"
      >
        <Send className="w-4 h-4" />
      </button>

      {/* Копировать */}
      <button
        onClick={() => handleShare('copy')}
        className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
        aria-label="Копировать ссылку"
      >
        {copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>

      {/* Native Share (если поддерживается) */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={() => handleShare('native')}
          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
          aria-label="Поделиться"
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Простые кнопки для быстрого доступа
export function QuickShareButtons({ postId, title, url }: ShareButtonsProps) {
  const handleQuickShare = (method: string) => {
    trackBlogEvent.sharePost(postId, title, method);

    switch (method) {
      case 'telegram':
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        window.open(telegramUrl, '_blank');
        break;

      case 'copy':
        navigator.clipboard.writeText(url).catch(() => {
          // Fallback
          const textArea = document.createElement('textarea');
          textArea.value = url;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        });
        break;
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Telegram быстрая кнопка */}
      <button
        onClick={() => handleQuickShare('telegram')}
        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
        aria-label="Поделиться в Telegram"
      >
        <Send className="w-4 h-4" />
      </button>

      {/* Копировать быстрая кнопка */}
      <button
        onClick={() => handleQuickShare('copy')}
        className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
        aria-label="Копировать ссылку"
      >
        <Copy className="w-4 h-4" />
      </button>
    </div>
  );
}