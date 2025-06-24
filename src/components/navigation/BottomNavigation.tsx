// src/components/navigation/BottomNavigation.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, MessageSquare, Heart, Building2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: number;
}

/**
 * Нижнее навигационное меню для 3GIS с каталогом чатов
 * Обновлено до 5 иконок: Главная, Чаты, Избранное, Бизнес, Профиль
 * Использует актуальные хуки @telegram-apps/sdk-react v3.3.1
 */
export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isBackButtonVisible, setIsBackButtonVisible] = useState(false);

  // Навигационные элементы с добавленным каталогом чатов
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Главная',
      icon: Home,
      path: '/tg',
    },
    {
      id: 'chats',
      label: 'Чаты',
      icon: MessageSquare,
      path: '/tg/chats',
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
      label: 'Бизнес',
      icon: Building2,
      path: '/tg/my-business',
    },
    {
      id: 'profile',
      label: 'Профиль',
      icon: User,
      path: '/tg/profile',
    },
  ];

  // Haptic feedback с fallback на нативный API
  const triggerHaptic = () => {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
    } catch (error) {
      // Fallback - ничего не делаем
    }
  };

  // Telegram navigation с SDK v3.x
  const handleNavigation = (path: string) => {
    triggerHaptic();
    router.push(path);
  };

  // Определяем активный элемент
  const getActiveItem = () => {
    // Точное совпадение для главной
    if (pathname === '/tg') return 'home';
    
    // Проверяем вложенные пути
    if (pathname.startsWith('/tg/chats')) return 'chats';
    if (pathname.startsWith('/tg/favorites')) return 'favorites';
    if (pathname.startsWith('/tg/my-business')) return 'business';
    if (pathname.startsWith('/tg/profile')) return 'profile';
    
    return 'home'; // По умолчанию
  };

  const activeItem = getActiveItem();

  // Настройка Telegram Back Button через нативный API
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.BackButton) {
      const backBtn = window.Telegram.WebApp.BackButton;
      
      // Показываем back button для всех страниц кроме главной
      if (pathname !== '/tg') {
        backBtn.show();
        setIsBackButtonVisible(true);
        
        const handleBackClick = () => {
          if (pathname.split('/').length > 2) {
            router.back();
          } else {
            router.push('/tg');
          }
        };
        
        backBtn.onClick(handleBackClick);
        
        return () => {
          backBtn.offClick(handleBackClick);
        };
      } else {
        backBtn.hide();
        setIsBackButtonVisible(false);
      }
    }
  }, [pathname, router]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-padding-bottom z-50">
      <div className="grid grid-cols-5 h-16">
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
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full" />
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
