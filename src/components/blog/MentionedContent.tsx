'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Clock, ExternalLink, Users } from 'lucide-react';
import { trackBlogEvent } from '@/components/analytics/GoogleAnalytics';

interface Business {
  id: number;
  name: string;
  category: string;
  city: string;
  featuredImage?: string;
  phone?: string;
  isOpen?: boolean;
}

interface TelegramChat {
  id: number;
  title: string;
  description: string;
  memberCount: number;
  telegramLink: string;
}

interface MentionedBusinessesProps {
  businesses: Business[];
  postId: number;
}

interface MentionedChatsProps {
  chats: TelegramChat[];
  postId: number;
}

// Компонент для отображения упомянутых заведений
export function MentionedBusinesses({ businesses, postId }: MentionedBusinessesProps) {
  if (!businesses || businesses.length === 0) {
    return null;
  }

  const handleBusinessClick = (business: Business) => {
    trackBlogEvent.clickBusinessLink(postId, business.id, business.name);
  };

  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-blue-600" />
        Заведения из статьи
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {businesses.map((business) => (
          <BusinessCard 
            key={business.id} 
            business={business} 
            onBusinessClick={handleBusinessClick}
          />
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          💡 Найдите эти и другие русскоязычные заведения в{' '}
          <Link 
            href="https://t.me/ThreeGIS_bot/app" 
            target="_blank"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            приложении 3GIS
          </Link>
        </p>
      </div>
    </div>
  );
}

// Компонент для отображения упомянутых чатов
export function MentionedChats({ chats, postId }: MentionedChatsProps) {
  if (!chats || chats.length === 0) {
    return null;
  }

  const handleChatClick = (chat: TelegramChat) => {
    trackBlogEvent.clickChatLink(postId, chat.id, chat.title);
  };

  return (
    <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2 text-blue-600" />
        Telegram сообщества
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chats.map((chat) => (
          <ChatCard 
            key={chat.id} 
            chat={chat} 
            onChatClick={handleChatClick}
          />
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-blue-200">
        <p className="text-sm text-gray-600">
          📱 Присоединяйтесь к активным русскоязычным сообществам и находите единомышленников!
        </p>
      </div>
    </div>
  );
}

// Карточка заведения
function BusinessCard({ 
  business, 
  onBusinessClick 
}: { 
  business: Business; 
  onBusinessClick: (business: Business) => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        {/* Изображение заведения */}
        <div className="flex-shrink-0">
          {business.featuredImage && !imageError ? (
            <Image
              src={business.featuredImage}
              alt={business.name}
              width={60}
              height={60}
              className="rounded-lg object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-15 h-15 bg-gray-200 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Информация о заведении */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">
            {business.name}
          </h4>
          
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              {business.category}
            </span>
            <span className="ml-2">{business.city}</span>
          </div>

          {/* Дополнительная информация */}
          <div className="flex items-center justify-between mt-3">
            {business.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-1" />
                <span className="truncate">{business.phone}</span>
              </div>
            )}

            {business.isOpen !== undefined && (
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-1" />
                <span className={business.isOpen ? 'text-green-600' : 'text-red-600'}>
                  {business.isOpen ? 'Открыто' : 'Закрыто'}
                </span>
              </div>
            )}
          </div>

          {/* Кнопка действия */}
          <Link
            href={`https://t.me/ThreeGIS_bot/app?startapp=business_${business.id}`}
            target="_blank"
            onClick={() => onBusinessClick(business)}
            className="inline-flex items-center mt-3 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Открыть в 3GIS
          </Link>
        </div>
      </div>
    </div>
  );
}

// Карточка чата
function ChatCard({ 
  chat, 
  onChatClick 
}: { 
  chat: TelegramChat; 
  onChatClick: (chat: TelegramChat) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">
            {chat.title}
          </h4>
          
          {chat.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {chat.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-1" />
              <span>{chat.memberCount.toLocaleString()} участников</span>
            </div>

            <Link
              href={chat.telegramLink}
              target="_blank"
              onClick={() => onChatClick(chat)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Присоединиться
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент для отображения похожих статей
interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  readingTime: number;
  publishedAt: string;
  category: {
    name: string;
    color: string;
  };
  author: {
    name: string;
  };
}

interface RelatedPostsProps {
  posts: RelatedPost[];
  currentPostId: number;
}

export function RelatedPosts({ posts, currentPostId }: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  // Фильтруем текущую статью
  const filteredPosts = posts.filter(post => post.id !== currentPostId);

  if (filteredPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Похожие статьи
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.slice(0, 3).map((post) => (
          <RelatedPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

// Карточка похожей статьи
function RelatedPostCard({ post }: { post: RelatedPost }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link 
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Изображение */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {post.featuredImage && !imageError ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-blue-400" />
          </div>
        )}
        
        {/* Категория бейдж */}
        <div className="absolute top-3 left-3">
          <span 
            className="px-2 py-1 text-xs font-medium text-white rounded"
            style={{ backgroundColor: post.category.color }}
          >
            {post.category.name}
          </span>
        </div>
      </div>

      {/* Контент */}
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h4>
        
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Метаданные */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>{post.author.name}</span>
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3" />
            <span>{post.readingTime} мин</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Утилитарный компонент для CSS классов
const styles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Добавляем стили в head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}