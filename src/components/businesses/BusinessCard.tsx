// src/components/businesses/BusinessCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Star, Globe } from 'lucide-react';
import { formatRating, formatPhoneNumber } from '@/lib/utils';

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

        {/* Address */}
        <div className="threegis-business-address">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          {business.address}, {business.city.name}
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
            >
              <Phone className="h-4 w-4 mr-1" />
              Позвонить
            </button>
          )}
          
          <button
            onClick={handleRoute}
            className="threegis-action-button secondary"
          >
            <MapPin className="h-4 w-4 mr-1" />
            Маршрут
          </button>

          {business.website && (
            <button
              onClick={handleWebsite}
              className="threegis-action-button secondary"
            >
              <Globe className="h-4 w-4 mr-1" />
              Сайт
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