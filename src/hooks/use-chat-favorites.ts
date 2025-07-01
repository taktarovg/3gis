import { useQuery } from '@tanstack/react-query'

export interface ChatFavoriteItem {
  id: number
  addedAt: string
  chat: {
    id: number
    title: string
    description?: string
    username?: string
    type: 'GROUP' | 'CHAT' | 'CHANNEL'
    memberCount: number
    topic?: string
    isVerified: boolean
    viewCount: number
    joinCount: number
    isFavorite: boolean
    favoriteCount: number
    city?: {
      id: number
      name: string
    }
    state?: {
      id: string
      name: string
    }
    _count: {
      favorites: number
    }
  }
}

export interface ChatFavoritesResponse {
  success: boolean
  favorites: ChatFavoriteItem[]
  count: number
}

/**
 * Хук для получения списка избранных чатов пользователя
 */
export function useChatFavorites() {
  return useQuery({
    queryKey: ['chat-favorites'],
    queryFn: async (): Promise<ChatFavoritesResponse> => {
      const response = await fetch('/api/favorites/chats', {
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
        throw new Error('Ошибка загрузки избранных чатов')
      }

      const data = await response.json()
      
      // Адаптируем формат данных из API к ожидаемому формату
      return {
        success: true,
        favorites: data.map((chat: any) => ({
          id: chat.id, // это ID записи в chat_favorites
          addedAt: chat.createdAt || new Date().toISOString(),
          chat: {
            ...chat,
            isFavorite: true,
            favoriteCount: chat._count?.favorites || 0
          }
        })),
        count: data.length
      }
    },
    staleTime: 5 * 60 * 1000,      // 5 минут fresh data
    gcTime: 10 * 60 * 1000,        // 10 минут в cache
    retry: 3,                       // 3 попытки при ошибке
    refetchOnWindowFocus: false,    // Не перезагружать при фокусе окна
    refetchOnMount: 'always',       // Всегда обновлять при монтировании
  })
}

/**
 * Хук для проверки статуса избранного конкретного чата
 */
export function useChatFavoriteStatus(chatId: number | undefined) {
  return useQuery({
    queryKey: ['chat-favorite-status', chatId],
    queryFn: async () => {
      if (!chatId) return { isFavorite: false }
      
      const response = await fetch(`/api/favorites/chats/toggle?chatId=${chatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Ошибка проверки статуса избранного чата')
      }

      return await response.json()
    },
    enabled: !!chatId, // Выполнять только если chatId определен
    staleTime: 2 * 60 * 1000, // 2 минуты для статуса
    gcTime: 5 * 60 * 1000,    // 5 минут в cache
  })
}

/**
 * Утилита для получения количества избранных чатов из кэша
 */
export function useChatFavoritesCount() {
  const { data } = useChatFavorites()
  return data?.count || 0
}

/**
 * Утилита для проверки, является ли чат избранным (из кэша)
 */
export function useIsChatFavorite(chatId: number) {
  const { data } = useChatFavorites()
  return data?.favorites.some(fav => fav.chat.id === chatId) || false
}
