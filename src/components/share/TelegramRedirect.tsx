'use client';

import { ReactNode } from 'react';

interface TelegramRedirectProps {
  url: string;
  children: ReactNode;
  className?: string;
  target?: '_blank' | '_self';
}

/**
 * Компонент для редиректа в Telegram Mini App
 * Определяет платформу и выбирает правильный способ открытия
 */
export function TelegramRedirect({ 
  url, 
  children, 
  className = '',
  target = '_blank'
}: TelegramRedirectProps) {
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Проверяем, запущено ли в Telegram
    const userAgent = navigator.userAgent || '';
    const isTelegram = userAgent.includes('Telegram');
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Если уже в Telegram, используем обычную навигацию
    if (isTelegram) {
      window.location.href = url;
      return;
    }
    
    // Для мобильных устройств пытаемся открыть через deep link
    if (isMobile) {
      const telegramUrl = `https://t.me/ThreeGIS_bot/app?startapp=${encodeURIComponent(url)}`;
      
      // Пытаемся открыть через Telegram app
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `tg://resolve?domain=ThreeGIS_bot&appname=app&startapp=${encodeURIComponent(url)}`;
      document.body.appendChild(iframe);
      
      // Fallback через веб-версию через 500ms
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.open(telegramUrl, '_blank');
      }, 500);
      
      return;
    }
    
    // Для десктопа открываем веб-версию Telegram
    const webTelegramUrl = `https://web.telegram.org/k/#@ThreeGIS_bot?startapp=${encodeURIComponent(url)}`;
    window.open(webTelegramUrl, target);
  };
  
  return (
    <button 
      onClick={handleClick}
      className={className}
      type="button"
    >
      {children}
    </button>
  );
}