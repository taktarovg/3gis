'use client'

import { Heart, Loader2 } from 'lucide-react'
import { useToggleFavorite } from '@/hooks/use-toggle-favorite'
import { useFavoriteStatus } from '@/hooks/use-favorites'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'

interface FavoriteButtonProps {
  businessId: number
  initialIsFavorite?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  showLabel?: boolean
  className?: string
}

export function FavoriteButton({ 
  businessId, 
  initialIsFavorite = false,
  size = 'md',
  variant = 'default',
  showLabel = false,
  className = ''
}: FavoriteButtonProps) {
  const toggleFavorite = useToggleFavorite()
  
  // Получаем актуальный статус избранного
  const { data: favoriteStatus } = useFavoriteStatus(businessId)
  const isFavorite = favoriteStatus?.isFavorite ?? initialIsFavorite
  
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
      : 'text-gray-400 bg-transparent hover:bg-gray-50'
  }

  const isLoading = toggleFavorite.isPending
  const currentSizeClass = sizeClasses[size]
  const currentVariantClass = variantClasses[variant]

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
      </button>
    )
  }

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
