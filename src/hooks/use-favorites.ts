import { useQuery } from '@tanstack/react-query'

export interface FavoriteItem {
  id: number
  addedAt: string
  business: {
    id: number
    name: string
    nameEn?: string
    description?: string
    address: string
    phone?: string
    website?: string
    rating: number
    reviewCount: number
    latitude?: number
    longitude?: number
    languages: string[]
    hasParking: boolean
    premiumTier: string
    isFavorite: boolean
    favoriteCount: number
    distance?: number
    category: {
      id: number
      name: string
      nameEn: string
      slug: string
      icon: string
    }
    city: {
      id: number
      name: string
      state: string
    }
    photos: Array<{
      id: number
      url: string
      caption?: string
    }>
    _count: {
      reviews: number
      favorites: number
    }
  }
}

export interface FavoritesResponse {
  success: boolean
  favorites: FavoriteItem[]
  count: number
}

/**
 * Хук для получения списка избранных заведений пользователя
 */
export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async (): Promise<FavoritesResponse> => {
      const response = await fetch('/api/favorites', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Для передачи cookies с токеном
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Требуется авторизация')
        }
        throw new Error('Ошибка загрузки избранного')
      }

      return await response.json()
    },
    staleTime: 5 * 60 * 1000,      // 5 минут fresh data
    gcTime: 10 * 60 * 1000,        // 10 минут в cache (новое название cacheTime в v5)
    retry: 3,                       // 3 попытки при ошибке
    refetchOnWindowFocus: false,    // Не перезагружать при фокусе окна
    refetchOnMount: 'always',       // Всегда обновлять при монтировании
  })
}

/**
 * Хук для проверки статуса избранного конкретного заведения
 */
export function useFavoriteStatus(businessId: number | undefined) {
  return useQuery({
    queryKey: ['favorite-status', businessId],
    queryFn: async () => {
      if (!businessId) return { isFavorite: false }
      
      const response = await fetch(`/api/favorites/toggle?businessId=${businessId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Ошибка проверки статуса избранного')
      }

      return await response.json()
    },
    enabled: !!businessId, // Выполнять только если businessId определен
    staleTime: 2 * 60 * 1000, // 2 минуты для статуса
    gcTime: 5 * 60 * 1000,    // 5 минут в cache
  })
}

/**
 * Утилита для получения количества избранных из кэша
 */
export function useFavoritesCount() {
  const { data } = useFavorites()
  return data?.count || 0
}

/**
 * Утилита для проверки, является ли заведение избранным (из кэша)
 */
export function useIsFavorite(businessId: number) {
  const { data } = useFavorites()
  return data?.favorites.some(fav => fav.business.id === businessId) || false
}
