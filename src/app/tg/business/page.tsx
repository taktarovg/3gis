// src/app/tg/business/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Eye, 
  MapPin
} from 'lucide-react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface UserBusiness {
  id: number;
  name: string;
  category: {
    name: string;
    icon: string;
  };
  address: string;
  city: {
    name: string;
    state: string;
  };
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  createdAt: string;
}

/**
 * Страница "Мой бизнес" для 3GIS MVP
 * Упрощенная версия с основным функционалом
 */
export default function MyBusinessPage() {
  const { user } = useTelegramAuth();
  const token = useAuthStore((state) => state.token);
  const [businesses, setBusinesses] = useState<UserBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем заведения пользователя
  useEffect(() => {
    const loadUserBusinesses = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/businesses', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBusinesses(data.businesses || []);
        }
      } catch (err) {
        console.error('Error loading user businesses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserBusinesses();
  }, [token]);

  // Статус заведения
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">На модерации</Badge>;
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-500">Активно</Badge>;
      case 'SUSPENDED':
        return <Badge variant="destructive">Приостановлено</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Отклонено</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Мой бизнес
        </h1>
        <p className="text-gray-600">
          {businesses.length === 0 
            ? 'Добавьте свое заведение в каталог 3GIS'
            : `${businesses.length} заведений в каталоге`
          }
        </p>
      </div>

      {/* Главная кнопка добавления */}
      <Link href="/tg/add-business">
        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 text-lg">
          <Plus className="h-5 w-5 mr-2" />
          Добавить в каталог
        </Button>
      </Link>

      {/* Информационный блок */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          Почему стоит добавить свое заведение?
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Найдут русскоязычные клиенты</li>
          <li>• Бесплатное размещение в каталоге</li>
          <li>• Возможность отвечать на отзывы</li>
          <li>• Статистика просмотров и звонков</li>
        </ul>
      </div>

      {/* Пустое состояние */}
      {businesses.length === 0 && (
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Building2 className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Нет добавленных заведений
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Добавьте свое заведение или место, которое вы знаете, 
            чтобы помочь русскоязычному сообществу
          </p>
          <div className="space-y-3">
            <p className="text-xs text-gray-400">
              После модерации ваше заведение появится в каталоге
            </p>
          </div>
        </div>
      )}

      {/* Список добавленных заведений (если есть) */}
      {businesses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Добавленные заведения
          </h2>
          
          {businesses.map((business) => (
            <div
              key={business.id}
              className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
            >
              {/* Header заведения */}
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {business.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="mr-1">{business.category.icon}</span>
                    {business.category.name}
                  </div>
                </div>
                {getStatusBadge(business.status)}
              </div>

              {/* Адрес */}
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="truncate">
                  {business.address}, {business.city.name}
                </span>
              </div>

              {/* Дата добавления */}
              <p className="text-xs text-gray-400">
                Добавлено {new Date(business.createdAt).toLocaleDateString('ru-RU')}
              </p>

              {/* Кнопка просмотра */}
              {business.status === 'ACTIVE' && (
                <Link href={`/tg/business/${business.id}`}>
                  <Button 
                    variant="outline" 
                    className="w-full text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Посмотреть в каталоге
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FAQ секция */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">
          Часто задаваемые вопросы
        </h3>
        
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-gray-700">
              Сколько времени займет модерация?
            </p>
            <p className="text-gray-600">
              Обычно 1-2 рабочих дня. Мы проверяем корректность информации.
            </p>
          </div>
          
          <div>
            <p className="font-medium text-gray-700">
              Можно ли добавить чужое заведение?
            </p>
            <p className="text-gray-600">
              Да, если вы знаете качественное заведение, которого нет в каталоге.
            </p>
          </div>
          
          <div>
            <p className="font-medium text-gray-700">
              Что если информация неточная?
            </p>
            <p className="text-gray-600">
              Владельцы могут связаться с нами для исправления информации.
            </p>
          </div>
        </div>
      </div>

      {/* Отступ для нижней навигации */}
      <div className="h-4"></div>
    </div>
  );
}
