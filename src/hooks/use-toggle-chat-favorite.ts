import { useMutation, useQueryClient } from '@tanstack/react-query'

export interface ToggleChatFavoriteResponse {
  success: boolean
  action: 'added' | 'removed'
  isFavorite: boolean
  message: string
  chatId: number
  favoriteId?: number
  error?: string
}

/**
 * Хук для добавления/удаления чата из избранного с optimistic updates
 */
export function useToggleChatFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (chatId: number): Promise<ToggleChatFavoriteResponse> => {
      const response = await fetch('/api/favorites/chats/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ chatId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при обновлении избранного чата')
      }

      return await response.json()
    },

    // Optimistic Updates (React Query v5 синтаксис)
    onMutate: async (chatId) => {
      // Отменяем исходящие запросы для избранного
      await queryClient.cancelQueries({ queryKey: ['chat-favorites'] })
      await queryClient.cancelQueries({ queryKey: ['chat-favorite-status', chatId] })

      // Сохраняем предыдущее состояние для rollback
      const previousFavorites = queryClient.getQueryData(['chat-favorites'])
      const previousStatus = queryClient.getQueryData(['chat-favorite-status', chatId])

      // Проверяем текущий статус избранного
      const currentFavorites = previousFavorites as any
      const isCurrentlyFavorite = currentFavorites?.favorites?.some(
        (fav: any) => fav.chat.id === chatId
      ) || false

      // Оптимистично обновляем список избранного
      if (isCurrentlyFavorite) {
        // Удаляем из списка избранного
        queryClient.setQueryData(['chat-favorites'], (old: any) => {
          if (!old?.favorites) return old
          
          return {
            ...old,
            favorites: old.favorites.filter((fav: any) => 
              fav.chat.id !== chatId
            ),
            count: Math.max(0, (old.count || 0) - 1)
          }
        })
      }
      // Для добавления не делаем optimistic update списка, 
      // так как нам нужны полные данные с сервера

      // Обновляем статус избранного
      queryClient.setQueryData(['chat-favorite-status', chatId], {
        success: true,
        isFavorite: !isCurrentlyFavorite,
        chatId,
        favoriteId: null,
        addedAt: isCurrentlyFavorite ? null : new Date().toISOString()
      })

      return { 
        previousFavorites, 
        previousStatus, 
        wasRemoving: isCurrentlyFavorite 
      }
    },

    onError: (error, chatId, context) => {
      console.error('Error toggling chat favorite:', error)
      
      // Откатываем изменения при ошибке
      if (context?.previousFavorites) {
        queryClient.setQueryData(['chat-favorites'], context.previousFavorites)
      }
      if (context?.previousStatus) {
        queryClient.setQueryData(['chat-favorite-status', chatId], context.previousStatus)
      }

      // Показываем ошибку пользователю (можно интегрировать с toast системой)
      console.error('Ошибка при обновлении избранного чата:', error.message)
    },

    onSuccess: (data, chatId, context) => {
      // Обновляем статус избранного с актуальными данными
      queryClient.setQueryData(['chat-favorite-status', chatId], {
        success: true,
        isFavorite: data.isFavorite,
        chatId: data.chatId,
        favoriteId: data.favoriteId || null,
        addedAt: data.action === 'added' ? new Date().toISOString() : null
      })

      // Если добавляли в избранное или произошла ошибка в optimistic update,
      // перезагружаем список избранного
      if (data.action === 'added' || !context?.wasRemoving) {
        queryClient.invalidateQueries({ queryKey: ['chat-favorites'] })
      }
    },

    onSettled: (data, error, chatId) => {
      // В любом случае обновляем queries для консистентности
      queryClient.invalidateQueries({ queryKey: ['chat-favorite-status', chatId] })
      
      // Обновляем список избранного если что-то пошло не так
      if (error) {
        queryClient.invalidateQueries({ queryKey: ['chat-favorites'] })
      }
    }
  })
}

/**
 * Хук для очистки всех избранных чатов пользователя
 */
export function useClearChatFavorites() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/favorites/chats', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при очистке избранных чатов')
      }

      return await response.json()
    },

    onSuccess: () => {
      // Очищаем все related queries
      queryClient.setQueryData(['chat-favorites'], {
        success: true,
        favorites: [],
        count: 0
      })
      
      // Инвалидируем все статусы избранного
      queryClient.invalidateQueries({ 
        queryKey: ['chat-favorite-status'],
        type: 'all'
      })
    },

    onError: (error) => {
      console.error('Error clearing chat favorites:', error)
      
      // Перезагружаем данные при ошибке
      queryClient.invalidateQueries({ queryKey: ['chat-favorites'] })
    }
  })
}
