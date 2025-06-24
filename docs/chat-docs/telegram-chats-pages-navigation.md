# 📱 Страницы и навигация для каталога Telegram-чатов

## 1. Обновленная навигация (5 иконок)

### `src/components/navigation/BottomNavigation.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Heart, Building2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Главная',
    href: '/tg',
    icon: Home,
  },
  {
    name: 'Чаты',
    href: '/tg/chats',
    icon: MessageSquare,
  },
  {
    name: 'Избранное',
    href: '/tg/favorites', 
    icon: Heart,
  },
  {
    name: 'Бизнес',
    href: '/tg/my-business',
    icon: Building2,
  },
  {
    name: 'Профиль',
    href: '/tg/profile',
    icon: User,
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-50">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/tg' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center text-xs transition-colors',
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 mb-1',
                isActive && 'fill-current'
              )} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

## 2. Главная страница каталога чатов

### `src/app/tg/chats/page.tsx`:

```typescript
import { ChatsList } from '@/components/chats/ChatsList';
import { Metadata } from 'next';

export default function ChatsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">
          💬 Русские чаты в США
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Найдите свое сообщество среди русскоговорящих
        </p>
      </div>
      
      <div className="p-4">
        <ChatsList />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Русские чаты в США | 3GIS',
  description: 'Каталог русскоязычных Telegram-групп, чатов и каналов по городам США. Найдите свое сообщество для общения, работы, недвижимости и развлечений.',
  keywords: 'русские чаты, telegram группы, русскоговорящие США, сообщества',
  openGraph: {
    title: 'Русские чаты в США | 3GIS',
    description: 'Каталог русскоязычных Telegram-групп по городам США',
    type: 'website',
  },
};
```

## 3. Детальная страница чата

### `src/app/tg/chats/[id]/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import { ChatDetail } from '@/components/chats/ChatDetail';
import { prisma } from '@/lib/prisma';

interface ChatPageProps {
  params: {
    id: string;
  };
}

async function getChat(id: string) {
  try {
    const chatId = parseInt(id);
    
    if (isNaN(chatId)) {
      return null;
    }

    const chat = await prisma.telegramChat.findUnique({
      where: {
        id: chatId,
        status: 'ACTIVE',
        isActive: true,
      },
      include: {
        city: {
          select: { name: true }
        },
        state: {
          select: { name: true, id: true }
        },
        _count: {
          select: { favorites: true }
        }
      },
    });

    return chat;
  } catch (error) {
    console.error('Error fetching chat:', error);
    return null;
  }
}

export default async function ChatDetailPage({ params }: ChatPageProps) {
  const chat = await getChat(params.id);

  if (!chat) {
    notFound();
  }

  return <ChatDetail chat={chat} />;
}

export async function generateMetadata({ params }: ChatPageProps) {
  const chat = await getChat(params.id);
  
  if (!chat) {
    return {
      title: 'Чат не найден | 3GIS'
    };
  }

  const locationText = chat.city?.name 
    ? `в ${chat.city.name}${chat.state?.name ? `, ${chat.state.name}` : ''}`
    : chat.state?.name 
    ? `в штате ${chat.state.name}`
    : 'в США';

  return {
    title: `${chat.title} | 3GIS`,
    description: chat.description || `${chat.title} - русскоязычное сообщество ${locationText}. ${chat.memberCount} участников.`,
    keywords: `${chat.title}, ${chat.topic || 'русский чат'}, telegram, ${chat.city?.name || ''}, ${chat.state?.name || ''}`,
    openGraph: {
      title: chat.title,
      description: chat.description || `Русскоязычное сообщество ${locationText}`,
      type: 'website',
    },
  };
}

// Генерация статических страниц для популярных чатов
export async function generateStaticParams() {
  const popularChats = await prisma.telegramChat.findMany({
    where: {
      status: 'ACTIVE',
      isActive: true,
      memberCount: {
        gte: 1000, // Только чаты с 1000+ участников
      },
    },
    select: {
      id: true,
    },
    orderBy: {
      memberCount: 'desc',
    },
    take: 50, // Первые 50 популярных чатов
  });

  return popularChats.map((chat) => ({
    id: chat.id.toString(),
  }));
}
```

## 4. 404 страница для чатов

### `src/app/tg/chats/[id]/not-found.tsx`:

```typescript
import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default function ChatNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-gray-400" />
        </div>
        
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Чат не найден
        </h1>
        
        <p className="text-gray-600 mb-6">
          Этот чат был удален, заблокирован или не существует.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/tg/chats"
            className="block w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Посмотреть все чаты
          </Link>
          
          <Link
            href="/tg"
            className="flex items-center justify-center w-full text-gray-600 py-2 px-4 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
```

## 5. Обновленная главная страница (добавить ссылку на чаты)

### Обновить `src/app/tg/page.tsx`:

```typescript
// Добавить после существующего импорта
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

// Добавить в JSX после CategoryGrid, перед NearbyButton
<div className="mb-6">
  <Link
    href="/tg/chats"
    className="block bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 hover:from-blue-600 hover:to-purple-700 transition-all"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold">Русские чаты и группы</h3>
          <p className="text-sm opacity-90">Найдите свое сообщество в США</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold">500+</div>
        <div className="text-xs opacity-90">групп</div>
      </div>
    </div>
  </Link>
</div>
```

## 6. Обновить страницу избранного (добавить чаты)

### Обновить `src/app/tg/favorites/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { BusinessCard } from '@/components/businesses/BusinessCard';
import { ChatCard } from '@/components/chats/ChatCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, MessageSquare } from 'lucide-react';

export default function FavoritesPage() {
  const [favoriteBusinesses, setFavoriteBusinesses] = useState([]);
  const [favoriteChats, setFavoriteChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загрузка избранных заведений и чатов
    const loadFavorites = async () => {
      try {
        const [businessesRes, chatsRes] = await Promise.all([
          fetch('/api/favorites?type=businesses'),
          fetch('/api/favorites?type=chats'),
        ]);
        
        const businesses = await businessesRes.json();
        const chats = await chatsRes.json();
        
        setFavoriteBusinesses(businesses);
        setFavoriteChats(chats);
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">
          ❤️ Избранное
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Ваши любимые места и сообщества
        </p>
      </div>

      <div className="p-4">
        <Tabs defaultValue="businesses" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="businesses" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Заведения ({favoriteBusinesses.length})
            </TabsTrigger>
            <TabsTrigger value="chats" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Чаты ({favoriteChats.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="businesses" className="mt-4">
            {favoriteBusinesses.length > 0 ? (
              <div className="space-y-4">
                {favoriteBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Нет избранных заведений
                </h3>
                <p className="text-gray-600">
                  Добавляйте понравившиеся места в избранное
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="chats" className="mt-4">
            {favoriteChats.length > 0 ? (
              <div className="space-y-4">
                {favoriteChats.map((chat) => (
                  <ChatCard key={chat.id} chat={chat} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Нет избранных чатов
                </h3>
                <p className="text-gray-600">
                  Сохраняйте интересные сообщества в избранное
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

## 7. Команды для запуска

### После реализации всех компонентов:

```bash
# 1. Обновить схему базы данных
npx prisma db push

# 2. Перезапустить приложение для применения изменений
npm run dev

# 3. Проверить новые маршруты:
# - http://localhost:3000/tg/chats
# - http://localhost:3000/tg/chats/1 (если есть тестовые данные)

# 4. Убедиться что навигация работает (5 иконок в нижнем меню)
```

Этот артефакт завершает реализацию каталога Telegram-чатов. Все компоненты готовы для интеграции в проект!
