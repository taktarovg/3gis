// src/components/businesses/BusinessDetail.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeft, MapPin, Phone, Globe, Clock, Star, Share, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatRating, formatPhoneNumber, formatBusinessHours, isBusinessOpen } from '@/lib/utils';

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

  const handleBack = () => {
    router.back();
  };

  const handleCall = () => {
    if (business.phone) {
      const cleanPhone = business.phone.replace(/\D/g, '');
      window.open(`tel:${cleanPhone}`, '_self');
    }
  };

  const handleRoute = () => {
    const query = encodeURIComponent(`${business.address}, ${business.city.name}, ${business.city.state}`);
    window.open(`https://maps.google.com/?q=${query}`, '_blank');
  };

  const handleWebsite = () => {
    if (business.website) {
      window.open(business.website, '_blank');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: `${business.name} - ${business.category.name}`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="relative">
        {/* Photo gallery */}
        {business.photos.length > 0 && (
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
            
            {/* Share button */}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full"
            >
              <Share className="h-5 w-5" />
            </button>

            {/* Premium badge */}
            {business.premiumTier !== 'FREE' && (
              <div className="absolute bottom-4 right-4 bg-threegis-accent text-threegis-text px-3 py-1 rounded-md text-sm font-bold">
                PREMIUM
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Business name and category */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-threegis-text mb-1">
            {business.name}
          </h1>
          <p className="text-threegis-secondary flex items-center">
            <span className="mr-2">{business.category.icon}</span>
            {business.category.name}
          </p>
        </div>

        {/* Rating */}
        {business.rating > 0 && (
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
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-threegis-secondary mr-3 flex-shrink-0" />
              <p className="text-threegis-accent truncate">{business.website}</p>
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

        {/* Reviews section */}
        {business.reviews.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-threegis-text mb-3">Отзывы</h3>
            <div className="space-y-4">
              {business.reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center text-yellow-500 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-threegis-secondary">
                      {review.user.firstName} {review.user.lastName}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-threegis-text text-sm">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed action buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-container">
        <div className="flex gap-3">
          {business.phone && (
            <button
              onClick={handleCall}
              className="flex-1 bg-threegis-primary text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center"
            >
              <Phone className="h-5 w-5 mr-2" />
              Позвонить
            </button>
          )}
          
          <button
            onClick={handleRoute}
            className="flex-1 bg-gray-100 text-threegis-text py-3 px-4 rounded-lg font-semibold flex items-center justify-center"
          >
            <MapPin className="h-5 w-5 mr-2" />
            Маршрут
          </button>

          {business.website && (
            <button
              onClick={handleWebsite}
              className="flex-1 bg-gray-100 text-threegis-text py-3 px-4 rounded-lg font-semibold flex items-center justify-center"
            >
              <Globe className="h-5 w-5 mr-2" />
              Сайт
            </button>
          )}
        </div>
      </div>
    </div>
  );
}