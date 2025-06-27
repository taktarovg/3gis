'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

interface Chat {
  id: number;
  title: string;
  description?: string;
  username?: string;
  type: 'GROUP' | 'CHAT' | 'CHANNEL';
  memberCount: number;
  topic?: string;
  isVerified: boolean;
  city?: { name: string };
  state?: { name: string };
  _count: { favorites: number };
}

interface ChatsResponse {
  success: boolean;
  data: Chat[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  stats: {
    totalChats: number;
    totalMembers: number;
  };
  debug?: {
    requestId: string;
    duration: number;
    dbDuration: number;
    timestamp: string;
  };
}

interface ChatsFilters {
  type?: 'GROUP' | 'CHAT' | 'CHANNEL';
  cityId?: number;
  stateId?: string;
  topic?: string;
  search?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
}

interface UseChatsResult {
  chats: Chat[];
  loading: boolean;
  error: string | null;
  pagination: ChatsResponse['pagination'] | null;
  stats: ChatsResponse['stats'] | null;
  refetch: () => void;
  loadMore: () => void;
  hasNextPage: boolean;
  lastRequestId?: string;
}

/**
 * ✅ ИСПРАВЛЕННЫЙ хук для работы с каталогом чатов
 * Устраняет циклическую зависимость и множественные запросы
 * Совместим с @telegram-apps/sdk-react v3.3.1
 */
export function useChats(filters: ChatsFilters = {}): UseChatsResult {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ChatsResponse['pagination'] | null>(null);
  const [stats, setStats] = useState<ChatsResponse['stats'] | null>(null);
  const [lastRequestId, setLastRequestId] = useState<string>();
  
  // ✅ Счетчик рендеров для отладки
  const renderCount = useRef(0);
  renderCount.current += 1;

  // ✅ Ref для отмены предыдущих запросов
  const abortControllerRef = useRef<AbortController | null>(null);

  // ✅ КРИТИЧНО: Правильная стабилизация фильтров
  // Каждое поле отдельно в зависимостях для точного контроля
  const stableFilters = useMemo(() => ({
    type: filters.type,
    cityId: filters.cityId,
    stateId: filters.stateId,
    topic: filters.topic,
    search: filters.search,
    isVerified: filters.isVerified,
    page: filters.page || 1,
    limit: filters.limit || 20
  }), [
    filters.type,
    filters.cityId,
    filters.stateId,
    filters.topic,
    filters.search,
    filters.isVerified,
    filters.page,
    filters.limit
  ]);

  // ✅ Основной эффект для загрузки данных
  // БЕЗ функций в зависимостях - только stableFilters!
  useEffect(() => {
    const hookRequestId = Math.random().toString(36).substring(7);
    console.log(`🎣 [HOOK-${hookRequestId}] useChats: Effect triggered (render ${renderCount.current})`);
    console.log(`📋 [HOOK-${hookRequestId}] Stable filters:`, stableFilters);

    // Отменяем предыдущий запрос если он еще выполняется
    if (abortControllerRef.current) {
      console.log(`🚫 [HOOK-${hookRequestId}] Aborting previous request`);
      abortControllerRef.current.abort();
    }

    // Создаем новый AbortController для текущего запроса
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchData = async () => {
      const startTime = Date.now();
      
      try {
        setLoading(true);
        setError(null);
        
        // Строим URL с параметрами
        const searchParams = new URLSearchParams();
        Object.entries(stableFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.set(key, value.toString());
          }
        });

        const url = `/api/chats?${searchParams.toString()}`;
        console.log(`🌐 [HOOK-${hookRequestId}] Request URL: ${url}`);

        const fetchStartTime = Date.now();
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const fetchDuration = Date.now() - fetchStartTime;
        
        console.log(`📡 [HOOK-${hookRequestId}] Fetch completed in ${fetchDuration}ms`);
        console.log(`📊 [HOOK-${hookRequestId}] Response status: ${response.status}`);

        if (!response.ok) {
          throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
        }

        const parseStartTime = Date.now();
        const data: ChatsResponse = await response.json();
        const parseDuration = Date.now() - parseStartTime;
        
        console.log(`📦 [HOOK-${hookRequestId}] JSON parsed in ${parseDuration}ms`);
        console.log(`✅ [HOOK-${hookRequestId}] Response success: ${data.success}`);
        console.log(`📊 [HOOK-${hookRequestId}] Chats count: ${data.data?.length || 0}`);
        console.log(`🔍 [HOOK-${hookRequestId}] Server requestId: ${data.debug?.requestId}`);

        if (!data.success) {
          throw new Error('Ошибка получения данных чатов');
        }

        // ✅ ВСЕГДА заменяем чаты (НЕ добавляем)
        // Пагинация будет обрабатываться отдельно
        console.log(`🔄 [HOOK-${hookRequestId}] Setting ${data.data.length} chats`);
        setChats(data.data);
        setPagination(data.pagination);
        setStats(data.stats);
        setLastRequestId(data.debug?.requestId);
        
        const totalDuration = Date.now() - startTime;
        console.log(`🎉 [HOOK-${hookRequestId}] Successfully completed in ${totalDuration}ms`);
        
      } catch (err) {
        // Игнорируем ошибки отмены запроса
        if (err instanceof Error && err.name === 'AbortError') {
          console.log(`🚫 [HOOK-${hookRequestId}] Request was aborted`);
          return;
        }
        
        const totalDuration = Date.now() - startTime;
        const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при загрузке чатов';
        
        console.error(`❌ [HOOK-${hookRequestId}] Error after ${totalDuration}ms:`, err);
        console.error(`🚨 [HOOK-${hookRequestId}] Error message: ${errorMessage}`);
        
        setError(errorMessage);
      } finally {
        const finalDuration = Date.now() - startTime;
        console.log(`🏁 [HOOK-${hookRequestId}] Finally block - total ${finalDuration}ms`);
        setLoading(false);
      }
    };

    fetchData();
    
    // ✅ Cleanup функция для отмены запроса
    return () => {
      console.log(`🧹 [HOOK-${hookRequestId}] Effect cleanup - aborting request`);
      controller.abort();
    };
  }, [stableFilters]); // ✅ ТОЛЬКО stableFilters в зависимостях!

  // ✅ Функция refetch БЕЗ зависимости от fetchData
  const refetch = useCallback(() => {
    const refetchId = Math.random().toString(36).substring(7);
    console.log(`🔄 [REFETCH-${refetchId}] Manual refetch triggered`);
    
    // Просто сбрасываем состояние, что вызовет повторный useEffect
    setChats([]);
    setLoading(true);
    setError(null);
    // useEffect сработает автоматически из-за изменения loading/error
  }, []);

  // ✅ Функция loadMore для пагинации
  const loadMore = useCallback(async () => {
    const loadMoreId = Math.random().toString(36).substring(7);
    console.log(`📄 [LOADMORE-${loadMoreId}] Load more triggered`);
    console.log(`📊 [LOADMORE-${loadMoreId}] Has next page: ${pagination?.hasNextPage}`);
    console.log(`⏳ [LOADMORE-${loadMoreId}] Currently loading: ${loading}`);
    
    if (!pagination?.hasNextPage || loading) {
      console.log(`⚠️ [LOADMORE-${loadMoreId}] Load more skipped - no next page or currently loading`);
      return;
    }

    try {
      setLoading(true);
      
      const nextPageFilters = {
        ...stableFilters,
        page: (pagination.page || 1) + 1
      };
      
      const searchParams = new URLSearchParams();
      Object.entries(nextPageFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, value.toString());
        }
      });

      const url = `/api/chats?${searchParams.toString()}`;
      console.log(`🌐 [LOADMORE-${loadMoreId}] Request URL: ${url}`);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }

      const data: ChatsResponse = await response.json();
      
      if (!data.success) {
        throw new Error('Ошибка получения данных чатов');
      }

      console.log(`➕ [LOADMORE-${loadMoreId}] Appending ${data.data.length} chats`);
      
      // ✅ Добавляем новые чаты к существующим
      setChats(prevChats => {
        const newChats = [...prevChats, ...data.data];
        console.log(`📊 [LOADMORE-${loadMoreId}] Total chats after append: ${newChats.length}`);
        return newChats;
      });
      
      setPagination(data.pagination);
      setStats(data.stats);
      setLastRequestId(data.debug?.requestId);
      
      console.log(`✅ [LOADMORE-${loadMoreId}] Load more completed successfully`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки следующей страницы';
      console.error(`❌ [LOADMORE-${loadMoreId}] Error:`, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pagination, loading, stableFilters]);

  // ✅ Логируем изменения состояния для отладки
  useEffect(() => {
    console.log(`📊 [STATE] useChats: chats.length = ${chats.length} (render ${renderCount.current})`);
  }, [chats.length]);

  useEffect(() => {
    console.log(`⏳ [STATE] useChats: loading = ${loading} (render ${renderCount.current})`);
  }, [loading]);

  useEffect(() => {
    if (error) {
      console.log(`❌ [STATE] useChats: error = ${error} (render ${renderCount.current})`);
    }
  }, [error]);

  // ✅ Cleanup при unmount компонента
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        console.log(`🧹 [CLEANUP] useChats: Component unmount - aborting active request`);
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    chats,
    loading,
    error,
    pagination,
    stats,
    refetch,
    loadMore,
    hasNextPage: pagination?.hasNextPage || false,
    lastRequestId
  };
}

/**
 * ✅ Хук для работы с отдельным чатом
 */
export function useChat(chatId: number) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId) {
      console.warn(`⚠️ [useChat] No chatId provided`);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    
    const fetchChat = async () => {
      const hookRequestId = Math.random().toString(36).substring(7);
      console.log(`🎣 [CHAT-${hookRequestId}] useChat: Fetching chat ${chatId}`);
      
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/chats/${chatId}`, {
          signal: controller.signal
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Чат не найден');
          }
          throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error('Ошибка получения данных чата');
        }

        console.log(`✅ [CHAT-${hookRequestId}] Chat ${chatId} loaded successfully`);
        setChat(data.data);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log(`🚫 [CHAT-${hookRequestId}] Request was aborted`);
          return;
        }
        
        const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при загрузке чата';
        console.error(`❌ [CHAT-${hookRequestId}] Error loading chat ${chatId}:`, err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
    
    return () => {
      console.log(`🧹 [useChat] Cleanup for chat ${chatId}`);
      controller.abort();
    };
  }, [chatId]);

  return { chat, loading, error };
}

/**
 * ✅ Хук для работы с избранными чатами
 */
export function useFavoriteChats() {
  const [favoriteChats, setFavoriteChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    const controller = new AbortController();
    const hookRequestId = Math.random().toString(36).substring(7);
    console.log(`🎣 [FAVORITES-${hookRequestId}] useFavoriteChats: Fetching favorites`);
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/favorites/chats', {
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ [FAVORITES-${hookRequestId}] Favorites loaded: ${data?.length || 0} chats`);
      setFavoriteChats(data || []);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log(`🚫 [FAVORITES-${hookRequestId}] Request was aborted`);
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки избранных чатов';
      console.error(`❌ [FAVORITES-${hookRequestId}] Error:`, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Добавление в избранное с оптимистическим обновлением
  const addToFavorites = useCallback(async (chatId: number) => {
    const actionId = Math.random().toString(36).substring(7);
    console.log(`➕ [FAVORITE-ADD-${actionId}] Adding chat ${chatId} to favorites`);
    
    try {
      const response = await fetch('/api/favorites/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId })
      });

      if (!response.ok) {
        throw new Error('Ошибка добавления в избранное');
      }

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ [FAVORITE-ADD-${actionId}] Chat ${chatId} added to favorites`);
        // Обновляем список избранных
        await fetchFavorites();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error(`❌ [FAVORITE-ADD-${actionId}] Error adding chat ${chatId}:`, err);
      return false;
    }
  }, [fetchFavorites]);

  // ✅ Удаление из избранного с оптимистическим обновлением
  const removeFromFavorites = useCallback(async (chatId: number) => {
    const actionId = Math.random().toString(36).substring(7);
    console.log(`➖ [FAVORITE-REMOVE-${actionId}] Removing chat ${chatId} from favorites`);
    
    try {
      const response = await fetch('/api/favorites/chats', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId })
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления из избранного');
      }

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ [FAVORITE-REMOVE-${actionId}] Chat ${chatId} removed from favorites`);
        // Обновляем список избранных
        await fetchFavorites();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error(`❌ [FAVORITE-REMOVE-${actionId}] Error removing chat ${chatId}:`, err);
      return false;
    }
  }, [fetchFavorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favoriteChats,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    refetch: fetchFavorites
  };
}