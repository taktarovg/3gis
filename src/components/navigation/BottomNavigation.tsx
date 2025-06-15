// src/components/navigation/BottomNavigation.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Heart, Building2, User } from 'lucide-react';
import { useTelegramWebApp } from '@telegram-apps/sdk-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: number;
}

/**
 * Нижнее навигационное меню для 3GIS MVP
 * Простое и эффективное меню с 4 основными разделами
 */
export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const webApp = useTelegramWebApp();

  // Навигационные элементы MVP
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Главная',
      icon: Home,
      path: '/tg',
    },
    {
      id: 'favorites',
      label: 'Избранное',
      icon: Heart,
      path: '/tg/favorites',
      // badge: favoritesCount, // TODO: Добавить после интеграции с store
    },
    {
      id: 'business',
      label: 'Мой бизнес',
      icon: Building2,
      path: '/tg/business',
    },
    {
      id: 'profile',
      label: 'Профиль',
      icon: User,
      path: '/tg/profile',
    },
  ];

  // Telegram haptic feedback при нажатии
  const handleNavigation = (path: string) => {
    // Haptic feedback для лучшего UX в Telegram
    if (webApp && webApp.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred('light');
    }
    
    router.push(path);
  };

  // Определяем активный элемент
  const getActiveItem = () => {
    // Точное совпадение для главной
    if (pathname === '/tg') return 'home';
    
    // Проверяем вложенные пути
    if (pathname.startsWith('/tg/favorites')) return 'favorites';
    if (pathname.startsWith('/tg/business')) return 'business';
    if (pathname.startsWith('/tg/profile')) return 'profile';
    
    return 'home'; // По умолчанию
  };

  const activeItem = getActiveItem();

  // Настройка Telegram WebApp для навигации
  useEffect(() => {
    if (webApp) {
      // Показываем back button для всех страниц кроме главной
      if (pathname !== '/tg') {
        webApp.BackButton.show();
        webApp.BackButton.onClick(() => {
          if (pathname.split('/').length > 2) {
            router.back();
          } else {
            router.push('/tg');
          }
        });
      } else {
        webApp.BackButton.hide();
      }

      // Устанавливаем цвет header bar
      if (webApp.setHeaderColor) {
        webApp.setHeaderColor('#ffffff');
      }
    }

    return () => {
      if (webApp?.BackButton) {
        webApp.BackButton.hide();
      }
    };
  }, [pathname, router, webApp]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-padding-bottom z-50">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 transition-colors relative',
                'hover:bg-gray-50 active:bg-gray-100',
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {/* Иконка с badge */}
              <div className="relative">
                <Icon 
                  className={cn(
                    'h-5 w-5 transition-all',
                    isActive ? 'scale-110' : 'scale-100'
                  )} 
                />
                
                {/* Badge для уведомлений */}
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </div>
                )}
              </div>
              
              {/* Название */}
              <span className={cn(
                'text-xs font-medium transition-all',
                isActive ? 'scale-105' : 'scale-100'
              )}>
                {item.label}
              </span>
              
              {/* Активный индикатор */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Компонент-обертка для страниц с нижней навигацией
 */
export function NavigationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Основной контент с отступом снизу для навигации */}
      <main className="pb-16">
        {children}
      </main>
      
      {/* Навигационное меню */}
      <BottomNavigation />
    </div>
  );
}
