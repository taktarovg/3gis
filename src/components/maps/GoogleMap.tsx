'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { initializeMap, createBusinessMarker } from '@/lib/maps/google-maps';
import { Loader2 } from 'lucide-react';

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
 * Интерактивная Google карта с маркерами заведений
 */
export function GoogleMap({
  businesses,
  center,
  zoom = 13,
  height = '400px',
  onBusinessClick,
  className = ''
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Определяем центр карты - мемоизируем для стабильности
  const mapCenter = useMemo(() => {
    return center || (businesses.length > 0 
      ? { lat: businesses[0].latitude, lng: businesses[0].longitude }
      : { lat: 40.7128, lng: -74.0060 } // Нью-Йорк по умолчанию
    );
  }, [center, businesses]);

  // ✅ ИСПРАВЛЕНО: Мемоизируем функцию добавления маркеров
  const addMarkers = useCallback(async () => {
    if (!map || businesses.length === 0) return;

    // Очищаем существующие маркеры
    markers.forEach(marker => marker.map = null);

    // Создаем новые маркеры
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
    
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
          console.error('Error creating marker for business:', business.name, error);
        }
      }
    }

    setMarkers(newMarkers);

    // Автоматическое масштабирование карты
    if (businesses.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      businesses.forEach(business => {
        if (business.latitude && business.longitude) {
          bounds.extend({ lat: business.latitude, lng: business.longitude });
        }
      });
      map.fitBounds(bounds);
    }
  }, [map, businesses, onBusinessClick, markers]);

  // Инициализация карты
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        setIsLoading(true);
        const googleMap = await initializeMap(mapRef.current!, {
          center: mapCenter,
          zoom,
        });
        setMap(googleMap);
        setError(null);
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Не удалось загрузить карту');
      } finally {
        setIsLoading(false);
      }
    };

    initMap();
  }, [mapCenter, zoom]); // Включаем mapCenter в зависимости

  // ✅ ИСПРАВЛЕНО: Используем addMarkers с правильными зависимостями
  useEffect(() => {
    addMarkers();
  }, [addMarkers]); // Включаем addMarkers в зависимости

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300 ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <p>⚠️ {error}</p>
          <p className="text-sm">Проверьте подключение к интернету</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300 z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-gray-600">Загружаем карту...</p>
          </div>
        </div>
      )}
      
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg border border-gray-300"
        style={{ opacity: isLoading ? 0 : 1 }}
      />
      
      {/* Количество заведений на карте */}
      {!isLoading && businesses.length > 0 && (
        <div className="absolute top-3 left-3 bg-white rounded-lg shadow-md px-3 py-1 text-sm font-medium">
          {businesses.length} {businesses.length === 1 ? 'место' : 'мест'}
        </div>
      )}
    </div>
  );
}

/**
 * Простая карта только для показа (без интерактива)
 */
export function SimpleMap({ 
  businesses, 
  center,
  className = ''
}: Omit<GoogleMapProps, 'onBusinessClick' | 'height'>) {
  return (
    <GoogleMap
      businesses={businesses}
      center={center}
      height="300px"
      className={className}
    />
  );
}
