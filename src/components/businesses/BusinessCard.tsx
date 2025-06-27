// src/components/businesses/BusinessCard.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Star, Clock, Trophy } from 'lucide-react';
import { formatRating, formatDate } from '@/lib/utils';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
// ✅ Telegram SDK v3.x - haptic feedback
import { hapticFeedbackImpactOccurred } from '@telegram-apps/sdk';

interface Business {
  id: number;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  address: string;
  phone?: string | null;
  website?: string | null;
  rating: number;
  reviewCount: number;
  languages: string[];
  hasParking: boolean;
  premiumTier: string;
  latitude?: number;
  longitude?: number;
  distance?: number; // Расстояние в км
  isFavorite?: boolean; // Для optimistic updates
  category: {
    name: string;
    icon: string;
  };
  city: {
    name: string;
    state: string;
  };
  photos: {
    url: string;
  }[];
  _count?: {
    reviews: number;
    favorites: number;
  };
}

interface BusinessCardProps {
  business: Business;
  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  showAddedDate?: boolean;
  addedDate?: string;
  variant?: 'default' | 'compact';
}

/**
 * ✅ ОПТИМИЗИРОВАННАЯ КАРТОЧКА ЗАВЕДЕНИЯ
 * - Вся карточка кликабельна для перехода в профиль
 * - Сохранена кнопка "Избранное" с остановкой всплытия события
 * - Убраны кнопки "Позвонить", "Маршрут" и "Подробнее"
 * - Добавлен haptic feedback при клике
 */
export function BusinessCard({ 
  business,
  showFavoriteButton = false,
  isFavorite = false,
  showAddedDate = false,
  addedDate,
  variant = 'default'
}: BusinessCardProps) {
  const router = useRouter();
  const compactMode = variant === 'compact';

  // ✅ Оптимизированный обработчик клика по карточке
  const handleCardClick = async () => {
    try {
      // ✅ Haptic feedback при клике (SDK v3.x)
      if (hapticFeedbackImpactOccurred.isAvailable()) {
        hapticFeedbackImpactOccurred('light');
      }
      
      // Переход в профиль заведения
      router.push(`/tg/business/${business.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation без haptic feedback
      router.push(`/tg/business/${business.id}`);
    }
  };

  // ✅ Обработчик для кнопки избранного (останавливаем всплытие)
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переход по клику на карточку
  };

  return (
    <div 
      className={`relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98] ${
        business.premiumTier !== 'FREE' 
          ? 'border-2 border-yellow-400 shadow-yellow-100' 
          : 'border border-gray-200'
      }`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Открыть профиль заведения ${business.name}`}
    >
      {/* Header with Favorite button only */}
      {showFavoriteButton && (
        <div className="absolute top-3 right-3 z-10">
          <div onClick={handleFavoriteClick}>
            <FavoriteButton
              businessId={business.id}
              initialIsFavorite={isFavorite || business.isFavorite}
              favoritesCount={business._count?.favorites || 0}
              size="md"
              variant="default"
              showCount={true}
            />
          </div>
        </div>
      )}

      {/* Photo */}
      {business.photos.length > 0 && !compactMode && (
        <div className="w-full h-48 relative">
          <Image
            src={business.photos[0].url}
            alt={business.name}
            fill
            className="object-cover"
            priority={false}
          />
          {/* Градиент для лучшей читаемости текста */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      {/* Business info */}
      <div className="p-4">
        {/* Added to favorites date */}
        {showAddedDate && addedDate && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <Clock className="w-3 h-3" />
            Добавлено {formatDate(addedDate)}
          </div>
        )}

        <div className="flex gap-3">
          {/* Compact photo */}
          {business.photos.length > 0 && compactMode && (
            <div className="w-16 h-16 relative flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={business.photos[0].url}
                alt={business.name}
                fill
                className="object-cover"
                priority={false}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {/* ✅ Золотая иконка кубка для премиум заведений */}
              {business.premiumTier !== 'FREE' && (
                <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              )}
              <h3 className={`font-bold text-gray-900 ${compactMode ? 'text-base' : 'text-lg'} line-clamp-2 flex-1`}>
                {business.name}
              </h3>
            </div>
            
            <p className="flex items-center text-gray-600 mb-2">
              <span className="mr-2 text-lg">{business.category.icon}</span>
              <span className={compactMode ? 'text-sm' : ''}>{business.category.name}</span>
            </p>

            {/* Rating */}
            {business.rating > 0 && (
              <div className="flex items-center mb-2">
                <div className="flex items-center text-yellow-500 mr-2">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  {formatRating(business.rating)}
                </div>
                <span className="text-sm text-gray-500">
                  ({business._count?.reviews || 0} отзывов)
                </span>
              </div>
            )}

            {/* Address + Distance */}
            <div className="flex items-start mb-3">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className={`text-gray-700 ${compactMode ? 'text-sm' : ''} line-clamp-2`}>
                  {business.address}, {business.city.name}
                </div>
                {business.distance !== undefined && (
                  <div className="text-sm text-blue-600 font-medium mt-1">
                    📍 {business.distance < 1 
                      ? `${Math.round(business.distance * 1000)} м` 
                      : `${business.distance.toFixed(1)} км`
                    } от вас
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description (только для full mode) */}
        {business.description && !compactMode && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {business.description}
          </p>
        )}

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {business.languages.includes('ru') && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              🇷🇺 Русский язык
            </span>
          )}
          {business.hasParking && (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              🅿️ Парковка
            </span>
          )}

        </div>

        {/* ✅ Убрали кнопки действий - вся карточка теперь кликабельна */}
      </div>
    </div>
  );
}
