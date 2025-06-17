'use client'

import { useFavorites } from '@/hooks/use-favorites'
import { FavoriteItem } from '@/hooks/use-favorites'
import { BusinessCard } from '@/components/businesses/BusinessCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { FavoriteButton } from './FavoriteButton'
import { Loader2, Heart, Trash2 } from 'lucide-react'
import { useClearFavorites } from '@/hooks/use-toggle-favorite'
import { useState } from 'react'

interface FavoritesListProps {
  showActions?: boolean
  limit?: number
  className?: string
}

export function FavoritesList({ 
  showActions = true, 
  limit,
  className = ''
}: FavoritesListProps) {
  const { data, isLoading, error, refetch } = useFavorites()
  const clearFavorites = useClearFavorites()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Загружаем избранное...</span>
        </div>
        
        {/* Skeleton loader */}
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className="animate-pulse bg-gray-200 h-32 rounded-lg"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-500 mb-4">
          <Heart className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Ошибка загрузки избранного</p>
          <p className="text-sm text-gray-600 mt-1">
            {error instanceof Error ? error.message : 'Неизвестная ошибка'}
          </p>
        </div>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  const favorites = data?.favorites || []
  const displayedFavorites = limit ? favorites.slice(0, limit) : favorites

  if (favorites.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          icon="❤️"
          title="Избранное пустое"
          description="Добавляйте понравившиеся заведения в избранное для быстрого доступа к ним"
          action={{
            label: "Найти заведения",
            href: "/tg"
          }}
        />
      </div>
    )
  }

  const handleClearFavorites = async () => {
    try {
      await clearFavorites.mutateAsync()
      setShowClearConfirm(false)
    } catch (error) {
      console.error('Error clearing favorites:', error)
    }
  }

  return (
    <div className={className}>
      {/* Header с действиями */}
      {showActions && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Избранное ({favorites.length})
          </h2>
          
          {favorites.length > 0 && (
            <div className="flex items-center gap-2">
              {!showClearConfirm ? (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Очистить все
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Точно очистить?</span>
                  <button
                    onClick={handleClearFavorites}
                    disabled={clearFavorites.isPending}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    {clearFavorites.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      'Да'
                    )}
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Нет
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Список избранных заведений */}
      <div className="space-y-3">
        {displayedFavorites.map((favorite: FavoriteItem) => (
          <div key={favorite.id} className="relative">
            <BusinessCard
              business={favorite.business}
              showFavoriteButton={true}
              isFavorite={true}
              showAddedDate={true}
              addedDate={favorite.addedAt}
            />
          </div>
        ))}
      </div>

      {/* Показать больше */}
      {limit && favorites.length > limit && (
        <div className="mt-4 text-center">
          <a 
            href="/tg/favorites"
            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Heart className="w-4 h-4" />
            Показать все ({favorites.length})
          </a>
        </div>
      )}
    </div>
  )
}

// Компонент для быстрого доступа к избранному (для главной страницы)
export function FavoritesPreview() {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Избранное</h3>
        <a 
          href="/tg/favorites"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Показать все
        </a>
      </div>
      
      <FavoritesList 
        showActions={false}
        limit={3}
        className="bg-white rounded-lg border border-gray-200 p-4"
      />
    </div>
  )
}
