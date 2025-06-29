'use client';

import { useEffect } from 'react';
import { disableVerticalSwipes, enableVerticalSwipes, isVerticalSwipesEnabled } from '@telegram-apps/sdk';

export function usePreventCollapse() {
  useEffect(() => {
    console.log('🔍 Initializing collapse prevention for Telegram Mini App...');
    
    // Способ 1: Современный API через @telegram-apps/sdk v3.x
    try {
      // Проверяем доступность современного API для вертикальных свайпов
      if (disableVerticalSwipes.isAvailable()) {
        disableVerticalSwipes();
        console.log('✅ Modern solution: disableVerticalSwipes() from @telegram-apps/sdk applied');
        
        // Проверяем статус
        if (!isVerticalSwipesEnabled()) {
          console.log('✅ Vertical swipes successfully disabled via SDK');
          return; // Если современное решение работает, больше ничего не нужно
        }
      } else {
        console.log('⚠️ disableVerticalSwipes() not available in current environment');
      }
    } catch (error) {
      console.warn('⚠️ Error with @telegram-apps/sdk disableVerticalSwipes():', error);
    }

    // Способ 2: Fallback через window.Telegram (если SDK не сработал)
    try {
      if (typeof window !== 'undefined' && 
          window.Telegram && 
          window.Telegram.WebApp) {
        
        // Используем безопасное обращение к свойству через индексацию
        const webApp = window.Telegram.WebApp as any;
        
        if (typeof webApp['disableVerticalSwipes'] === 'function') {
          webApp['disableVerticalSwipes']();
          console.log('✅ Fallback: window.Telegram.WebApp.disableVerticalSwipes() applied');
          
          // Проверяем статус если свойство доступно
          if (typeof webApp['isVerticalSwipesEnabled'] === 'boolean' && 
              webApp['isVerticalSwipesEnabled'] === false) {
            console.log('✅ Vertical swipes successfully disabled via window.Telegram');
            return;
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ window.Telegram fallback not available:', error);
    }

    // Способ 3: CSS/JS хаки для старых версий или если API не сработали
    console.log('🔧 Applying CSS/JS fallback solution for collapse prevention...');
    
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
      
      // Восстанавливаем вертикальные свайпы при размонтировании (опционально)
      try {
        if (enableVerticalSwipes.isAvailable()) {
          enableVerticalSwipes();
          console.log('🔄 Vertical swipes re-enabled on cleanup');
        }
      } catch (error) {
        // Игнорируем ошибки при cleanup
      }
    };
  }, []);
}
