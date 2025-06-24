# ⚙️ Админ-панель для управления Telegram-чатами

## 1. API endpoints для админки

### `src/app/api/admin/chats/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема валидации для создания чата
const CreateChatSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  username: z.string().optional(),
  inviteLink: z.string().url().optional(),
  type: z.enum(['GROUP', 'CHAT', 'CHANNEL']),
  cityId: z.number().optional(),
  stateId: z.string().optional(),
  topic: z.string().optional(),
  memberCount: z.number().min(0).default(0),
  isVerified: z.boolean().default(false),
});

// Получение списка чатов для админки
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Построение WHERE условий
    const where: any = {};

    if (status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { topic: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [chats, total, statusCounts] = await Promise.all([
      prisma.telegramChat.findMany({
        where,
        include: {
          city: { select: { name: true } },
          state: { select: { name: true } },
          moderatedBy: { select: { firstName: true, lastName: true } },
          _count: { select: { favorites: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.telegramChat.count({ where }),
      
      // Подсчет по статусам
      prisma.telegramChat.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return NextResponse.json({
      chats,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    });

  } catch (error) {
    console.error('Admin chats API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении чатов' },
      { status: 500 }
    );
  }
}

// Создание нового чата
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateChatSchema.parse(body);

    const chat = await prisma.telegramChat.create({
      data: {
        ...data,
        status: 'PENDING', // Всегда создаем в статусе ожидания
      },
      include: {
        city: { select: { name: true } },
        state: { select: { name: true } },
      },
    });

    return NextResponse.json(chat, { status: 201 });

  } catch (error) {
    console.error('Create chat error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при создании чата' },
      { status: 500 }
    );
  }
}
```

### `src/app/api/admin/chats/[id]/moderate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ModerateSchema = z.object({
  action: z.enum(['approve', 'reject']),
  note: z.string().optional(),
  moderatorId: z.number(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = parseInt(params.id);
    const body = await request.json();
    const { action, note, moderatorId } = ModerateSchema.parse(body);

    if (isNaN(chatId)) {
      return NextResponse.json(
        { error: 'Некорректный ID чата' },
        { status: 400 }
      );
    }

    const chat = await prisma.telegramChat.update({
      where: { id: chatId },
      data: {
        status: action === 'approve' ? 'ACTIVE' : 'REJECTED',
        moderatedById: moderatorId,
        moderationNote: note,
      },
      include: {
        city: { select: { name: true } },
        state: { select: { name: true } },
        moderatedBy: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({
      success: true,
      chat,
      message: action === 'approve' ? 'Чат одобрен' : 'Чат отклонен',
    });

  } catch (error) {
    console.error('Moderate chat error:', error);
    return NextResponse.json(
      { error: 'Ошибка при модерации чата' },
      { status: 500 }
    );
  }
}
```

## 2. Страница списка чатов в админке

### `src/app/admin/chats/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Check, 
  X, 
  Eye, 
  Users, 
  MessageSquare,
  Calendar,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface Chat {
  id: number;
  title: string;
  description?: string;
  type: 'GROUP' | 'CHAT' | 'CHANNEL';
  memberCount: number;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED';
  isVerified: boolean;
  viewCount: number;
  joinCount: number;
  city?: { name: string };
  state?: { name: string };
  moderatedBy?: { firstName: string; lastName: string };
  createdAt: string;
  _count: { favorites: number };
}

const STATUS_LABELS = {
  PENDING: 'На модерации',
  ACTIVE: 'Активен',
  REJECTED: 'Отклонен',
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const TYPE_LABELS = {
  GROUP: 'Группа',
  CHAT: 'Чат',
  CHANNEL: 'Канал',
};

export default function AdminChatsPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0 });

  // Загрузка чатов
  useEffect(() => {
    loadChats();
  }, [statusFilter, searchQuery]);

  const loadChats = async () => {
    setLoading(true);
    
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (searchQuery) params.set('search', searchQuery);

    try {
      const response = await fetch(`/api/admin/chats?${params}`);
      const data = await response.json();
      
      setChats(data.chats);
      setStatusCounts(data.statusCounts);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (chatId: number, action: 'approve' | 'reject', note?: string) => {
    try {
      const response = await fetch(`/api/admin/chats/${chatId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          note,
          moderatorId: 1, // TODO: Получать из контекста авторизации
        }),
      });

      if (response.ok) {
        loadChats(); // Перезагружаем список
        alert(action === 'approve' ? 'Чат одобрен!' : 'Чат отклонен!');
      } else {
        alert('Ошибка при модерации');
      }
    } catch (error) {
      console.error('Moderation error:', error);
      alert('Ошибка при модерации');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Управление чатами
          </h1>
          <p className="text-gray-600">
            Модерация и управление Telegram-группами
          </p>
        </div>
        
        <Link href="/admin/chats/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Добавить чат
          </Button>
        </Link>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Всего чатов</p>
              <p className="text-xl font-semibold">
                {Object.values(statusCounts).reduce((sum, count) => sum + count, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">На модерации</p>
              <p className="text-xl font-semibold">
                {statusCounts.PENDING || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Check className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Активных</p>
              <p className="text-xl font-semibold">
                {statusCounts.ACTIVE || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <X className="w-8 h-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Отклоненных</p>
              <p className="text-xl font-semibold">
                {statusCounts.REJECTED || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию, описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="pending">На модерации</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="rejected">Отклоненные</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Список чатов */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Загрузка...</p>
          </div>
        ) : chats.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {chats.map((chat) => (
              <div key={chat.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {chat.title}
                      </h3>
                      <Badge className={STATUS_COLORS[chat.status]}>
                        {STATUS_LABELS[chat.status]}
                      </Badge>
                      <Badge variant="outline">
                        {TYPE_LABELS[chat.type]}
                      </Badge>
                      {chat.isVerified && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Проверен
                        </Badge>
                      )}
                    </div>

                    {chat.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {chat.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{chat.memberCount} участников</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{chat.viewCount} просмотров</span>
                      </div>

                      {(chat.city || chat.state) && (
                        <span>
                          {chat.city?.name}
                          {chat.city && chat.state && ', '}
                          {chat.state?.name}
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(chat.createdAt)}</span>
                      </div>
                    </div>

                    {chat.moderatedBy && (
                      <p className="text-xs text-gray-500 mt-1">
                        Модератор: {chat.moderatedBy.firstName} {chat.moderatedBy.lastName}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {chat.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleModerate(chat.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Одобрить
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const note = prompt('Причина отклонения (опционально):');
                            handleModerate(chat.id, 'reject', note || undefined);
                          }}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Отклонить
                        </Button>
                      </>
                    )}
                    
                    <Link href={`/tg/chats/${chat.id}`} target="_blank">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        Посмотреть
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Чаты не найдены
            </h3>
            <p className="text-gray-600">
              Попробуйте изменить фильтры поиска
            </p>
          </div>
        )}
      </div>

      {/* Пагинация */}
      {pagination.pages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => {/* TODO: Implement pagination */}}
            >
              Предыдущая
            </Button>
            <span className="px-4 py-2 text-sm">
              Страница {pagination.page} из {pagination.pages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.page === pagination.pages}
              onClick={() => {/* TODO: Implement pagination */}}
            >
              Следующая
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## 3. Форма добавления чата

### `src/app/admin/chats/add/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface State {
  id: string;
  name: string;
}

interface City {
  id: number;
  name: string;
}

export default function AddChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    username: '',
    inviteLink: '',
    type: 'GROUP' as 'GROUP' | 'CHAT' | 'CHANNEL',
    stateId: '',
    cityId: '',
    topic: '',
    memberCount: 0,
    isVerified: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Загрузка штатов
  useEffect(() => {
    fetch('/api/states')
      .then(res => res.json())
      .then(setStates)
      .catch(console.error);
  }, []);

  // Загрузка городов при выборе штата
  useEffect(() => {
    if (formData.stateId) {
      setLoadingCities(true);
      fetch(`/api/cities?stateId=${formData.stateId}`)
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
      setFormData(prev => ({ ...prev, cityId: '' }));
    }
  }, [formData.stateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const submitData = {
        ...formData,
        cityId: formData.cityId ? parseInt(formData.cityId) : undefined,
        stateId: formData.stateId || undefined,
      };

      const response = await fetch('/api/admin/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        router.push('/admin/chats');
      } else {
        const errorData = await response.json();
        if (errorData.details) {
          const fieldErrors: Record<string, string> = {};
          errorData.details.forEach((error: any) => {
            fieldErrors[error.path[0]] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          alert(errorData.error || 'Ошибка при создании чата');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Ошибка при создании чата');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/chats">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Добавить чат
          </h1>
          <p className="text-gray-600">
            Добавление нового Telegram-сообщества
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
            <CardDescription>
              Базовые данные о чате или группе
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="NYC Russian Community"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Краткое описание сообщества..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Тип *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'GROUP' | 'CHAT' | 'CHANNEL') =>
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GROUP">Группа</SelectItem>
                    <SelectItem value="CHAT">Чат</SelectItem>
                    <SelectItem value="CHANNEL">Канал</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="memberCount">Количество участников</Label>
                <Input
                  id="memberCount"
                  type="number"
                  min="0"
                  value={formData.memberCount}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    memberCount: parseInt(e.target.value) || 0 
                  }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="topic">Тематика</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="Общение, Работа, Недвижимость..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Контактная информация */}
        <Card>
          <CardHeader>
            <CardTitle>Контактная информация</CardTitle>
            <CardDescription>
              Ссылки для присоединения к сообществу
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Username (без @)</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="nyc_russian_community"
              />
            </div>

            <div>
              <Label htmlFor="inviteLink">Ссылка-приглашение</Label>
              <Input
                id="inviteLink"
                type="url"
                value={formData.inviteLink}
                onChange={(e) => setFormData(prev => ({ ...prev, inviteLink: e.target.value }))}
                placeholder="https://t.me/+AbcDefGhiJkl"
                className={errors.inviteLink ? 'border-red-500' : ''}
              />
              {errors.inviteLink && (
                <p className="text-sm text-red-600 mt-1">{errors.inviteLink}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Местоположение */}
        <Card>
          <CardHeader>
            <CardTitle>Местоположение</CardTitle>
            <CardDescription>
              Географическая привязка сообщества
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stateId">Штат</Label>
                <Select
                  value={formData.stateId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, stateId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите штат" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Не указан</SelectItem>
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cityId">Город</Label>
                <Select
                  value={formData.cityId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, cityId: value }))}
                  disabled={!formData.stateId || loadingCities}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCities ? "Загрузка..." : "Выберите город"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Не указан</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Дополнительные опции */}
        <Card>
          <CardHeader>
            <CardTitle>Дополнительные опции</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isVerified"
                checked={formData.isVerified}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, isVerified: !!checked }))
                }
              />
              <Label htmlFor="isVerified">Проверенное сообщество</Label>
            </div>
          </CardContent>
        </Card>

        {/* Кнопки */}
        <div className="flex