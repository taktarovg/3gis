'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getStaticMapUrl } from '@/lib/maps/google-maps';
import { MapPin } from 'lucide-react';

interface StaticMapPreviewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  width?: number;
  height?: number;
  markers?: Array<{ lat: number; lng: number; color?: string }>;
  className?: string;
  alt?: string;
  fallback?: React.ReactNode; // Новое поле для fallback
}

/**
 * Статичная карта для превью (использует Static Maps API - 10K бесплатно)
 */
export function StaticMapPreview({ 
  latitude, 
  longitude, 
  zoom = 15,
  width = 400,
  height = 200,
  markers = [],
  className = '',
  alt = 'Карта местоположения',
  fallback
}: StaticMapPreviewProps) {
  const [hasError, setHasError] = useState(false);
  
  const mapUrl = getStaticMapUrl(latitude, longitude, {
    zoom,
    width,
    height,
    markers
  });

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <Image
      src={mapUrl}
      alt={alt}
      width={width}
      height={height}
      className={`rounded-lg border border-gray-300 ${className}`}
      priority={false}
      onError={() => setHasError(true)}
    />
  );
}

/**
 * Миниатюра карты для карточек заведений
 */
export function MapThumbnail({
  latitude,
  longitude,
  className = ''
}: {
  latitude: number;
  longitude: number;
  className?: string;
}) {
  return (
    <StaticMapPreview
      latitude={latitude}
      longitude={longitude}
      zoom={16}
      width={150}
      height={100}
      className={className}
      alt="Расположение заведения"
    />
  );
}
