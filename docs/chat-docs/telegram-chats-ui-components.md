# 🎨 UI компоненты для каталога Telegram-чатов

## 1. Селектор типов чатов

### `src/components/chats/ChatTypeSelector.tsx`:

```typescript
'use client';

import { cn } from '@/lib/utils';

type ChatType = 'GROUP' | 'CHAT' | 'CHANNEL';

interface ChatTypeSelectorProps {
  selectedType?: ChatType;
  onTypeChange: (type?: ChatType) => void;
  counts?: Record<string, number>;
}

const CHAT_TYPES = [
  { key: 'GROUP' as ChatType, label: 'Группы' },
  { key: 'CHAT' as ChatType, label: 'Чаты' },
  { key: 'CHANNEL' as ChatType, label: 'Каналы' },
];

export function ChatTypeSelector({ 
  selectedType, 
  onTypeChange, 
  counts = {} 
}: ChatTypeSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {CHAT_TYPES.map((type) => {
        const count = counts[type.key] || 0;
        const isSelected = selectedType === type.key;
        
        return (
          <button
            key={type.key}
            onClick={() => onTypeChange(isSelected ? undefined : type.key)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
              isSelected
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {type.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
```

## 2. Каскадные селекторы локации

### `src/components/chats/LocationSelectors.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface State {
  id: string;
  name: string;
}

interface City {
  id: number;
  name: string;
  stateId: string;
}

interface LocationSelectorsProps {
  selectedStateId?: string;
  selectedCityId?: number;
  onStateChange: (stateId?: string) => void;
  onCityChange: (cityId?: number) => void;
}

export function LocationSelectors({
  selectedStateId,
  selectedCityId,
  onStateChange,
  onCityChange,
}: LocationSelectorsProps) {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Загрузка штатов
  useEffect(() => {
    fetch('/api/states')
      .then(res => res.json())
      .then(setStates)
      .catch(console.error);
  }, []);

  // Загрузка городов при выборе штата
  useEffect(() => {
    if (selectedStateId) {
      setLoadingCities(true);
      fetch(`/api/cities?stateId=${selectedStateId}`)
        .then(res => res.json())
        .then(data => {
          setCities(data.cities || []);
          setLoadingCities(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingCities(false);
        });
    } else {
      setCities([]);
      onCityChange(undefined);
    }
  }, [selectedStateId, onCityChange]);

  return (
    <div className="flex gap-3">
      <div className="flex-1">
        <Select
          value={selectedStateId || 'all'}
          onValueChange={(value) => onStateChange(value === 'all' ? undefined : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Штат" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все штаты</SelectItem>
            {states.map((state) => (
              <SelectItem key={state.id} value={state.id}>
                {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Select
          value={selectedCityId?.toString() || 'all'}
          onValueChange={(value) => onCityChange(value === 'all' ? undefined : parseInt(value))}
          disabled={!selectedStateId || loadingCities}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingCities ? "Загрузка..." : "Город"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все города</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id.toString()}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
```

## 3. Карточка чата

### `src/components/chats/ChatCard.tsx`:

```typescript
import Link from 'next/link';
import { MessageSquare, Users, MapPin, Shield, ExternalLink, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatCardProps {
  chat: {
    id: number;
    title: string;
    description?: string;
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
  GROUP: MessageSquare,
  CHAT: MessageSquare,
  CHANNEL: MessageSquare,
};

export function ChatCard({ chat, onJoin }: ChatCardProps) {
  const TypeIcon = TYPE_ICONS[chat.type];
  const typeLabel = TYPE_LABELS[chat.type];

  const handleJoinClick = () => {
    onJoin?.(chat.id);
  };

  const formatMemberCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <TypeIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <h3 className="font-semibold text-gray-900 truncate">
              {chat.title}
            </h3>
            {chat.isVerified && (
              <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
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
                <span>
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
                {chat.topic}
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
          <span>{typeLabel}</span>
          {chat._count.favorites > 0 && (
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{chat._count.favorites}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/tg/chats/${chat.id}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Подробнее
          </Link>
          
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
  );
}
```

## 4. Основной компонент списка чатов

### `src/components/chats/ChatsList.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { ChatCard } from './ChatCard';
import { ChatTypeSelector } from './ChatTypeSelector';
import { LocationSelectors } from './LocationSelectors';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface Chat {
  id: number;
  title: string;
  description?: string;
  type: 'GROUP' | 'CHAT' | 'CHANNEL';
  memberCount: number;
  topic?: string;
  isVerified: boolean;
  city?: { name: string };
  state?: { name: string };
  _count: { favorites: number };
}

interface ChatsResponse {
  chats: Chat[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
  counts: Record<string, number>;
}

export function ChatsList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'GROUP' | 'CHAT' | 'CHANNEL'>();
  const [selectedStateId, setSelectedStateId] = useState<string>();
  const [selectedCityId, setSelectedCityId] = useState<number>();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0 });

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Загрузка чатов
  useEffect(() => {
    const loadChats = async () => {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (selectedType) params.set('type', selectedType);
      if (selectedStateId) params.set('stateId', selectedStateId);
      if (selectedCityId) params.set('cityId', selectedCityId.toString());
      if (debouncedSearch) params.set('search', debouncedSearch);

      try {
        const response = await fetch(`/api/chats?${params}`);
        const data: ChatsResponse = await response.json();
        
        setChats(data.chats);
        setCounts(data.counts);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [selectedType, selectedStateId, selectedCityId, debouncedSearch]);

  const handleJoinChat = async (chatId: number) => {
    try {
      // Отправляем статистику
      await fetch(`/api/chats/${chatId}/join`, { method: 'POST' });
      
      // Находим чат и открываем ссылку
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        // Здесь будет логика открытия Telegram
        if (chat.username) {
          window.open(`https://t.me/${chat.username}`, '_blank');
        } else {
          // Показать модальное окно с инструкцией
          alert('Для присоединения откройте Telegram и найдите группу: ' + chat.title);
        }
      }
    } catch (error) {
      console.error('Error tracking join:', error);
    }
  };

  const getResultText = () => {
    const typeText = selectedType === 'GROUP' ? 'групп' :
                    selectedType === 'CHAT' ? 'чатов' :
                    selectedType === 'CHANNEL' ? 'каналов' :
                    'сообществ';
    
    let locationText = '';
    if (selectedStateId && selectedCityId) {
      const state = states.find(s => s.id === selectedStateId);
      const city = cities.find(c => c.id === selectedCityId);
      locationText = ` в ${city?.name}, ${state?.name}`;
    } else if (selectedStateId) {
      const state = states.find(s => s.id === selectedStateId);
      locationText = ` в штате ${state?.name}`;
    }
    
    return `📊 Найдено: ${pagination.total} ${typeText}${locationText}`;
  };

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
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        counts={counts}
      />

      {/* Статистика */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{getResultText()}</span>
      </div>

      {/* Список чатов */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
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
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ничего не найдено
          </h3>
          <p className="text-gray-600">
            Попробуйте изменить фильтры или поисковый запрос
          </p>
        </div>
      )}
    </div>
  );
}
```

## 5. Детальная страница чата

### `src/components/chats/ChatDetail.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { ArrowLeft, Users, MapPin, Shield, ExternalLink, Heart, Share, Flag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

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

export function ChatDetail({ chat }: ChatDetailProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    setIsJoining(true);
    
    try {
      // Отправляем статистику
      await fetch(`/api/chats/${chat.id}/join`, { method: 'POST' });
      
      // Открываем Telegram
      if (chat.username) {
        window.open(`https://t.me/${chat.username}`, '_blank');
      } else {
        alert('Для присоединения откройте Telegram и найдите: ' + chat.title);
      }
    } catch (error) {
      console.error('Error joining chat:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: chat.title,
          text: chat.description || `${chat.title} - русскоязычное сообщество`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      // Fallback - копируем в буфер обмена
      navigator.clipboard.writeText(window.location.href);
      alert('Ссылка скопирована в буфер обмена');
    }
  };

  const formatMemberCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
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
            {/* Аватар-заглушка */}
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
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

              {chat.topic && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {chat.topic}
                </span>
              )}
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
          </div>
        </div>
      </div>

      {/* Фиксированные кнопки действий */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          <Button
            onClick={handleJoin}
            disabled={isJoining}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {isJoining ? 'Переход...' : 'Присоединиться'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShare}
            className="px-3"
          >
            <Share className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            className="px-3"
          >
            <Heart className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            className="px-3 text-red-600 hover:text-red-700"
          >
            <Flag className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

Эта часть содержит все основные UI компоненты для каталога чатов. Следующий артефакт будет с обновленной навигацией и страницами.
