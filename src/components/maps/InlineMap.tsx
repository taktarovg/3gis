'use client';

import { useState } from 'react';
import { GoogleMap } from '@/components/maps/GoogleMap';
import { StaticMapPreview } from '@/components/maps/StaticMapPreview';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import { usePlatformActions } from '@/hooks/use-platform-detection';

interface InlineMapProps {
  business: {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    category: { icon: string };
    city: { name: string; state: string };
    premiumTier?: string;
  };
  className?: string;
}

/**
 * Встроенная карта для страницы заведения
 */
export function InlineMap({ business, className = '' }: InlineMapProps) {
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);
  const { openMaps, platform } = usePlatformActions();

  const handleOpenExternal = () => {
    const fullAddress = `${business.address}, ${business.city.name}, ${business.city.state}`;
    openMaps(fullAddress);
  };

  const handleShowInteractive = () => {
    setShowInteractiveMap(true);
  };

  if (showInteractiveMap) {
    return (
      <div className={`relative ${className}`}>
        {/* Интерактивная карта */}
        <GoogleMap
          businesses={[business]}
          center={{ lat: business.latitude, lng: business.longitude }}
          zoom={16}
          height="300px"
          className="w-full"
        />
        
        {/* Элементы управления поверх карты */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={() => setShowInteractiveMap(false)}
            className="bg-white rounded-lg p-2 shadow-md text-gray-600 hover:text-gray-800"
            title="Вернуться к превью"
          >
            <MapPin className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleOpenExternal}
            className="bg-blue-500 text-white rounded-lg p-2 shadow-md hover:bg-blue-600"
            title="Открыть в картах"
          >
            <Navigation className="h-4 w-4" />
          </button>
        </div>
        
        {/* Информация о заведении поверх карты */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{business.name}</h4>
              <p className="text-sm text-gray-600">{business.address}</p>
            </div>
            <div className="text-2xl">{business.category.icon}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative cursor-pointer ${className}`} onClick={handleShowInteractive}>
      {/* Статичная карта как превью */}
      <StaticMapPreview
        latitude={business.latitude}
        longitude={business.longitude}
        zoom={16}
        width={400}
        height={300}
        className="w-full h-[300px] object-cover"
      />
      
      {/* Overlay с кнопками */}
      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg">
        {/* Кнопка для интерактивной карты */}
        <div className="absolute top-3 left-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium text-gray-700 shadow-md">
            Нажмите для интерактивной карты
          </div>
        </div>
        
        {/* Кнопка для внешних карт */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenExternal();
          }}
          className="absolute top-3 right-3 bg-blue-500 text-white rounded-lg p-2 shadow-md hover:bg-blue-600 transition-colors"
          title={platform.canOpenMaps ? 'Открыть карты' : 'Откроется в новой вкладке'}
        >
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
      
      {/* Информация о заведении */}
      <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{business.name}</h4>
            <p className="text-sm text-gray-600">{business.address}</p>
            <p className="text-xs text-gray-500">{business.city.name}, {business.city.state}</p>
          </div>
          <div className="text-2xl">{business.category.icon}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Компактная встроенная карта для карточек
 */
export function CompactInlineMap({ business, className = '' }: InlineMapProps) {
  const { openMaps } = usePlatformActions();

  const handleOpenMaps = () => {
    const fullAddress = `${business.address}, ${business.city.name}, ${business.city.state}`;
    openMaps(fullAddress);
  };

  return (
    <div className={`relative ${className}`}>
      <StaticMapPreview
        latitude={business.latitude}
        longitude={business.longitude}
        zoom={15}
        width={200}
        height={150}
        className="w-full h-[150px] object-cover rounded-lg"
      />
      
      {/* Overlay кнопка */}
      <button
        onClick={handleOpenMaps}
        className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center group"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Navigation className="h-5 w-5 text-blue-600" />
        </div>
      </button>
    </div>
  );
}
