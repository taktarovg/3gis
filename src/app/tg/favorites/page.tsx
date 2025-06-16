// src/app/tg/favorites/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Heart, MapPin, Phone, Star, Loader2 } from 'lucide-react';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface FavoriteBusiness {
  id: number;
  name: string;
  category: {
    name: string;
    icon: string;
  };
  city: {
    name: string;
    state: string;
  };
  address: string;
  phone?: string;
  rating: number;
  reviewCount: number;
  photos: Array<{ url: string }>;
  distance?: number;
}

/**
 * Страница избранных заведений для 3GIS
 */
export default function FavoritesPage() {
  const { user } = useTelegramAuth();
  const token = useAuthStore((state) => state.token);
  const [favorites, setFavorites] = useState<FavoriteBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загружаем избранные заведения
  useEffect(() => {
    const loadFavorites = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFavorites(data.favorites || []);
        } else {
          setError('Не удалось загрузить избранные заведения');
        }
      } catch (err) {
        setError('Ошибка при загрузке данных');
        console.error('Error loading favorites:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [token]);

  // Удаление из избранного
  const handleRemoveFromFavorites = async (businessId: number) => {
    if (!token) return;

    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId }),
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.id !== businessId));
      }
    } catch (err) {
      console.error('Error removing from favorites:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
          Избранное
        </h1>
        <p className="text-gray-600">
          {favorites.length === 0 
            ? 'У вас пока нет избранных заведений'
            : `${favorites.length} заведений в избранном`
          }
        </p>
      </div>

      {/* Пустое состояние */}
      {favorites.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Heart className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Нет избранных заведений
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Добавляйте заведения в избранное, чтобы быстро находить их здесь
          </p>
          <Link href="/tg">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Найти заведения
            </Button>
          </Link>
        </div>
      )}

      {/* Список избранных заведений */}
      {favorites.length > 0 && (
        <div className="space-y-4">
          {favorites.map((business) => (
            <div
              key={business.id}
              className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
            >
              {/* Фото и основная информация */}
              <div className="flex space-x-3">
                {business.photos[0] && (
                  <Image
                    src={business.photos[0].url}
                    alt={business.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
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
                    
                    {/* Кнопка удалить из избранного */}
                    <button
                      onClick={() => handleRemoveFromFavorites(business.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Рейтинг и адрес */}
              <div className="space-y-2">
                {/* Рейтинг */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium ml-1">
                      {business.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({business.reviewCount} отзывов)
                  </span>
                </div>

                {/* Адрес */}
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="truncate">
                    {business.address}, {business.city.name}
                  </span>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex space-x-2 pt-2">
                <Link 
                  href={`/tg/business/${business.id}`}
                  className="flex-1"
                >
                  <Button 
                    variant="outline" 
                    className="w-full text-sm"
                  >
                    Подробнее
                  </Button>
                </Link>
                
                {business.phone && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`tel:${business.phone}`)}
                    className="px-3"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
