'use client';

import Link from 'next/link';
import { MessageSquare, Users, MapPin, Shield, ExternalLink, Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

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
};

const TYPE_ICONS = {
  GROUP: '👥',
  CHAT: '💬',
  CHANNEL: '📢',
};

export function ChatCard({ chat, onJoin }: ChatCardProps) {
  const typeIcon = TYPE_ICONS[chat.type];
  const typeLabel = TYPE_LABELS[chat.type];

  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onJoin?.(chat.id);
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

  return (
    <Link href={`/tg/chats/${chat.id}`} className="block">
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all hover:border-blue-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
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
                <span>{formatMemberCount(chat.memberCount)} участников</span>
              </div>
              
              {(chat.city || chat.state) && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">
                    {chat.city?.name}
                    {chat.city && chat.state && ', '}
                    {chat.state?.name}
                  </span>
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

          <div className="flex items-center gap-2">
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
}
