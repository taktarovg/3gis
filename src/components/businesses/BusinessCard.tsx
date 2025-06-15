// src/components/businesses/BusinessCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Star, Globe, ExternalLink } from 'lucide-react';
import { formatRating, formatPhoneNumber } from '@/lib/utils';
import { usePlatformActions } from '@/hooks/use-platform-detection';

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
    <div className="threegis-business-card">
      {/* Premium badge */}
      {business.premiumTier !== 'FREE' && (
        <div className="absolute top-3 right-3 bg-threegis-accent text-threegis-text px-2 py-1 rounded-md text-xs font-bold">
          PREMIUM
        </div>
      )}

      {/* Photo */}
      {business.photos.length > 0 && (
        <Image
          src={business.photos[0].url}
          alt={business.name}
          width={400}
          height={200}
          className="threegis-business-image"
          priority={false}
        />
      )}

      {/* Business info */}
      <div>
        <h3 className="threegis-business-name">
          {business.name}
        </h3>
        
        <p className="threegis-business-category">
          <span className="mr-2">{business.category.icon}</span>
          {business.category.name}
        </p>

        {/* Rating */}
        {business.rating > 0 && (
          <div className="threegis-business-rating">
            <div className="stars">
              ★ {formatRating(business.rating)}
            </div>
            <span className="text-sm text-threegis-secondary">
              ({business._count.reviews} отзывов)
            </span>
          </div>
        )}

        {/* Address + Distance */}
        <div className="threegis-business-address">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          <div>
            <div>{business.address}, {business.city.name}</div>
            {business.distance !== undefined && (
              <div className="text-sm text-threegis-accent font-medium mt-1">
                📍 {business.distance < 1 
                  ? `${Math.round(business.distance * 1000)} м` 
                  : `${business.distance.toFixed(1)} км`
                } от вас
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {business.description && (
          <p className="text-sm text-threegis-secondary mt-2 line-clamp-2">
            {business.description}
          </p>
        )}

        {/* Features */}
        <div className="threegis-business-features">
          {business.languages.includes('ru') && (
            <span className="threegis-feature-tag russian">
              🇷🇺 Русский язык
            </span>
          )}
          {business.hasParking && (
            <span className="threegis-feature-tag">
              🅿️ Парковка
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="threegis-business-actions">
          {business.phone && (
            <button
              onClick={handleCall}
              className="threegis-action-button primary"
              title={platform.canMakeCall ? 'Позвонить' : 'Откроется в новой вкладке'}
            >
              <Phone className="h-4 w-4 mr-1" />
              Позвонить
              {!platform.canMakeCall && <ExternalLink className="h-3 w-3 ml-1" />}
            </button>
          )}
          
          <button
            onClick={handleRoute}
            className="threegis-action-button secondary"
            title={platform.canOpenMaps ? 'Открыть карты' : 'Откроется в новой вкладке'}
          >
            <MapPin className="h-4 w-4 mr-1" />
            Маршрут
            {!platform.canOpenMaps && <ExternalLink className="h-3 w-3 ml-1" />}
          </button>

          {business.website && (
            <button
              onClick={handleWebsite}
              className="threegis-action-button secondary"
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
          className="block mt-3 text-center text-threegis-accent text-sm font-medium"
        >
          Подробнее →
        </Link>
      </div>
    </div>
  );
}