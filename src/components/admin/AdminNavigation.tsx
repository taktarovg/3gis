'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Building2, 
  Users, 
  Star, 
  BarChart3,
  Settings,
  Clock,
  CheckCircle
} from 'lucide-react';

/**
 * Навигационное меню для админки
 */
export function AdminNavigation() {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Home,
      description: 'Общая статистика'
    },
    {
      name: 'Бизнесы',
      href: '/admin/businesses',
      icon: Building2,
      description: 'Управление и модерация'
    },
    {
      name: 'Пользователи',
      href: '/admin/users',
      icon: Users,
      description: 'Управление пользователями'
    },
    // Для будущих версий:
    // {
    //   name: 'Отзывы',
    //   href: '/admin/reviews',
    //   icon: Star,
    //   description: 'Модерация отзывов'
    // },
    // {
    //   name: 'Аналитика',
    //   href: '/admin/analytics',
    //   icon: BarChart3,
    //   description: 'Детальная статистика'
    // },
    // {
    //   name: 'Настройки',
    //   href: '/admin/settings',
    //   icon: Settings,
    //   description: 'Конфигурация системы'
    // }
  ];

  return (
    <nav className="bg-white shadow-sm border-b mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-1 pt-1 pb-4 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

/**
 * Быстрые статистические карточки для навигации
 */
export function QuickStats({ stats }: { stats?: any }) {
  if (!stats) return null;

  const quickStats = [
    {
      name: 'На модерации',
      value: stats.overview?.pendingBusinesses || 0,
      icon: Clock,
      color: 'text-orange-600',
      href: '/admin/businesses?status=pending'
    },
    {
      name: 'Активные заведения',
      value: stats.overview?.activeBusinesses || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      href: '/admin/businesses?status=active'
    },
    {
      name: 'Всего пользователей',
      value: stats.overview?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      href: '/admin/users'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {quickStats.map((stat) => (
        <Link
          key={stat.name}
          href={stat.href}
          className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <stat.icon className={`w-5 h-5 mr-3 ${stat.color}`} />
            <div>
              <p className="text-sm text-gray-600">{stat.name}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.value.toLocaleString()}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
