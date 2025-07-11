'use client'

import { Heart, Loader2 } from 'lucide-react'
import { useToggleFavorite } from '@/hooks/use-toggle-favorite'
import { useFavoriteStatus } from '@/hooks/use-favorites'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'

interface FavoriteButtonProps {
  businessId: number
  initialIsFavorite?: boolean
  favoritesCount?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost' | 'overlay'
  showLabel?: boolean
  showCount?: boolean
  layout?: 'vertical' | 'horizontal' // Новый prop для контроля layout
  className?: string
}

export function FavoriteButton({ 
  businessId, 
  initialIsFavorite = false,
  favoritesCount = 0,
  size = 'md',
  variant = 'default',
  showLabel = false,
  showCount = false,
  layout = 'vertical',
  className = ''
}: FavoriteButtonProps) {
  const toggleFavorite = useToggleFavorite()
  
  // Получаем актуальный статус избранного
  const { data: favoriteStatus } = useFavoriteStatus(businessId)
  const isFavorite = favoriteStatus?.isFavorite ?? initialIsFavorite
  
  // Optimistic updates для счетчика
  const currentCount = toggleFavorite.isPending 
    ? (initialIsFavorite ? favoritesCount - 1 : favoritesCount + 1)
    : favoritesCount
  
  // Haptic feedback для Telegram
  const haptic = useHapticFeedback()

  const handleToggle = async () => {
    try {
      // Haptic feedback при нажатии
      haptic.buttonPress()
      
      await toggleFavorite.mutateAsync(businessId)
      
      // Haptic feedback при успехе
      haptic.notificationOccurred(isFavorite ? 'warning' : 'success')
    } catch (error) {
      // Haptic feedback при ошибке
      haptic.error()
      console.error('Error toggling favorite:', error)
    }
  }

  // Размеры компонента
  const sizeClasses = {
    sm: {
      button: 'w-8 h-8',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    md: {
      button: 'w-10 h-10',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    lg: {
      button: 'w-12 h-12',
      icon: 'w-5 h-5',
      text: 'text-base'
    }
  }

  // Варианты стилей
  const variantClasses = {
    default: isFavorite 
      ? 'text-red-500 bg-red-50 hover:bg-red-100 border-red-200' 
      : 'text-gray-400 bg-gray-50 hover:bg-gray-100 border-gray-200',
    outline: isFavorite
      ? 'text-red-500 border-red-300 bg-white hover:bg-red-50'
      : 'text-gray-400 border-gray-300 bg-white hover:bg-gray-50',
    ghost: isFavorite
      ? 'text-red-500 bg-transparent hover:bg-red-50'
      : 'text-gray-400 bg-transparent hover:bg-gray-50',
    overlay: isFavorite
      ? 'text-red-500 bg-black bg-opacity-50 hover:bg-opacity-70 border-transparent'
      : 'text-white bg-black bg-opacity-50 hover:bg-opacity-70 border-transparent'
  }

  const isLoading = toggleFavorite.isPending
  const currentSizeClass = sizeClasses[size]
  const currentVariantClass = variantClasses[variant]

  // Версия с лейблом
  if (showLabel) {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium
          transition-all duration-200 border
          ${currentVariantClass}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      >
        {isLoading ? (
          <Loader2 className={`${currentSizeClass.icon} animate-spin`} />
        ) : (
          <Heart 
            className={`${currentSizeClass.icon} ${isFavorite ? 'fill-current' : ''}`} 
          />
        )}
        {showLabel && (
          <span className={currentSizeClass.text}>
            {isLoading 
              ? 'Обновление...' 
              : isFavorite 
                ? 'В избранном' 
                : 'В избранное'
            }
          </span>
        )}
        
        {/* Счетчик для версии с лейблом */}
        {showCount && showLabel && (
          <span className={`${currentSizeClass.text} text-gray-500`}>
            ({currentCount})
          </span>
        )}
      </button>
    )
  }

  // Горизонтальный layout - счетчик справа
  if (layout === 'horizontal' && showCount) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`
            ${currentSizeClass.button}
            flex items-center justify-center rounded-full border
            transition-all duration-200
            ${currentVariantClass}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          {isLoading ? (
            <Loader2 className={`${currentSizeClass.icon} animate-spin`} />
          ) : (
            <Heart 
              className={`${currentSizeClass.icon} ${isFavorite ? 'fill-current' : ''}`} 
            />
          )}
        </button>
        
        {/* Счетчик справа */}
        <span className={`
          ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'} 
          ${variant === 'overlay' ? 'text-white bg-black bg-opacity-50 px-1 rounded' : 'text-gray-500'} 
          font-medium
        `}>
          {currentCount > 0 ? currentCount : 0}
        </span>
      </div>
    )
  }

  // Вертикальный layout - счетчик под кнопкой
  if (showCount) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`
            ${currentSizeClass.button}
            flex items-center justify-center rounded-full border
            transition-all duration-200
            ${currentVariantClass}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          {isLoading ? (
            <Loader2 className={`${currentSizeClass.icon} animate-spin`} />
          ) : (
            <Heart 
              className={`${currentSizeClass.icon} ${isFavorite ? 'fill-current' : ''}`} 
            />
          )}
        </button>
        
        {/* Счетчик под кнопкой */}
        <span className={`
          ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'} 
          text-gray-500 mt-1 font-medium
        `}>
          {currentCount > 0 ? currentCount : 0}
        </span>
      </div>
    )
  }

  // Обычная кнопка без счетчика
  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        ${currentSizeClass.button}
        flex items-center justify-center rounded-full border
        transition-all duration-200
        ${currentVariantClass}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
    >
      {isLoading ? (
        <Loader2 className={`${currentSizeClass.icon} animate-spin`} />
      ) : (
        <Heart 
          className={`${currentSizeClass.icon} ${isFavorite ? 'fill-current' : ''}`} 
        />
      )}
    </button>
  )
}
