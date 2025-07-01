'use client'

import { useState, useEffect } from 'react';
import { ArrowLeft, Building2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { FavoritesList } from '@/components/favorites/FavoritesList';
import { ChatCard } from '@/components/chats/ChatCard';
import { useFavorites } from '@/hooks/use-favorites';

type TabType = 'businesses' | 'chats';

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('businesses');
  const [favoriteChats, setFavoriteChats] = useState<any[]>([]);
  const [chatCount, setChatCount] = useState(0);
  const [loadingChats, setLoadingChats] = useState(true);
  
  const { data: businessFavorites, isLoading: isLoadingBusinesses, error: businessError } = useFavorites();
  const businessCount = businessFavorites?.count || 0;
  
  // Debug логирование для отладки
  console.log('🎯 [FAVORITES] businessFavorites data:', businessFavorites);
  console.log('🎯 [FAVORITES] businessCount:', businessCount);

  // Загрузка избранных чатов
  useEffect(() => {
    const loadFavoriteChats = async () => {
      try {
        setLoadingChats(true);
        const response = await fetch('/api/favorites?type=chats');
        const data = await response.json();
        console.log('💬 [FAVORITES] Chat favorites response:', data);
        setFavoriteChats(data?.favorites || []);
        setChatCount(data?.count || 0);
      } catch (error) {
        console.error('Error loading favorite chats:', error);
        setFavoriteChats([]);
        setChatCount(0);
      } finally {
        setLoadingChats(false);
      }
    };

    if (activeTab === 'chats') {
      loadFavoriteChats();
    }
  }, [activeTab]);

  const handleJoinChat = async (chatId: number) => {
    try {
      // Отправляем статистику перехода
      await fetch(`/api/chats/${chatId}/join`, { method: 'POST' });
      
      // Находим чат в избранных (ищем в свойстве chat)
      const favoriteChat = favoriteChats.find(favorite => favorite.chat.id === chatId);
      if (favoriteChat && favoriteChat.chat) {
        const chat = favoriteChat.chat;
        if (chat.username) {
          window.open(`https://t.me/${chat.username}`, '_blank');
        } else {
          alert(`Для вступления в "${chat.title}" откройте Telegram и найдите эту группу через поиск.`);
        }
      }
    } catch (error) {
      console.error('Error tracking join:', error);
    }
  };

  const totalFavorites = businessCount + chatCount;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <Link 
            href="/tg"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              ❤️ Избранное
            </h1>
            {totalFavorites > 0 && (
              <p className="text-sm text-gray-500">
                {totalFavorites} {getPlural(totalFavorites, ['элемент', 'элемента', 'элементов'])}
              </p>
            )}
          </div>
        </div>

        {/* Табы */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('businesses')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'businesses'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Заведения ({businessCount})
          </button>
          
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'chats'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Чаты ({chatCount})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'businesses' ? (
          <div>
            {businessCount > 0 ? (
              <FavoritesList showActions={true} />
            ) : (
              <EmptyState
                icon={<Building2 className="w-12 h-12 text-gray-300" />}
                title="Нет избранных заведений"
                description="Добавляйте понравившиеся места в избранное, нажимая на сердечко"
                actionText="Найти заведения"
                actionHref="/tg"
              />
            )}
          </div>
        ) : (
          <div>
            {loadingChats ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
                ))}
              </div>
            ) : favoriteChats.length > 0 ? (
              <div className="space-y-4">
                {favoriteChats.map((favorite) => (
                  <ChatCard
                    key={favorite.id}
                    chat={favorite.chat}
                    onJoin={handleJoinChat}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<MessageSquare className="w-12 h-12 text-gray-300" />}
                title="Нет избранных чатов"
                description="Сохраняйте интересные сообщества в избранное для быстрого доступа"
                actionText="Найти чаты"
                actionHref="/tg/chats"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Компонент пустого состояния
function EmptyState({ 
  icon, 
  title, 
  description, 
  actionText, 
  actionHref 
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText: string;
  actionHref: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      <Link
        href={actionHref}
        className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
      >
        {actionText}
      </Link>
    </div>
  );
}

// Утилита для склонения слов
function getPlural(count: number, words: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  return words[(count % 100 > 4 && count % 100 < 20) 
    ? 2 
    : cases[Math.min(count % 10, 5)]
  ];
}
