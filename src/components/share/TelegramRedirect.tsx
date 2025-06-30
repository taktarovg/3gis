'use client';

import { ReactNode } from 'react';

interface TelegramRedirectProps {
  url: string;
  children: ReactNode;
  className?: string;
  target?: '_blank' | '_self';
}

/**
 * ✅ ИСПРАВЛЕННЫЙ компонент для редиректа в Telegram Mini App
 * Правильно определяет платформу и использует корректные TMA ссылки
 */
export function TelegramRedirect({ 
  url, 
  children, 
  className = '',
  target = '_blank'
}: TelegramRedirectProps) {
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // ✅ Правильные константы для 3GIS Bot
    const botUsername = 'ThreeGIS_bot';
    const appName = 'app';
    
    // ✅ Парсим URL чтобы извлечь startapp параметр
    const startParam = extractStartParam(url);
    
    // ✅ Формируем правильную TMA ссылку
    const telegramAppUrl = `https://t.me/${botUsername}/${appName}${startParam ? `?startapp=${startParam}` : ''}`;
    
    console.log('🔗 TelegramRedirect: Opening URL:', telegramAppUrl);
    console.log('🔗 Original URL:', url);
    console.log('🔗 Start param:', startParam);
    
    // Проверяем платформу и окружение
    const userAgent = navigator.userAgent || '';
    const isTelegram = userAgent.includes('Telegram') || window.location.hostname.includes('telegram');
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isDesktop = !isMobile;
    
    // ✅ Если уже в Telegram Web App, используем внутреннюю навигацию
    if (isTelegram && typeof window !== 'undefined' && window.Telegram?.WebApp) {
      console.log('🔗 Inside Telegram WebApp - using internal navigation');
      // Для внутренней навигации в TMA используем относительные пути
      const internalPath = url.startsWith('/') ? url : `/${url}`;
      window.location.href = internalPath;
      return;
    }
    
    // ✅ Для мобильных устройств - пытаемся открыть нативное приложение
    if (isMobile) {
      console.log('🔗 Mobile device - trying native app first');
      
      // Создаем deep link для нативного приложения
      const nativeUrl = `tg://resolve?domain=${botUsername}&appname=${appName}${startParam ? `&startapp=${startParam}` : ''}`;
      
      // Пытаемся открыть нативное приложение через скрытый iframe
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.style.top = '-1000px';
      iframe.src = nativeUrl;
      document.body.appendChild(iframe);
      
      // Если через 1 секунду приложение не открылось, используем веб-версию
      const timeoutId = setTimeout(() => {
        console.log('🔗 Native app timeout - opening web version');
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
        window.open(telegramAppUrl, target);
      }, 1000);
      
      // Проверяем изменение видимости страницы (пользователь переключился в Telegram)
      const handleVisibilityChange = () => {
        if (document.hidden) {
          console.log('🔗 Page hidden - native app likely opened');
          clearTimeout(timeoutId);
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return;
    }
    
    // ✅ Для десктопа - всегда используем веб-версию Telegram
    if (isDesktop) {
      console.log('🔗 Desktop device - opening web version');
      window.open(telegramAppUrl, target);
      return;
    }
    
    // ✅ Fallback - просто открываем TMA ссылку
    console.log('🔗 Fallback - opening TMA URL');
    window.open(telegramAppUrl, target);
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
 * ✅ УЛУЧШЕННАЯ функция для извлечения startapp параметра из URL
 */
function extractStartParam(url: string): string | null {
  // Удаляем начальные слеши и query параметры
  const cleanUrl = url.replace(/^\/+/, '').split('?')[0];
  
  console.log('🔗 Extracting start param from:', cleanUrl);
  
  // ✅ Конвертируем различные пути в startapp параметры
  
  // Отдельные заведения: /tg/business/123 или /tg/businesses/123
  if (cleanUrl.match(/^tg\/businesses?\/(\d+)$/)) {
    const businessId = cleanUrl.match(/^tg\/businesses?\/(\d+)$/)?.[1];
    return businessId ? `business_${businessId}` : null;
  }
  
  // Отдельные чаты: /tg/chat/123 или /tg/chats/123  
  if (cleanUrl.match(/^tg\/chats?\/(\d+)$/)) {
    const chatId = cleanUrl.match(/^tg\/chats?\/(\d+)$/)?.[1];
    return chatId ? `chat_${chatId}` : null;
  }
  
  // Список заведений с категорией: /tg/businesses?category=restaurants
  if (cleanUrl.startsWith('tg/businesses')) {
    const fullUrl = url.replace(/^\/+/, '');
    const urlObj = new URL(`https://example.com/${fullUrl}`);
    const category = urlObj.searchParams.get('category');
    return category ? `businesses_${category}` : 'businesses';
  }
  
  // Список чатов: /tg/chats
  if (cleanUrl === 'tg/chats' || cleanUrl === 'tg/chats/') {
    return 'chats';
  }
  
  // Избранное: /tg/favorites
  if (cleanUrl === 'tg/favorites' || cleanUrl === 'tg/favourites') {
    return 'favorites';
  }
  
  // Профиль: /tg/profile
  if (cleanUrl === 'tg/profile') {
    return 'profile';
  }
  
  // Добавление заведения: /tg/add-business
  if (cleanUrl === 'tg/add-business') {
    return 'add_business';
  }
  
  // Главная страница TMA: /tg или /tg/
  if (cleanUrl === 'tg' || cleanUrl === 'tg/' || cleanUrl === '') {
    return null; // Главная страница без параметров
  }
  
  // ✅ Для всех остальных URL используем безопасное кодирование
  if (cleanUrl.length > 0) {
    // Удаляем специальные символы и кодируем
    const safeParam = cleanUrl
      .replace(/[^a-zA-Z0-9_\-\/]/g, '_')
      .replace(/\/+/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 50); // Ограничиваем длину
    
    return safeParam || null;
  }
  
  return null;
}