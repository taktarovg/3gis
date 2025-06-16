'use client';

import { MapPin, Loader2 } from 'lucide-react';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface NearbyButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Кнопка "Рядом со мной" для поиска заведений поблизости
 */
export function NearbyButton({ 
  className = '', 
  variant = 'primary',
  size = 'md'
}: NearbyButtonProps) {
  const { hasLocation, isLoading, requestLocation, error, latitude, longitude } = useGeolocation();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNearbySearch = async () => {
    if (hasLocation && latitude && longitude) {
      // Если локация уже есть, сразу переходим к поиску
      setIsNavigating(true);
      router.push(`/tg/businesses?lat=${latitude}&lng=${longitude}&radius=10`);
    } else {
      // Запрашиваем локацию
      await requestLocation();
    }
  };

  // После получения локации автоматически переходим к поиску
  if (hasLocation && latitude && longitude && !isNavigating && !error) {
    setIsNavigating(true);
    router.push(`/tg/businesses?lat=${latitude}&lng=${longitude}&radius=10`);
  }

  const baseClasses = "flex items-center justify-center font-medium transition-colors rounded-lg";
  
  const variantClasses = {
    primary: hasLocation 
      ? 'bg-green-500 hover:bg-green-600 text-white' 
      : 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const isDisabled = isLoading || isNavigating;

  return (
    <button
      onClick={handleNearbySearch}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      title={error || 'Найти заведения рядом с вами'}
    >
      {isLoading || isNavigating ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <MapPin className="w-4 h-4 mr-2" />
      )}
      
      {isLoading ? 'Определяем...' : 
       isNavigating ? 'Ищем...' :
       hasLocation ? 'Рядом со мной' : 'Найти рядом'}
    </button>
  );
}

/**
 * Компактная версия кнопки (только иконка)
 */
export function NearbyButtonCompact({ 
  className = '',
  onLocationFound
}: { 
  className?: string;
  onLocationFound?: (lat: number, lng: number) => void;
}) {
  const { hasLocation, isLoading, requestLocation, latitude, longitude } = useGeolocation();

  const handleClick = async () => {
    if (hasLocation && latitude && longitude && onLocationFound) {
      onLocationFound(latitude, longitude);
    } else {
      await requestLocation();
    }
  };

  // Автоматически вызываем callback при получении локации
  if (hasLocation && latitude && longitude && onLocationFound) {
    onLocationFound(latitude, longitude);
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        p-2 rounded-lg transition-colors
        ${hasLocation 
          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      title="Определить мое местоположение"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <MapPin className="w-5 h-5" />
      )}
    </button>
  );
}
