'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Google Analytics tracking functions
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

export const trackEvent = (
  action: string,
  category: string = 'general',
  label?: string,
  value?: number,
  customParameters?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...customParameters,
    });
  }
};

// Специфические события для блога
export const trackBlogEvent = {
  viewPost: (postId: number, title: string, category: string) => {
    trackEvent('blog_post_view', 'blog', title, undefined, {
      post_id: postId,
      post_category: category,
    });
  },

  sharePost: (postId: number, title: string, method: string) => {
    trackEvent('blog_post_share', 'blog', title, undefined, {
      post_id: postId,
      share_method: method,
    });
  },

  clickBusinessLink: (postId: number, businessId: number, businessName: string) => {
    trackEvent('blog_business_click', 'blog', businessName, undefined, {
      post_id: postId,
      business_id: businessId,
    });
  },

  clickChatLink: (postId: number, chatId: number, chatTitle: string) => {
    trackEvent('blog_chat_click', 'blog', chatTitle, undefined, {
      post_id: postId,
      chat_id: chatId,
    });
  },

  searchBlog: (query: string, category?: string) => {
    trackEvent('blog_search', 'blog', query, undefined, {
      search_category: category,
    });
  },

  viewCategory: (categorySlug: string, categoryName: string) => {
    trackEvent('blog_category_view', 'blog', categoryName, undefined, {
      category_slug: categorySlug,
    });
  }
};

// Специфические события для основного приложения
export const track3GISEvent = {
  searchBusiness: (query: string, category?: string, city?: string) => {
    trackEvent('business_search', '3gis', query, undefined, {
      search_category: category,
      search_city: city,
    });
  },

  viewBusiness: (businessId: number, businessName: string, category: string) => {
    trackEvent('business_view', '3gis', businessName, undefined, {
      business_id: businessId,
      business_category: category,
    });
  },

  callBusiness: (businessId: number, businessName: string) => {
    trackEvent('business_call', '3gis', businessName, undefined, {
      business_id: businessId,
    });
  },

  routeToBusiness: (businessId: number, businessName: string) => {
    trackEvent('business_route', '3gis', businessName, undefined, {
      business_id: businessId,
    });
  },

  addToFavorites: (businessId: number, businessName: string) => {
    trackEvent('business_favorite_add', '3gis', businessName, undefined, {
      business_id: businessId,
    });
  },

  removeFromFavorites: (businessId: number, businessName: string) => {
    trackEvent('business_favorite_remove', '3gis', businessName, undefined, {
      business_id: businessId,
    });
  },

  categorySelect: (categorySlug: string, categoryName: string) => {
    trackEvent('category_select', '3gis', categoryName, undefined, {
      category_slug: categorySlug,
    });
  },

  telegramAppOpen: (source: string) => {
    trackEvent('telegram_app_open', '3gis', source, undefined, {
      open_source: source,
    });
  }
};

// Google Analytics Script Component
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              custom_map: {
                'custom_parameter_1': 'user_type',
                'custom_parameter_2': 'content_category'
              }
            });
            
            // Enhanced ecommerce tracking готовность (для будущих премиум функций)
            gtag('config', '${GA_MEASUREMENT_ID}', {
              custom_map: {
                'dimension1': 'user_segment',
                'dimension2': 'content_type',
                'dimension3': 'business_category'
              }
            });
          `,
        }}
      />
    </>
  );
}

// Page View Tracker Component
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return null;
}

// Blog specific page view tracker
export function BlogPageViewTracker({ 
  postId, 
  postTitle, 
  category 
}: { 
  postId?: number; 
  postTitle?: string; 
  category?: string; 
}) {
  const pathname = usePathname();

  useEffect(() => {
    // Track regular page view
    trackPageView(pathname);

    // Track specific blog post view if it's a blog post
    if (postId && postTitle && category) {
      trackBlogEvent.viewPost(postId, postTitle, category);
    }
  }, [pathname, postId, postTitle, category]);

  return null;
}

// Business page view tracker
export function BusinessPageViewTracker({ 
  businessId, 
  businessName, 
  category 
}: { 
  businessId?: number; 
  businessName?: string; 
  category?: string; 
}) {
  const pathname = usePathname();

  useEffect(() => {
    // Track regular page view
    trackPageView(pathname);

    // Track specific business view if it's a business page
    if (businessId && businessName && category) {
      track3GISEvent.viewBusiness(businessId, businessName, category);
    }
  }, [pathname, businessId, businessName, category]);

  return null;
}

// Consent Management (для GDPR compliance)
export function useAnalyticsConsent() {
  useEffect(() => {
    // Проверяем согласие пользователя на аналитику
    const consent = localStorage.getItem('analytics_consent');
    
    if (consent === 'granted' && GA_MEASUREMENT_ID) {
      // Включаем аналитику
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied', // Пока не используем рекламную аналитику
      });
    } else if (consent === 'denied') {
      // Отключаем аналитику
      window.gtag?.('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
      });
    } else {
      // По умолчанию - базовое согласие для функциональности
      window.gtag?.('consent', 'default', {
        analytics_storage: 'granted', // Для 3GIS считаем аналитику необходимой
        ad_storage: 'denied',
        wait_for_update: 500,
      });
    }
  }, []);

  const grantConsent = () => {
    localStorage.setItem('analytics_consent', 'granted');
    window.gtag?.('consent', 'update', {
      analytics_storage: 'granted',
    });
  };

  const denyConsent = () => {
    localStorage.setItem('analytics_consent', 'denied');
    window.gtag?.('consent', 'update', {
      analytics_storage: 'denied',
    });
  };

  return { grantConsent, denyConsent };
}