'use client';

import Image from 'next/image';
import { getStaticMapUrl } from '@/lib/maps/google-maps';

interface StaticMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  width?: number;
  height?: number;
  className?: string;
  markers?: Array<{ lat: number; lng: number; color?: string }>;
}

/**
 * Статичная карта для превью (использует Static Maps API - бесплатно)
 */
export function StaticMap({ 
  latitude, 
  longitude, 
  zoom = 15,
  width = 400,
  height = 300,
  className = '',
  markers = []
}: StaticMapProps) {
  const mapUrl = getStaticMapUrl(latitude, longitude, {
    zoom,
    width,
    height,
    markers
  });

  return (
    <Image
      src={mapUrl}
      alt="Карта местоположения"
      width={width}
      height={height}
      className={`rounded-lg border border-gray-300 ${className}`}
      onError={(e) => {
        // Fallback в случае ошибки загрузки карты
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `
            <div class="flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300" 
                 style="width: ${width}px; height: ${height}px;">
              <div class="text-center text-gray-500">
                <div class="text-2xl mb-2">🗺️</div>
                <div class="text-sm">Карта недоступна</div>
              </div>
            </div>
          `;
        }
      }}
    />
  );
}
