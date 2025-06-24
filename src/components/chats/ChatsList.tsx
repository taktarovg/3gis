'use client';

import { useState } from 'react';
import { ChatCard } from './ChatCard';
import { ChatTypeSelector } from './ChatTypeSelector';
import { LocationSelectors } from './LocationSelectors';
import { Search, AlertCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useChats } from '@/hooks/use-chats';

export function ChatsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'GROUP' | 'CHAT' | 'CHANNEL'>();
  const [selectedStateId, setSelectedStateId] = useState<string>();
  const [selectedCityId, setSelectedCityId] = useState<number>();

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Используем хук для получения чатов
  const {
    chats,
    loading,
    error,
    pagination,
    stats,
    refetch,
    loadMore,
    hasNextPage
  } = useChats({
    type: selectedType,
    stateId: selectedStateId,
    cityId: selectedCityId,
    search: debouncedSearch,
    limit: 20
  });

  const handleJoinChat = async (chatId: number) => {
    try {
      // Отправляем статистику перехода
      await fetch(`/api/chats/${chatId}/join`, { method: 'POST' });
      
      // Находим чат и открываем ссылку
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        if (chat.username) {
          // Открываем Telegram ссылку
          window.open(`https://t.me/${chat.username}`, '_blank');
        } else {
          // Показываем инструкцию
          alert(`Для вступления в "${chat.title}" откройте Telegram и найдите эту группу через поиск.`);
        }
      }
    } catch (error) {
      console.error('Error tracking join:', error);
      // Не показываем ошибку пользователю, так как статистика не критична
    }
  };

  const getResultText = () => {
    if (!pagination || pagination.totalCount === 0) return '';
    
    const typeText = selectedType === 'GROUP' ? 'групп' :
                    selectedType === 'CHAT' ? 'чатов' :
                    selectedType === 'CHANNEL' ? 'каналов' :
                    'сообществ';
    
    let locationText = '';
    if (selectedCityId && selectedStateId) {
      locationText = ' в выбранном городе';
    } else if (selectedStateId) {
      locationText = ' в выбранном штате';
    }
    
    const searchText = debouncedSearch ? ` по запросу "${debouncedSearch}"` : '';
    
    return `Найдено: ${pagination.totalCount} ${typeText}${locationText}${searchText}`;
  };

  // Подсчет чатов по типам для селектора
  const getCounts = (): Record<string, number> => {
    if (!stats) return { GROUP: 0, CHAT: 0, CHANNEL: 0 };
    
    // Простая логика - показываем общее количество для всех типов
    // В реальном приложении можно сделать отдельный запрос для подсчета по типам
    return {
      GROUP: stats.totalChats || 0,
      CHAT: 0,
      CHANNEL: 0
    };
  };

  // Компонент ошибки
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Ошибка загрузки
        </h3>
        <p className="text-gray-600 mb-4 max-w-md">
          {error}
        </p>
        <button
          onClick={refetch}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск групп, чатов, каналов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
        />
      </div>

      {/* Фильтры локации */}
      <LocationSelectors
        selectedStateId={selectedStateId}
        selectedCityId={selectedCityId}
        onStateChange={setSelectedStateId}
        onCityChange={setSelectedCityId}
      />

      {/* Селектор типов */}
      <ChatTypeSelector
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        counts={getCounts()}
      />

      {/* Статистика результатов */}
      {!loading && (
        <div className="flex items-center justify-between text-sm text-gray-600 py-2">
          <span>{getResultText()}</span>
          {pagination && pagination.totalCount > 0 && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              Стр. {pagination.page} из {pagination.totalPages}
            </span>
          )}
        </div>
      )}

      {/* Список чатов */}
      {loading && chats.length === 0 ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      ) : chats.length > 0 ? (
        <div className="space-y-4">
          {chats.map((chat) => (
            <ChatCard
              key={chat.id}
              chat={chat}
              onJoin={handleJoinChat}
            />
          ))}
          
          {/* Кнопка "Загрузить еще" */}
          {hasNextPage && (
            <div className="text-center py-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Загрузка...' : 'Загрузить еще'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ничего не найдено
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {debouncedSearch 
              ? 'Попробуйте изменить поисковый запрос или настройки фильтров'
              : 'Попробуйте изменить фильтры для поиска сообществ'
            }
          </p>
          {(selectedType || selectedStateId || selectedCityId || debouncedSearch) && (
            <button
              onClick={() => {
                setSelectedType(undefined);
                setSelectedStateId(undefined);
                setSelectedCityId(undefined);
                setSearchQuery('');
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Сбросить все фильтры
            </button>
          )}
        </div>
      )}
    </div>
  );
}
