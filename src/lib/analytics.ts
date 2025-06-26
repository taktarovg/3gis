// Google Analytics и событийная аналитика для 3GIS
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

// Интерфейс для событий 3GIS
interface Track3GISEvents {
  // Основные события пользователей
  landingView: (source: string, campaign: string, keyword: string) => void;
  businessView: (businessId: string, businessName: string, category: string) => void;
  businessCall: (businessId: string, businessName: string) => void;
  businessRoute: (businessId: string, businessName: string) => void;
  businessFavorite: (businessId: string, businessName: string, action: 'add' | 'remove') => void;
  
  // Поиск и навигация
  search: (query: string, category?: string, resultsCount?: number) => void;
  categoryView: (categoryName: string, categorySlug: string) => void;
  
  // Телеграм активность
  telegramOpen: (source: string) => void;
  
  // Время на странице
  pageTimeSpent: (page: string, timeSeconds: number) => void;
}

/**
 * Основная функция для отправки событий в Google Analytics
 */
export function sendGAEvent(
  action: string,
  category: string,
  label?: string,
  value?: number,
  customParameters?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    const eventParams: Record<string, any> = {
      event_category: category,
      event_label: label,
      value: value,
      ...customParameters
    };

    // Убираем undefined значения
    Object.keys(eventParams).forEach(key => {
      if (eventParams[key] === undefined) {
        delete eventParams[key];
      }
    });

    window.gtag('event', action, eventParams);
    
    // Дебаг в development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔔 GA Event:', { action, category, label, value, customParameters });
    }
  }
}

/**
 * Специализированные функции для событий 3GIS
 */
export const track3GISEvents: Track3GISEvents = {
  // Просмотр лендинга с анализом источника трафика
  landingView: (source: string, campaign: string, keyword: string) => {
    sendGAEvent('page_view_landing', 'navigation', 'landing', 1, {
      traffic_source: source,
      campaign: campaign,
      search_keyword: keyword
    });
  },

  // Просмотр детальной страницы заведения
  businessView: (businessId: string, businessName: string, category: string) => {
    sendGAEvent('business_view', 'business_interaction', businessName, 1, {
      business_id: businessId,
      business_category: category
    });
  },

  // Клик по телефону заведения
  businessCall: (businessId: string, businessName: string) => {
    sendGAEvent('business_call', 'business_interaction', businessName, 1, {
      business_id: businessId,
      interaction_type: 'phone_call'
    });
  },

  // Клик по маршруту к заведению
  businessRoute: (businessId: string, businessName: string) => {
    sendGAEvent('business_route', 'business_interaction', businessName, 1, {
      business_id: businessId,
      interaction_type: 'get_directions'
    });
  },

  // Добавление/удаление из избранного
  businessFavorite: (businessId: string, businessName: string, action: 'add' | 'remove') => {
    sendGAEvent('business_favorite', 'business_interaction', businessName, 1, {
      business_id: businessId,
      favorite_action: action
    });
  },

  // Поиск заведений
  search: (query: string, category?: string, resultsCount?: number) => {
    sendGAEvent('search', 'user_interaction', query, resultsCount, {
      search_query: query,
      search_category: category || 'all',
      results_count: resultsCount || 0
    });
  },

  // Просмотр категории
  categoryView: (categoryName: string, categorySlug: string) => {
    sendGAEvent('category_view', 'navigation', categoryName, 1, {
      category_slug: categorySlug
    });
  },

  // Переход в Telegram
  telegramOpen: (source: string) => {
    sendGAEvent('telegram_open', 'external_link', source, 1, {
      link_source: source
    });
  },

  // Время проведенное на странице
  pageTimeSpent: (page: string, timeSeconds: number) => {
    // Отправляем только если время больше 10 секунд
    if (timeSeconds > 10) {
      sendGAEvent('page_time_spent', 'engagement', page, timeSeconds, {
        time_category: timeSeconds > 60 ? 'long_session' : 'normal_session'
      });
    }
  }
};

/**
 * Хук для отслеживания времени на странице
 */
export function usePageTimeTracking(pageName: string) {
  if (typeof window === 'undefined') return;

  const startTime = Date.now();

  const trackTimeOnUnload = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    track3GISEvents.pageTimeSpent(pageName, timeSpent);
  };

  // Отслеживаем при закрытии страницы
  window.addEventListener('beforeunload', trackTimeOnUnload);
  window.addEventListener('pagehide', trackTimeOnUnload);

  // Cleanup функция
  return () => {
    window.removeEventListener('beforeunload', trackTimeOnUnload);
    window.removeEventListener('pagehide', trackTimeOnUnload);
  };
}
