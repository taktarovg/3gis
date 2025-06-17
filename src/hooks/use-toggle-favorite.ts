import { useMutation, useQueryClient } from '@tanstack/react-query'

export interface ToggleFavoriteResponse {
  success: boolean
  action: 'added' | 'removed'
  isFavorite: boolean
  message: string
  businessId: number
  favoriteId?: number
  error?: string
}

/**
 * Хук для добавления/удаления заведения из избранного с optimistic updates
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (businessId: number): Promise<ToggleFavoriteResponse> => {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ businessId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при обновлении избранного')
      }

      return await response.json()
    },

    // Optimistic Updates (React Query v5 синтаксис)
    onMutate: async (businessId) => {
      // Отменяем исходящие запросы для избранного
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
      await queryClient.cancelQueries({ queryKey: ['favorite-status', businessId] })

      // Сохраняем предыдущее состояние для rollback
      const previousFavorites = queryClient.getQueryData(['favorites'])
      const previousStatus = queryClient.getQueryData(['favorite-status', businessId])

      // Проверяем текущий статус избранного
      const currentFavorites = previousFavorites as any
      const isCurrentlyFavorite = currentFavorites?.favorites?.some(
        (fav: any) => fav.business.id === businessId
      ) || false

      // Оптимистично обновляем список избранного
      if (isCurrentlyFavorite) {
        // Удаляем из списка избранного
        queryClient.setQueryData(['favorites'], (old: any) => {
          if (!old?.favorites) return old
          
          return {
            ...old,
            favorites: old.favorites.filter((fav: any) => 
              fav.business.id !== businessId
            ),
            count: Math.max(0, (old.count || 0) - 1)
          }
        })
      }
      // Для добавления не делаем optimistic update списка, 
      // так как нам нужны полные данные с сервера

      // Обновляем статус избранного
      queryClient.setQueryData(['favorite-status', businessId], {
        success: true,
        isFavorite: !isCurrentlyFavorite,
        businessId,
        favoriteId: null,
        addedAt: isCurrentlyFavorite ? null : new Date().toISOString()
      })

      return { 
        previousFavorites, 
        previousStatus, 
        wasRemoving: isCurrentlyFavorite 
      }
    },

    onError: (error, businessId, context) => {
      console.error('Error toggling favorite:', error)
      
      // Откатываем изменения при ошибке
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites)
      }
      if (context?.previousStatus) {
        queryClient.setQueryData(['favorite-status', businessId], context.previousStatus)
      }

      // Показываем ошибку пользователю (можно интегрировать с toast системой)
      console.error('Ошибка при обновлении избранного:', error.message)
    },

    onSuccess: (data, businessId, context) => {
      // Обновляем статус избранного с актуальными данными
      queryClient.setQueryData(['favorite-status', businessId], {
        success: true,
        isFavorite: data.isFavorite,
        businessId: data.businessId,
        favoriteId: data.favoriteId || null,
        addedAt: data.action === 'added' ? new Date().toISOString() : null
      })

      // Если добавляли в избранное или произошла ошибка в optimistic update,
      // перезагружаем список избранного
      if (data.action === 'added' || !context?.wasRemoving) {
        queryClient.invalidateQueries({ queryKey: ['favorites'] })
      }
    },

    onSettled: (data, error, businessId) => {
      // В любом случае обновляем queries для консистентности
      queryClient.invalidateQueries({ queryKey: ['favorite-status', businessId] })
      
      // Обновляем список избранного если что-то пошло не так
      if (error) {
        queryClient.invalidateQueries({ queryKey: ['favorites'] })
      }
    }
  })
}

/**
 * Хук для очистки всего избранного пользователя
 */
export function useClearFavorites() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при очистке избранного')
      }

      return await response.json()
    },

    onSuccess: () => {
      // Очищаем все related queries
      queryClient.setQueryData(['favorites'], {
        success: true,
        favorites: [],
        count: 0
      })
      
      // Инвалидируем все статусы избранного
      queryClient.invalidateQueries({ 
        queryKey: ['favorite-status'],
        type: 'all'
      })
    },

    onError: (error) => {
      console.error('Error clearing favorites:', error)
      
      // Перезагружаем данные при ошибке
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    }
  })
}
