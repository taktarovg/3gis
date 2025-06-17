// src/components/businesses/BusinessCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Star, Globe, ExternalLink } from 'lucide-react';
import { formatRating, formatPhoneNumber } from '@/lib/utils';
import { usePlatformActions } from '@/hooks/use-platform-detection';
import { CompactInlineMap } from '@/components/maps/InlineMap';

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
  _count: {
    reviews: number;
    favorites: number;
  };
}

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const { platform, makeCall, openMaps } = usePlatformActions();

  const handleCall = () => {
    if (business.phone) {
      makeCall(business.phone);
    }
  };

  const handleRoute = () => {
    const fullAddress = `${business.address}, ${business.city.name}, ${business.city.state}`;
    openMaps(fullAddress);
  };

  const handleWebsite = () => {
    if (business.website) {
      if (platform.isTelegram) {
        // В Telegram всегда открываем в новой вкладке
        window.open(business.website, '_blank');
      } else {
        window.open(business.website, '_blank');
      }
    }
  };

  return (
    <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Premium badge */}
      {business.premiumTier !== 'FREE' && (
        <div className="absolute top-3 right-3 bg-yellow-500 text-black px-2 py-1 rounded-md text-xs font-bold z-10">
          PREMIUM
        </div>
      )}

      {/* Photo */}
      {business.photos.length > 0 && (
        <div className="w-full h-48 relative">
          <Image
            src={business.photos[0].url}
            alt={business.name}
            fill
            className="object-cover"
            priority={false}
          />
        </div>
      )}

      {/* Business info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {business.name}
        </h3>
        
        <p className="flex items-center text-gray-600 mb-2">
          <span className="mr-2">{business.category.icon}</span>
          {business.category.name}
        </p>

        {/* Rating */}
        {business.rating > 0 && (
          <div className="flex items-center mb-3">
            <div className="flex items-center text-yellow-500 mr-2">
              ★ {formatRating(business.rating)}
            </div>
            <span className="text-sm text-gray-500">
              ({business._count.reviews} отзывов)
            </span>
          </div>
        )}

        {/* Address + Distance */}
        <div className="flex items-start mb-3">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <div className="text-gray-700">{business.address}, {business.city.name}</div>
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

        {/* Компактная карта */}
        {business.latitude && business.longitude && (
          <div className="mb-3">
            <CompactInlineMap 
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
            />
          </div>
        )}

        {/* Description */}
        {business.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {business.description}
          </p>
        )}

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
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

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {business.phone && (
            <button
              onClick={handleCall}
              className="flex-1 min-w-0 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
              title={platform.canMakeCall ? 'Позвонить' : 'Откроется в новой вкладке'}
            >
              <Phone className="h-4 w-4 mr-1" />
              Позвонить
              {!platform.canMakeCall && <ExternalLink className="h-3 w-3 ml-1" />}
            </button>
          )}
          
          <button
            onClick={handleRoute}
            className="flex-1 min-w-0 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
            title={platform.canOpenMaps ? 'Открыть карты' : 'Откроется в новой вкладке'}
          >
            <MapPin className="h-4 w-4 mr-1" />
            Маршрут
            {!platform.canOpenMaps && <ExternalLink className="h-3 w-3 ml-1" />}
          </button>

          {business.website && (
            <button
              onClick={handleWebsite}
              className="flex-1 min-w-0 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
              title="Откроется в новой вкладке"
            >
              <Globe className="h-4 w-4 mr-1" />
              Сайт
              <ExternalLink className="h-3 w-3 ml-1" />
            </button>
          )}
        </div>

        {/* Link to detail page */}
        <Link
          href={`/tg/business/${business.id}`}
          className="block text-center text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
        >
          Подробнее →
        </Link>
      </div>
    </div>
  );
}