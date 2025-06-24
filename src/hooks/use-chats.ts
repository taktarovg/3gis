'use client';

import { useState, useEffect, useCallback } from 'react';

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

  // Загрузка данных
  const fetchChats = useCallback(async (params: ChatsFilters, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const url = buildUrl(params);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }

      const data: ChatsResponse = await response.json();

      if (!data.success) {
        throw new Error('Ошибка получения данных чатов');
      }

      if (append) {
        // Добавляем к существующим чатам (для пагинации)
        setChats(prevChats => [...prevChats, ...data.data]);
      } else {
        // Заменяем чаты (новый поиск/фильтр)
        setChats(data.data);
      }

      setPagination(data.pagination);
      setStats(data.stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при загрузке чатов';
      setError(errorMessage);
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  // Основная загрузка при изменении фильтров
  useEffect(() => {
    fetchChats(filters, false);
  }, [fetchChats, filters]);

  // Перезагрузка данных
  const refetch = useCallback(() => {
    fetchChats(filters, false);
  }, [fetchChats, filters]);

  // Загрузка следующей страницы
  const loadMore = useCallback(() => {
    if (pagination?.hasNextPage && !loading) {
      const nextPageFilters = {
        ...filters,
        page: (pagination.page || 1) + 1
      };
      fetchChats(nextPageFilters, true);
    }
  }, [pagination, loading, filters, fetchChats]);

  return {
    chats,
    loading,
    error,
    pagination,
    stats,
    refetch,
    loadMore,
    hasNextPage: pagination?.hasNextPage || false
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

        setChat(data.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при загрузке чата';
        setError(errorMessage);
        console.error('Error fetching chat:', err);
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
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/favorites/chats');
      
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setFavoriteChats(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки избранных чатов';
      setError(errorMessage);
      console.error('Error fetching favorite chats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Добавление в избранное
  const addToFavorites = useCallback(async (chatId: number) => {
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
        // Обновляем список избранных
        await fetchFavorites();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error adding to favorites:', err);
      return false;
    }
  }, [fetchFavorites]);

  // Удаление из избранного
  const removeFromFavorites = useCallback(async (chatId: number) => {
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
        // Обновляем список избранных
        await fetchFavorites();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error removing from favorites:', err);
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
