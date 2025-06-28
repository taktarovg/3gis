'use client';

import { useEffect } from 'react';

export function usePreventCollapse() {
  useEffect(() => {
    // Проверяем доступность современного Telegram API
    const isTelegramWebApp = typeof window !== 'undefined' && window.Telegram?.WebApp;
    
    if (isTelegramWebApp) {
      console.log('🔍 Telegram WebApp detected, applying collapse prevention...');
      
      // Способ 1: Современный API (Bot API 7.7+)
      try {
        if (window.Telegram.WebApp.disableVerticalSwipes) {
          window.Telegram.WebApp.disableVerticalSwipes();
          console.log('✅ Modern solution: disableVerticalSwipes() applied');
          
          // Проверяем статус
          if (window.Telegram.WebApp.isVerticalSwipesEnabled === false) {
            console.log('✅ Vertical swipes successfully disabled');
            return; // Если современное решение работает, больше ничего не нужно
          }
        }
      } catch (error) {
        console.warn('⚠️ Modern disableVerticalSwipes() not available:', error);
      }
    }

    // Способ 2: Fallback решение для старых версий или если современное API не сработало
    console.log('🔧 Applying fallback solution for collapse prevention...');
    
    function ensureDocumentIsScrollable() {
      const isScrollable = document.documentElement.scrollHeight > window.innerHeight;
      
      if (!isScrollable) {
        console.log('📏 Document not scrollable, making it scrollable...');
        document.documentElement.style.setProperty(
          "height", 
          "calc(100vh + 1px)", 
          "important"
        );
      }
    }

    function preventCollapse(event: TouchEvent) {
      // Предотвращаем коллапс если мы в самом верху страницы
      if (window.scrollY === 0) {
        console.log('🛡️ Preventing collapse: scrolling to position 1');
        window.scrollTo(0, 1);
      }
    }

    function preventCollapseOnScrollableElements(event: TouchEvent) {
      const target = event.target as HTMLElement;
      
      // Проверяем, является ли элемент или его родитель скроллящимся
      const scrollableElement = target.closest('[data-scrollable], .overflow-y-auto, .overflow-auto, .overflow-scroll');
      
      if (scrollableElement) {
        const element = scrollableElement as HTMLElement;
        
        // Если скроллящийся элемент находится в самом верху
        if (element.scrollTop === 0) {
          // Проверяем направление свайпа
          const touches = event.touches;
          if (touches.length > 0) {
            // Сохраняем начальную позицию для последующей проверки в touchmove
            (element as any)._initialTouchY = touches[0].clientY;
          }
        }
      }
    }

    function handleTouchMove(event: TouchEvent) {
      const target = event.target as HTMLElement;
      const scrollableElement = target.closest('[data-scrollable], .overflow-y-auto, .overflow-auto, .overflow-scroll');
      
      if (scrollableElement) {
        const element = scrollableElement as HTMLElement;
        const initialY = (element as any)._initialTouchY;
        
        if (initialY && element.scrollTop === 0) {
          const currentY = event.touches[0]?.clientY || event.changedTouches[0]?.clientY;
          
          // Если пользователь свайпает вниз в самом верху скроллящегося элемента
          if (currentY > initialY) {
            console.log('🛡️ Preventing collapse on scrollable element');
            // Немного прокручиваем элемент, чтобы предотвратить коллапс
            element.scrollTop = 1;
          }
        }
      }
    }

    // Применяем базовое решение
    ensureDocumentIsScrollable();
    
    // Находим все потенциально скроллящиеся элементы
    const addEventListeners = () => {
      // Обработчики для предотвращения коллапса на уровне документа
      document.addEventListener('touchstart', preventCollapse, { passive: false });
      
      // Обработчики для скроллящихся элементов
      document.addEventListener('touchstart', preventCollapseOnScrollableElements, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
    };

    // Обработчики событий
    window.addEventListener('load', ensureDocumentIsScrollable);
    window.addEventListener('resize', ensureDocumentIsScrollable);
    
    // Добавляем обработчики сразу если DOM уже готов
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addEventListeners);
    } else {
      addEventListeners();
    }

    // Дополнительно: устанавливаем минимальную высоту для body
    document.body.style.minHeight = '100vh';
    
    console.log('✅ Collapse prevention setup complete');

    // Cleanup функция
    return () => {
      console.log('🧹 Cleaning up collapse prevention...');
      
      // Удаляем обработчики событий
      document.removeEventListener('touchstart', preventCollapse);
      document.removeEventListener('touchstart', preventCollapseOnScrollableElements);
      document.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('load', ensureDocumentIsScrollable);
      window.removeEventListener('resize', ensureDocumentIsScrollable);
      
      // Восстанавливаем стили
      document.documentElement.style.removeProperty('height');
      document.body.style.removeProperty('min-height');
    };
  }, []);
}
