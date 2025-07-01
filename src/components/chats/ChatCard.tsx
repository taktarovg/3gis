'use client';

import { memo } from 'react';
import Link from 'next/link';
import { MessageSquare, Users, MapPin, Shield, ExternalLink, Heart, Star, Share2 } from 'lucide-react';
import { ChatFavoriteButton } from '@/components/favorites/ChatFavoriteButton';
import { ShareButton } from '@/components/share/ShareButton';

interface ChatCardProps {
  chat: {
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
  };
  onJoin?: (chatId: number) => void;
}

const TYPE_LABELS = {
  GROUP: 'Группа',
  CHAT: 'Чат',
  CHANNEL: 'Канал',
} as const;

const TYPE_ICONS = {
  GROUP: '👥',
  CHAT: '💬',
  CHANNEL: '📢',
} as const;

// ✅ Мемоизируем компонент для предотвращения лишних рендеров
const ChatCard = memo<ChatCardProps>(({ chat, onJoin }) => {
  const typeIcon = TYPE_ICONS[chat.type];
  const typeLabel = TYPE_LABELS[chat.type];

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onJoin?.(chat.id);
  };

  // ✅ Обработчики для кнопок действий (останавливаем всплытие)
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // ✅ Мемоизируем форматирование количества участников
  const memberCountFormatted = (() => {
    if (chat.memberCount >= 1000000) {
      return `${(chat.memberCount / 1000000).toFixed(1)}M`;
    }
    if (chat.memberCount >= 1000) {
      return `${(chat.memberCount / 1000).toFixed(1)}K`;
    }
    return chat.memberCount.toString();
  })();

  // ✅ Мемоизируем строку локации
  const locationText = (() => {
    if (chat.city && chat.state) {
      return `${chat.city.name}, ${chat.state.name}`;
    }
    if (chat.city) {
      return chat.city.name;
    }
    if (chat.state) {
      return chat.state.name;
    }
    return null;
  })();

  return (
    <Link href={`/tg/chats/${chat.id}`} className="block">
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all hover:border-blue-200 relative">
        
        {/* ✅ НОВОЕ: Кнопки действий в правом верхнем углу */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <div onClick={handleFavoriteClick}>
            <ChatFavoriteButton
              chatId={chat.id}
              favoritesCount={chat._count.favorites}
              size="sm"
              variant="overlay"
              showCount={false}
              className="shadow-sm"
            />
          </div>
          
          <div onClick={handleShareClick}>
            <ShareButton
              type="chat"
              entity={{
                id: chat.id,
                title: chat.title,
                slug: chat.id.toString(),
                description: chat.description
              }}
              variant="icon"
              className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-20"> {/* ✅ Добавили правый отступ для кнопок */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{typeIcon}</span>
              <h3 className="font-semibold text-gray-900 truncate">
                {chat.title}
              </h3>
              {chat.isVerified && (
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600 ml-1">Проверен</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{memberCountFormatted} участников</span>
              </div>
              
              {locationText && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{locationText}</span>
                </div>
              )}
            </div>

            {chat.topic && (
              <div className="mb-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  #{chat.topic}
                </span>
              </div>
            )}

            {chat.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {chat.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded-full">
              {typeLabel}
            </span>
            {chat._count.favorites > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                <span>{chat._count.favorites}</span>
              </div>
            )}
          </div>

          {/* ✅ ОБНОВЛЕНО: Кнопки действий теперь включают избранное и шеринг */}
          <div className="flex items-center gap-2">
            {/* Кнопка избранного (маленькая версия для десктопа) */}
            <div onClick={handleFavoriteClick} className="hidden sm:block">
              <ChatFavoriteButton
                chatId={chat.id}
                favoritesCount={chat._count.favorites}
                size="sm"
                variant="ghost"
                showCount={false}
              />
            </div>

            {/* Кнопка шеринга (маленькая версия для десктопа) */}
            <div onClick={handleShareClick} className="hidden sm:block">
              <ShareButton
                type="chat"
                entity={{
                  id: chat.id,
                  title: chat.title,
                  slug: chat.id.toString(),
                  description: chat.description
                }}
                variant="icon"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              />
            </div>

            {/* Кнопка присоединения */}
            <button
              onClick={handleJoinClick}
              className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Присоединиться
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
});

// ✅ Добавляем displayName для отладки
ChatCard.displayName = 'ChatCard';

export { ChatCard };
