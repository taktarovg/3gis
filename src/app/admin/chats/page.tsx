'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Check, 
  X, 
  Eye, 
  Users, 
  MessageSquare,
  Calendar,
  Clock
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
  }, [statusFilter, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

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