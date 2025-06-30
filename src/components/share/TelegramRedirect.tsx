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
    
    // ✅ Правильная ссылка для 3GIS Bot
    const botUsername = 'ThreeGIS_bot';
    
    // Парсим URL чтобы извлечь startapp параметр
    const startParam = extractStartParam(url);
    
    // ✅ Формируем правильную ссылку для Telegram
    const telegramUrl = `https://t.me/${botUsername}/app${startParam ? `?startapp=${startParam}` : ''}`;
    
    console.log('🔗 Opening Telegram URL:', telegramUrl);
    
    // Проверяем платформу
    const userAgent = navigator.userAgent || '';
    const isTelegram = userAgent.includes('Telegram');
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Если уже в Telegram, используем внутреннюю навигацию
    if (isTelegram) {
      // Для TMA используем window.location для внутренней навигации
      window.location.href = url.startsWith('/') ? url : `/${url}`;
      return;
    }
    
    // ✅ Для внешних браузеров - открываем TMA через deep link
    if (isMobile) {
      // Пытаемся открыть нативное приложение Telegram
      const nativeUrl = `tg://resolve?domain=${botUsername}&appname=app${startParam ? `&startapp=${startParam}` : ''}`;
      
      // Создаем невидимый iframe для попытки открыть нативное приложение
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = nativeUrl;
      document.body.appendChild(iframe);
      
      // Если через 500ms приложение не открылось, используем веб-версию
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.open(telegramUrl, target);
      }, 500);
      
      return;
    }
    
    // ✅ Для десктопа - всегда веб-версия Telegram
    window.open(telegramUrl, target);
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

/**
 * ✅ Функция для извлечения startapp параметра из URL
 */
function extractStartParam(url: string): string | null {
  // Удаляем начальный слеш и извлекаем путь
  const cleanUrl = url.replace(/^\/+/, '');
  
  // Конвертируем путь в startapp параметр
  if (cleanUrl.startsWith('tg/business/')) {
    const businessId = cleanUrl.replace('tg/business/', '');
    return `business_${businessId}`;
  }
  
  if (cleanUrl.startsWith('tg/chat/')) {
    const chatId = cleanUrl.replace('tg/chat/', '');
    return `chat_${chatId}`;
  }
  
  if (cleanUrl.startsWith('tg/businesses')) {
    const params = new URLSearchParams(cleanUrl.split('?')[1] || '');
    const category = params.get('category');
    return category ? `businesses_${category}` : 'businesses';
  }
  
  if (cleanUrl === 'tg' || cleanUrl === 'tg/') {
    return null; // Главная страница без параметров
  }
  
  // Для других URL используем base64 encoding
  return btoa(cleanUrl).replace(/[+/=]/g, '');
}