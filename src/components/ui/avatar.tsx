'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: number;
  fallbackText?: string;
  className?: string;
  telegramId?: string;
}

export function Avatar({ 
  src, 
  alt, 
  size = 64, 
  fallbackText,
  className = "",
  telegramId 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Обработка ошибки загрузки изображения
  const handleImageError = () => {
    console.log('❌ Ошибка загрузки аватара:', src);
    setImageError(true);
    setIsLoading(false);
  };

  // Обработка успешной загрузки
  const handleImageLoad = () => {
    console.log('✅ Аватар загружен успешно:', src);
    setImageError(false);
    setIsLoading(false);
  };

  // Fallback изображения
  const fallbackSrc = telegramId 
    ? `https://avatar.iran.liara.run/public/${telegramId}`
    : `https://avatar.iran.liara.run/username?username=${encodeURIComponent(fallbackText || alt)}`;

  return (
    <div 
      className={`relative rounded-full overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Loading state */}
      {isLoading && !imageError && (
        <div className="animate-pulse bg-gray-200 w-full h-full rounded-full" />
      )}

      {/* Основное изображение */}
      {src && !imageError && (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="w-full h-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
          unoptimized={true} // Временно отключаем оптимизацию для устранения 502 ошибок
          priority={size > 64} // Приоритет для больших аватаров
        />
      )}

      {/* Fallback изображение */}
      {imageError && fallbackSrc && (
        <Image
          src={fallbackSrc}
          alt={alt}
          width={size}
          height={size}
          className="w-full h-full object-cover"
          onError={() => console.log('❌ Fallback аватар также не загрузился')}
          unoptimized={true}
        />
      )}

      {/* Иконка пользователя как последний fallback */}
      {imageError && !fallbackSrc && (
        <User 
          className="text-gray-400" 
          size={size * 0.6} 
        />
      )}
    </div>
  );
}

// Готовые размеры
export const AvatarSizes = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
  '2xl': 128,
} as const;
