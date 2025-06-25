'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

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
 * Хук для работы с каталогом чатов
 * Поддерживает фильтрацию, пагинацию и поиск
 * Совместим с @telegram-apps/sdk-react v3.3.1
 */
export function useChats(filters: ChatsFilters = {}): UseChatsResult {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ChatsResponse['pagination'] | null>(null);
  const [stats, setStats] = useState<ChatsResponse['stats'] | null>(null);
  const [lastRequestId, setLastRequestId] = useState<string>();

  // Создаем URL с параметрами
  const buildUrl = useCallback((params: ChatsFilters) => {
    const searchParams = new URLSearchParams();
    
    if (params.type) searchParams.set('type', params.type);
    if (params.cityId) searchParams.set('cityId', params.cityId.toString());
    if (params.stateId) searchParams.set('stateId', params.stateId);
    if (params.topic) searchParams.set('topic', params.topic);
    if (params.search) searchParams.set('search', params.search);
    if (params.isVerified !== undefined) searchParams.set('isVerified', params.isVerified.toString());
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    return `/api/chats?${searchParams.toString()}`;
  }, []);

  // Загрузка данных - УБРАЛИ chats.length из зависимостей
  const fetchChats = useCallback(async (params: ChatsFilters, append = false) => {
    const hookRequestId = Math.random().toString(36).substring(7);
    const startTime = Date.now();
    
    console.log(`🎣 [HOOK-${hookRequestId}] useChats: Starting fetch...`);
    console.log(`📋 [HOOK-${hookRequestId}] Params:`, params);
    console.log(`➕ [HOOK-${hookRequestId}] Append mode: ${append}`);
    console.log(`⏰ [HOOK-${hookRequestId}] Current time: ${new Date().toISOString()}`);
    
    try {
      setLoading(true);
      setError(null);
      
      const url = buildUrl(params);
      console.log(`🌐 [HOOK-${hookRequestId}] Request URL: ${url}`);

      const fetchStartTime = Date.now();
      const response = await fetch(url);
      const fetchDuration = Date.now() - fetchStartTime;
      
      console.log(`📡 [HOOK-${hookRequestId}] Fetch completed in ${fetchDuration}ms`);
      console.log(`📊 [HOOK-${hookRequestId}] Response status: ${response.status} ${response.statusText}`);

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
      console.log(`⚡ [HOOK-${hookRequestId}] Server duration: ${data.debug?.duration}ms`);

      if (!data.success) {
        throw new Error('Ошибка получения данных чатов');
      }

      if (append) {
        // Добавляем к существующим чатам (для пагинации)
        console.log(`➕ [HOOK-${hookRequestId}] Appending ${data.data.length} chats`);
        setChats(prevChats => {
          const newChats = [...prevChats, ...data.data];
          console.log(`📊 [HOOK-${hookRequestId}] Total chats after append: ${newChats.length}`);
          return newChats;
        });
      } else {
        // Заменяем чаты (новый поиск/фильтр)
        console.log(`🔄 [HOOK-${hookRequestId}] Replacing chats with ${data.data.length} new chats`);
        setChats(data.data);
      }

      setPagination(data.pagination);
      setStats(data.stats);
      setLastRequestId(data.debug?.requestId);
      
      const totalDuration = Date.now() - startTime;
      console.log(`🎉 [HOOK-${hookRequestId}] useChats: Completed successfully in ${totalDuration}ms`);
      
    } catch (err) {
      const totalDuration = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при загрузке чатов';
      
      console.error(`❌ [HOOK-${hookRequestId}] useChats: Error after ${totalDuration}ms:`, err);
      console.error(`🚨 [HOOK-${hookRequestId}] Error message: ${errorMessage}`);
      
      setError(errorMessage);
    } finally {
      const finalDuration = Date.now() - startTime;
      console.log(`🏁 [HOOK-${hookRequestId}] useChats: Finally block - total ${finalDuration}ms`);
      setLoading(false);
    }
  }, [buildUrl]); // ✅ УБРАЛИ chats.length из зависимостей!

  // Стабилизируем фильтры через useMemo для предотвращения лишних рендеров
  const stableFilters = useMemo(() => filters, [
    filters.type,
    filters.cityId,
    filters.stateId,
    filters.topic,
    filters.search,
    filters.isVerified,
    filters.page,
    filters.limit,
    filters
  ]);

  // Основная загрузка при изменении фильтров
  useEffect(() => {
    const effectId = Math.random().toString(36).substring(7);
    console.log(`🔄 [EFFECT-${effectId}] useChats: Effect triggered`);
    console.log(`📋 [EFFECT-${effectId}] Current filters:`, stableFilters);
    
    fetchChats(stableFilters, false);
    
    // Cleanup function для отладки
    return () => {
      console.log(`🧹 [EFFECT-${effectId}] useChats: Effect cleanup`);
    };
  }, [fetchChats, stableFilters]); // ✅ ИСПРАВИЛИ зависимости!

  // Перезагрузка данных
  const refetch = useCallback(() => {
    const refetchId = Math.random().toString(36).substring(7);
    console.log(`🔄 [REFETCH-${refetchId}] useChats: Manual refetch triggered`);
    fetchChats(stableFilters, false);
  }, [fetchChats, stableFilters]);

  // Загрузка следующей страницы
  const loadMore = useCallback(() => {
    const loadMoreId = Math.random().toString(36).substring(7);
    console.log(`📄 [LOADMORE-${loadMoreId}] useChats: Load more triggered`);
    console.log(`📊 [LOADMORE-${loadMoreId}] Has next page: ${pagination?.hasNextPage}`);
    console.log(`⏳ [LOADMORE-${loadMoreId}] Currently loading: ${loading}`);
    
    if (pagination?.hasNextPage && !loading) {
      const nextPageFilters = {
        ...stableFilters,
        page: (pagination.page || 1) + 1
      };
      console.log(`📄 [LOADMORE-${loadMoreId}] Loading page ${nextPageFilters.page}`);
      fetchChats(nextPageFilters, true);
    } else {
      console.log(`⚠️ [LOADMORE-${loadMoreId}] Load more skipped - no next page or currently loading`);
    }
  }, [pagination, loading, stableFilters, fetchChats]);

  // Логируем изменения состояния
  useEffect(() => {
    console.log(`📊 [STATE] useChats: chats.length = ${chats.length}`);
  }, [chats.length]);

  useEffect(() => {
    console.log(`⏳ [STATE] useChats: loading = ${loading}`);
  }, [loading]);

  useEffect(() => {
    console.log(`❌ [STATE] useChats: error = ${error}`);
  }, [error]);

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
 * Хук для работы с отдельным чатом
 */
export function useChat(chatId: number) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChat = async () => {
      const hookRequestId = Math.random().toString(36).substring(7);
      console.log(`🎣 [CHAT-${hookRequestId}] useChat: Fetching chat ${chatId}`);
      
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/chats/${chatId}`);
        
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
        const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при загрузке чата';
        console.error(`❌ [CHAT-${hookRequestId}] Error loading chat ${chatId}:`, err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      fetchChat();
    }
  }, [chatId]);

  return { chat, loading, error };
}

/**
 * Хук для работы с избранными чатами
 */
export function useFavoriteChats() {
  const [favoriteChats, setFavoriteChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    const hookRequestId = Math.random().toString(36).substring(7);
    console.log(`🎣 [FAVORITES-${hookRequestId}] useFavoriteChats: Fetching favorites`);
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/favorites/chats');
      
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ [FAVORITES-${hookRequestId}] Favorites loaded: ${data?.length || 0} chats`);
      setFavoriteChats(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки избранных чатов';
      console.error(`❌ [FAVORITES-${hookRequestId}] Error:`, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Добавление в избранное
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

  // Удаление из избранного
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