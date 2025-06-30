'use client';

import { useState } from 'react';
import { ArrowLeft, Users, MapPin, Shield, ExternalLink, Heart, Share, Flag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ShareButton } from '@/components/share/ShareButton';

interface ChatDetailProps {
  chat: {
    id: number;
    title: string;
    description?: string;
    username?: string;
    type: 'GROUP' | 'CHAT' | 'CHANNEL';
    memberCount: number;
    topic?: string;
    isVerified: boolean;
    viewCount: number;
    joinCount: number;
    city?: { name: string };
    state?: { name: string };
    _count: { favorites: number };
  };
}

const TYPE_LABELS = {
  GROUP: 'Группа',
  CHAT: 'Чат',
  CHANNEL: 'Канал',
};

const TYPE_COLORS = {
  GROUP: 'bg-blue-100 text-blue-800',
  CHAT: 'bg-green-100 text-green-800',
  CHANNEL: 'bg-purple-100 text-purple-800',
};

export function ChatDetail({ chat }: ChatDetailProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);


  const handleJoin = async () => {
    setIsJoining(true);
    
    try {
      // Отправляем статистику
      await fetch(`/api/chats/${chat.id}/join`, { method: 'POST' });
      
      // Открываем Telegram
      if (chat.username) {
        window.open(`https://t.me/${chat.username}`, '_blank');
      } else {
        alert(`Для присоединения к "${chat.title}" откройте Telegram и найдите эту группу через поиск.`);
      }
    } catch (error) {
      console.error('Error joining chat:', error);
    } finally {
      setIsJoining(false);
    }
  };



  const handleFavorite = async () => {
    try {
      // TODO: Implement favorite functionality
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const formatMemberCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getAvatarColor = (title: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
    ];
    const index = title.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-gray-900 truncate">
              {chat.title}
            </h1>
            <p className="text-sm text-gray-600">
              {TYPE_LABELS[chat.type]}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Основная информация */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-start gap-4 mb-4">
            {/* Аватар */}
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0',
              getAvatarColor(chat.title)
            )}>
              {chat.title.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {chat.title}
                </h2>
                {chat.isVerified && (
                  <Shield className="w-5 h-5 text-green-500" />
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{formatMemberCount(chat.memberCount)} участников</span>
                </div>
                
                {(chat.city || chat.state) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {chat.city?.name}
                      {chat.city && chat.state && ', '}
                      {chat.state?.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className={cn('inline-block text-xs px-2 py-1 rounded-full font-medium', TYPE_COLORS[chat.type])}>
                  {TYPE_LABELS[chat.type]}
                </span>
                
                {chat.topic && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {chat.topic}
                  </span>
                )}
              </div>
            </div>
          </div>

          {chat.description && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 mb-2">📝 Описание:</h3>
              <p className="text-gray-700 leading-relaxed">
                {chat.description}
              </p>
            </div>
          )}

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {formatMemberCount(chat.memberCount)}
              </div>
              <div className="text-xs text-gray-600">Участников</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {chat.viewCount}
              </div>
              <div className="text-xs text-gray-600">Просмотров</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {chat.joinCount}
              </div>
              <div className="text-xs text-gray-600">Переходов</div>
            </div>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="bg-white rounded-xl p-6">
          <h3 className="font-medium text-gray-900 mb-3">ℹ️ Информация</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Тип:</span>
              <span className="font-medium">{TYPE_LABELS[chat.type]}</span>
            </div>
            
            {chat.username && (
              <div className="flex justify-between">
                <span className="text-gray-600">Username:</span>
                <span className="font-medium">@{chat.username}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Статус:</span>
              <span className="flex items-center gap-1">
                {chat.isVerified ? (
                  <>
                    <Shield className="w-3 h-3 text-green-500" />
                    <span className="text-green-600 font-medium">Проверено 3GIS</span>
                  </>
                ) : (
                  <span className="text-gray-600">Не проверено</span>
                )}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Языки:</span>
              <span className="font-medium">Русский, English</span>
            </div>

            {chat._count.favorites > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">В избранном:</span>
                <span className="font-medium">{chat._count.favorites} пользователей</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Фиксированные кнопки действий */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 safe-area-pb">
        <div className="flex gap-3">
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {isJoining ? 'Переход...' : 'Присоединиться'}
          </button>
          
          <ShareButton
            type="chat"
            entity={{
              id: chat.id,
              title: chat.title,
              slug: chat.id.toString(), // fallback to ID
              description: chat.description
            }}
            variant="icon"
            className="px-3 py-3 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          />
          
          <button
            onClick={handleFavorite}
            className={cn(
              'px-3 py-3 border rounded-lg transition-colors',
              isFavorited 
                ? 'border-red-300 bg-red-50 text-red-600' 
                : 'border-gray-300 hover:bg-gray-50'
            )}
          >
            <Heart className={cn('w-4 h-4', isFavorited && 'fill-current')} />
          </button>
          
          <button className="px-3 py-3 border border-gray-300 hover:bg-gray-50 text-red-600 hover:text-red-700 rounded-lg transition-colors">
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
