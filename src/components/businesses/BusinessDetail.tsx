// src/components/businesses/BusinessDetail.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, MapPin, Phone, Globe, Clock, Star, Share, Heart, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatRating, formatPhoneNumber, formatBusinessHours, isBusinessOpen } from '@/lib/utils';
import { InlineMap } from '@/components/maps/InlineMap';
import { usePlatformActions } from '@/hooks/use-platform-detection';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';
import { PremiumPlansModal } from '@/components/premium/PremiumPlansModal';
import { SubscriptionStatus } from '@/components/premium/SubscriptionStatus';
import { useTelegramStars } from '@/hooks/use-telegram-stars';
import { useBusinessOwner } from '@/hooks/use-business-owner';
import { ShareButton } from '@/components/share/ShareButton';

interface BusinessDetailProps {
  business: {
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
    hasWiFi: boolean;
    acceptsCrypto: boolean;
    businessHours?: any;
    premiumTier: string;
    latitude?: number | null;
    longitude?: number | null;
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
      caption?: string | null;
    }[];
    reviews: {
      id: number;
      rating: number;
      comment?: string | null;
      createdAt: Date;
      user: {
        firstName: string;
        lastName?: string | null;
      };
    }[];
    _count: {
      reviews: number;
      favorites: number;
    };
  };
}

export function BusinessDetail({ business }: BusinessDetailProps) {
  const router = useRouter();
  const { makeCall, openMaps, shareLocation } = usePlatformActions();
  const { buttonPress, success } = useHapticFeedback();
  const { isAuthenticated } = useTelegramStars();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  // Проверяем, является ли текущий пользователь владельцем заведения
  const { data: ownerData, isLoading: isOwnerLoading } = useBusinessOwner(business.id);
  const isOwner = ownerData?.isOwner || false;

  const handleBack = () => {
    router.back();
  };

  const handleCall = () => {
    buttonPress(); // Haptic feedback
    if (business.phone) {
      makeCall(business.phone);
      success(); // Успешное действие
    }
  };

  const handleRoute = () => {
    buttonPress(); // Haptic feedback
    const fullAddress = `${business.address}, ${business.city.name}, ${business.city.state}`;
    openMaps(fullAddress);
    success(); // Успешное действие
  };

  const handleWebsite = () => {
    buttonPress(); // Haptic feedback
    if (business.website) {
      window.open(business.website, '_blank');
      success(); // Успешное действие
    }
  };

  const handleShare = () => {
    buttonPress(); // Haptic feedback
    shareLocation(business.name, window.location.href);
  };

  const hasPhotos = business.photos.length > 0;
  const hasRating = business.rating > 0;
  const isPremium = business.premiumTier !== 'FREE';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative">
        {/* Photo gallery или header без фото */}
        {hasPhotos ? (
          <div className="relative h-64 overflow-hidden">
            <Image
              src={business.photos[0].url}
              alt={business.name}
              width={800}
              height={256}
              className="w-full h-full object-cover"
              priority
            />
            {/* Back button */}
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <FavoriteButton
                businessId={business.id}
                favoritesCount={business._count.favorites}
                size="lg"
                variant="overlay"
                showCount={true}
                layout="horizontal"
              />
              <ShareButton
                type="business"
                entity={{
                  id: business.id,
                  name: business.name,
                  slug: business.id.toString(), // fallback to ID
                  description: business.description || undefined
                }}
                variant="icon"
                className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              />
            </div>

            {/* Premium badge */}
            {isPremium && (
              <div className="absolute bottom-4 right-4 bg-threegis-accent text-threegis-text px-3 py-1 rounded-md text-sm font-bold">
                PREMIUM
              </div>
            )}
          </div>
        ) : (
          /* Header без фото */
          <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 h-32">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <FavoriteButton
                businessId={business.id}
                favoritesCount={business._count.favorites}
                size="lg"
                variant="overlay"
                showCount={true}
                layout="horizontal"
              />
              <ShareButton
                type="business"
                entity={{
                  id: business.id,
                  name: business.name,
                  slug: business.id.toString(), // fallback to ID
                  description: business.description || undefined
                }}
                variant="icon"
                className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              />
            </div>

            {/* Business info in header */}
            <div className="absolute bottom-4 left-4 text-white">
              <h1 className="text-xl font-bold">{business.name}</h1>
              <p className="text-blue-100 flex items-center">
                <span className="mr-2">{business.category.icon}</span>
                {business.category.name}
              </p>
            </div>

            {/* Premium badge */}
            {isPremium && (
              <div className="absolute bottom-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-md text-sm font-bold">
                PREMIUM
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pb-32">
        {/* Business name and category (только если есть фото) */}
        {hasPhotos && (
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-threegis-text mb-1">
              {business.name}
            </h1>
            <p className="text-threegis-secondary flex items-center">
              <span className="mr-2">{business.category.icon}</span>
              {business.category.name}
            </p>
          </div>
        )}

        {/* Rating */}
        {hasRating && (
          <div className="flex items-center mb-4">
            <div className="flex items-center text-yellow-500 mr-2">
              <Star className="h-5 w-5 fill-current" />
              <span className="ml-1 font-semibold">{formatRating(business.rating)}</span>
            </div>
            <span className="text-threegis-secondary">
              ({business._count.reviews} отзывов)
            </span>
          </div>
        )}

        {/* Contact info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-threegis-secondary mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-threegis-text">{business.address}</p>
              <p className="text-threegis-secondary text-sm">
                {business.city.name}, {business.city.state}
              </p>
            </div>
          </div>

          {business.phone && (
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-threegis-secondary mr-3 flex-shrink-0" />
              <p className="text-threegis-text">{formatPhoneNumber(business.phone)}</p>
            </div>
          )}

          {business.website && (
            <div className="flex items-center cursor-pointer" onClick={handleWebsite}>
              <Globe className="h-5 w-5 text-threegis-secondary mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-blue-600 underline truncate hover:text-blue-800 transition-colors">
                  {business.website.replace(/^https?:\/\//, '')}
                </p>
                <p className="text-xs text-gray-500">Нажмите для перехода</p>
              </div>
            </div>
          )}

          {business.businessHours && (
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-threegis-secondary mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-threegis-text">
                  {formatBusinessHours(business.businessHours)}
                </p>
                <p className={`text-sm ${isBusinessOpen(business.businessHours) ? 'text-green-600' : 'text-red-600'}`}>
                  {isBusinessOpen(business.businessHours) ? '🟢 Открыто сейчас' : '🔴 Закрыто'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Встроенная карта */}
        {business.latitude != null && business.longitude != null && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-threegis-text mb-3">Местоположение</h3>
            <InlineMap 
              business={{
                id: business.id,
                name: business.name,
                address: business.address,
                latitude: business.latitude,
                longitude: business.longitude,
                category: business.category,
                city: business.city,
                premiumTier: business.premiumTier
              }}
              className="rounded-lg overflow-hidden"
            />
          </div>
        )}

        {/* Description */}
        {business.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-threegis-text mb-2">О заведении</h3>
            <p className="text-threegis-secondary leading-relaxed">
              {business.description}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-threegis-text mb-3">Особенности</h3>
          <div className="flex flex-wrap gap-2">
            {business.languages.includes('ru') && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                🇷🇺 Русский язык
              </span>
            )}
            {business.hasParking && (
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                🅿️ Парковка
              </span>
            )}
            {business.hasWiFi && (
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                📶 Wi-Fi
              </span>
            )}
            {business.acceptsCrypto && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                ₿ Криптовалюта
              </span>
            )}
          </div>
        </div>

        {/* Premium Status Section (only for owners) */}
        {!isOwnerLoading && isOwner && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-threegis-text mb-3 flex items-center">
              <Crown className="h-5 w-5 text-yellow-500 mr-2" />
              Статус подписки
            </h3>
            <SubscriptionStatus businessId={business.id} />
            
            {business.premiumTier === 'FREE' && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      alert('Необходима авторизация через Telegram');
                      return;
                    }
                    buttonPress();
                    setShowPremiumModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-3 px-4 rounded-lg font-semibold flex items-center justify-center hover:from-yellow-500 hover:to-yellow-700 transition-all duration-200 active:scale-95 shadow-lg"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Обновить до Премиум
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Увеличьте видимость вашего заведения!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Premium Benefits Display (for all users) */}
        {isPremium && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Crown className="h-5 w-5 text-yellow-600 mr-2" />
                <h3 className="font-semibold text-yellow-800">
                  Премиум заведение
                </h3>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Это заведение имеет премиум статус и получает приоритет в поиске.
              </p>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  let features = [];
                  if (business.premiumTier === 'BASIC') {
                    features = ['✅ Верифицировано', '📸 Больше фото', '📊 Статистика'];
                  } else if (business.premiumTier === 'STANDARD') {
                    features = ['🔝 Приоритет в поиске', '📈 Аналитика', '📱 Соцсети'];
                  } else {
                    features = ['👑 Позиция #1', '🎯 Реклама', '🎨 Кастом дизайн'];
                  }
                  return features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-yellow-300 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {feature}
                    </span>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed action buttons - над нижней навигацией */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
        <div className="flex gap-3 max-w-md mx-auto">
          {business.phone && (
            <button
              onClick={handleCall}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md"
            >
              <Phone className="h-5 w-5 mr-2" />
              Позвонить
            </button>
          )}
          
          <button
            onClick={handleRoute}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md"
          >
            <MapPin className="h-5 w-5 mr-2" />
            Маршрут
          </button>
        </div>
      </div>

      {/* Модал премиум планов */}
      <PremiumPlansModal
        businessId={business.id}
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSuccess={() => {
          setShowPremiumModal(false);
          success();
          // Обновляем страницу через 3 секунды
          setTimeout(() => window.location.reload(), 3000);
        }}
      />
    </div>
  );
}
