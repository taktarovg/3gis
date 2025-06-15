'use client';

import { useEffect, useRef, useState } from 'react';
import { initializeMap, createBusinessMarker } from '@/lib/maps/google-maps';
import { DistanceCalculator } from '@/lib/maps/distance-calculator';

interface GoogleMapProps {
  businesses: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    category: { icon: string };
    premiumTier?: string;
  }>;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onBusinessClick?: (business: any) => void;
  className?: string;
}

/**
 * Интерактивная карта Google Maps с маркерами заведений
 */
export function GoogleMap({
  businesses,
  center,
  zoom,
  height = '400px',
  onBusinessClick,
  className = '',
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Инициализация карты
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Определяем центр карты
        let mapCenter = center;
        if (!mapCenter && businesses.length > 0) {
          const validBusinesses = businesses.filter(b => b.latitude && b.longitude);
          if (validBusinesses.length > 0) {
            mapCenter = DistanceCalculator.getCenterPoint(validBusinesses);
          }
        }
        
        // Определяем zoom
        let mapZoom = zoom;
        if (!mapZoom && businesses.length > 0) {
          const validBusinesses = businesses.filter(b => b.latitude && b.longitude);
          mapZoom = DistanceCalculator.calculateZoom(validBusinesses);
        }

        const googleMap = await initializeMap(mapRef.current!, {
          center: mapCenter,
          zoom: mapZoom || 13,
        });
        
        setMap(googleMap);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Не удалось загрузить карту');
        setIsLoading(false);
      }
    };

    initMap();
  }, [center, zoom, businesses]);

  // Добавление маркеров заведений
  useEffect(() => {
    if (!map) return;

    const addMarkers = async () => {
      // Очищаем существующие маркеры
      markers.forEach(marker => marker.setMap(null));

      // Создаем новые маркеры
      const newMarkers: google.maps.Marker[] = [];
      
      for (const business of businesses) {
        if (business.latitude && business.longitude) {
          try {
            const marker = await createBusinessMarker(
              map,
              business,
              onBusinessClick
            );
            newMarkers.push(marker);
          } catch (error) {
            console.error('Error creating marker for business:', business.id, error);
          }
        }
      }

      setMarkers(newMarkers);

      // Автоматическое масштабирование карты для всех маркеров
      if (newMarkers.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        businesses.forEach(business => {
          if (business.latitude && business.longitude) {
            bounds.extend({ lat: business.latitude, lng: business.longitude });
          }
        });
        map.fitBounds(bounds);
      }
    };

    addMarkers();
  }, [map, businesses, onBusinessClick, markers]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50 ${className}`}
        style={{ height }}
      >
        <div className="text-center p-4">
          <div className="text-red-500 text-4xl mb-2">⚠️</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10"
          style={{ height }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Загружаем карту...</p>
          </div>
        </div>
      )}
      
      <div
        ref={mapRef}
        style={{ height }}
        className="w-full rounded-lg border border-gray-300"
      />
      
      {markers.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md px-3 py-2 text-sm text-gray-600">
          Найдено: {markers.length} мест
        </div>
      )}
    </div>
  );
}
