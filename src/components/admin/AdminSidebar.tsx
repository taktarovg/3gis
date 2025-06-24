'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Building2, 
  Users, 
  BarChart3,
  Settings,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Обзор',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Заведения',
    href: '/admin/businesses',
    icon: Building2,
  },
  {
    name: 'Чаты',
    href: '/admin/chats',
    icon: MessageSquare,
    children: [
      { name: 'Все чаты', href: '/admin/chats' },
      { name: 'Аналитика', href: '/admin/chats/analytics' },
      { name: 'Добавить чат', href: '/admin/chats/add' },
    ],
  },
  {
    name: 'Пользователи',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Платежи',
    href: '/admin/payments',
    icon: BarChart3,
  },
  {
    name: 'Настройки',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/admin" className="flex items-center">
          <span className="text-xl font-bold">3GIS</span>
          <span className="ml-2 text-sm text-gray-500">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
                          (item.children && item.children.some(child => pathname === child.href));
          
          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
              
              {/* Submenu */}
              {item.children && isActive && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        'block px-3 py-1 text-xs font-medium rounded transition-colors',
                        pathname === child.href
                          ? 'text-blue-700 bg-blue-50'
                          : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Quick links */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Быстрые ссылки
        </div>
        <div className="space-y-2">
          <Link 
            href="/tg" 
            target="_blank"
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Telegram App
          </Link>
        </div>
      </div>
    </div>
  );
}