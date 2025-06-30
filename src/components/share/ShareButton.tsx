'use client';

import { useState, useEffect, useCallback } from 'react';
import { Share2, Send, MessageCircle, Twitter, Copy, QrCode, ExternalLink } from 'lucide-react';
import { shareURL, openTelegramLink } from '@telegram-apps/sdk';
import { useLaunchParams, useRawInitData } from '@telegram-apps/sdk-react';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  type: 'business' | 'chat';
  entity: {
    id: number;
    name?: string;
    title?: string;
    slug?: string;
    description?: string;
  };
  variant?: 'button' | 'icon' | 'text';
  className?: string;
}

export function ShareButton({ type, entity, variant = 'button', className }: ShareButtonProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [webShareUrl, setWebShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  // ✅ SDK v3.x: Правильное использование хуков согласно актуальной документации
  const launchParams = useLaunchParams(true); // SSR flag для Next.js
  const initDataRaw = useRawInitData(); // ✅ НЕ принимает параметров
  
  // ✅ SDK v3.x: В parsed формате поля в camelCase: authDate, queryId
  const user = launchParams?.tgWebAppData?.user;
  
  useEffect(() => {
    // ✅ ИСПРАВЛЕНО: Генерируем правильные TMA ссылки
    const botUsername = 'ThreeGIS_bot';
    const startParam = `${type}_${entity.id}`;
    
    // ✅ Основная ссылка для шеринга - ВСЕГДА ведет в TMA
    const tmaUrl = `https://t.me/${botUsername}/app?startapp=${startParam}`;
    setShareUrl(tmaUrl);
    
    // ✅ Веб-ссылка для fallback (статичная страница)
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000'
      : 'https://3gis.biz';
    const slug = entity.slug || entity.id;
    const fallbackUrl = `${baseUrl}/${type === 'business' ? 'b' : 'c'}/${slug}`;
    setWebShareUrl(fallbackUrl);
  }, [type, entity]);
  
  const trackShare = useCallback(async (action: string, platform?: string) => {
    try {
      await fetch('/api/analytics/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: type.toUpperCase(),
          entityId: entity.id,
          action,
          platform,
          telegramUserId: user?.id?.toString(),
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Share tracking error:', error);
    }
  }, [type, entity.id, user?.id]);
  
  const handleShare = async () => {
    await trackShare('LINK_CREATED');
    
    // ✅ SDK v3.x: Проверка доступности и вызов shareURL с TMA ссылкой
    if (shareURL.isAvailable()) {
      try {
        await shareURL(shareUrl, `${entity.name || entity.title} | 3GIS`);
        await trackShare('SOCIAL_SHARED', 'telegram');
        return;
      } catch (error) {
        console.error('Native Telegram share failed:', error);
        // Fallback к модалу
      }
    }
    
    // Fallback к Web Share API (используем TMA ссылку)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: entity.name || entity.title,
          text: entity.description || `Посмотрите ${entity.name || entity.title} в 3GIS`,
          url: shareUrl, // ✅ TMA ссылка
        });
        await trackShare('SOCIAL_SHARED', 'native');
        return;
      } catch (error) {
        // Пользователь отменил или ошибка
      }
    }
    
    // Открываем модал как последний fallback
    setIsShareModalOpen(true);
  };
  
  const copyToClipboard = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl); // ✅ TMA ссылка
        setCopied(true);
        await trackShare('LINK_COPIED');
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback для старых браузеров (только в браузере)
        if (typeof document !== 'undefined') {
          const textArea = document.createElement('textarea');
          textArea.value = shareUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };
  
  const shareToSocial = async (platform: string) => {
    // ✅ ИСПРАВЛЕНО: Используем правильные ссылки для каждой платформы
    let urlToShare = shareUrl; // По умолчанию TMA ссылка
    let encodedUrl = encodeURIComponent(urlToShare);
    const encodedTitle = encodeURIComponent(entity.name || entity.title || '');
    
    // ✅ Для внешних платформ используем веб-ссылку для лучшей совместимости
    if (['whatsapp', 'twitter'].includes(platform)) {
      urlToShare = webShareUrl;
      encodedUrl = encodeURIComponent(urlToShare);
    }
    
    const urls = {
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      web: webShareUrl // Веб-версия для браузера
    };
    
    await trackShare('SOCIAL_SHARED', platform);
    
    if (typeof window !== 'undefined') {
      if (platform === 'web') {
        window.open(urls.web, '_blank');
      } else {
        window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
      }
    }
  };
  
  const openInTelegramApp = async () => {
    // ✅ SDK v3.x: Использование openTelegramLink с TMA ссылкой
    if (openTelegramLink.isAvailable()) {
      openTelegramLink(shareUrl); // ✅ Уже правильная TMA ссылка
      await trackShare('APP_OPENED', 'telegram');
    } else {
      // Fallback для браузеров без Telegram SDK
      window.open(shareUrl, '_blank');
      await trackShare('APP_OPENED', 'telegram');
    }
  };
  
  return (
    <>
      <button
        onClick={handleShare}
        className={cn(
          "inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          variant === 'button' && "px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium",
          variant === 'icon' && "w-8 h-8 text-current flex items-center justify-center hover:bg-gray-100 rounded-lg",
          variant === 'text' && "text-blue-600 hover:text-blue-700 underline text-sm",
          className
        )}
        aria-label={variant === 'icon' ? 'Поделиться' : undefined}
      >
        <Share2 className="w-4 h-4" />
        {variant === 'button' && <span className="ml-2">Поделиться</span>}
        {variant === 'text' && <span className="ml-1">Поделиться</span>}
      </button>
      
      {/* ✅ Модал шеринга */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Поделиться</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>
            
            {/* Информация о заведении */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{entity.name || entity.title}</h4>
              {entity.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{entity.description}</p>
              )}
            </div>
            
            {/* ✅ Кнопка открытия в TMA - теперь работает правильно */}
            <div className="mb-4">
              <button
                onClick={openInTelegramApp}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Send className="w-5 h-5 mr-2" />
                Открыть в Telegram App
              </button>
            </div>
            
            {/* Социальные сети */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <ShareSocialButton
                icon={<Send className="w-5 h-5 text-white" />}
                bgColor="bg-blue-500"
                label="Telegram"
                onClick={() => shareToSocial('telegram')}
              />
              
              <ShareSocialButton
                icon={<MessageCircle className="w-5 h-5 text-white" />}
                bgColor="bg-green-500"
                label="WhatsApp"
                onClick={() => shareToSocial('whatsapp')}
              />
              
              <ShareSocialButton
                icon={<Twitter className="w-5 h-5 text-white" />}
                bgColor="bg-black"
                label="Twitter"
                onClick={() => shareToSocial('twitter')}
              />
              
              <ShareSocialButton
                icon={<ExternalLink className="w-5 h-5 text-white" />}
                bgColor="bg-gray-600"
                label="Веб"
                onClick={() => shareToSocial('web')}
              />
            </div>
            
            {/* ✅ Копирование ссылки - показываем TMA ссылку */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  title="Ссылка для открытия в Telegram"
                />
                <button
                  onClick={copyToClipboard}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-colors text-sm",
                    copied 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                  aria-label="Копировать ссылку"
                >
                  {copied ? (
                    <>✓ Скопировано</>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1 inline" />
                      Копировать
                    </>
                  )}
                </button>
              </div>
              
              {/* ✅ Дополнительная информация о типе ссылки */}
              <div className="text-xs text-gray-500 text-center">
                📱 Ссылка откроет 3GIS в Telegram приложении
              </div>
              
              {/* QR код */}
              <div className="text-center pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    // Открыть QR код в отдельном модале или показать встроенный
                    setIsShareModalOpen(false);
                    // showQRModal(shareUrl);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center"
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  Показать QR-код
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ✅ Вспомогательный компонент для кнопок соц. сетей (Client Component)
function ShareSocialButton({ 
  icon, 
  bgColor, 
  label, 
  onClick 
}: {
  icon: React.ReactNode;
  bgColor: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
      aria-label={`Поделиться в ${label}`}
    >
      <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <span className="text-xs text-gray-700">{label}</span>
    </button>
  );
}
