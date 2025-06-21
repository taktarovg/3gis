'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  User,
  MapPin,
  Calendar,
  Building2,
  Star,
  Heart,
  RefreshCw,
  Crown,
  Shield
} from 'lucide-react';
import Image from 'next/image';

interface User {
  id: number;
  telegramId: string;
  username?: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  isPremium: boolean;
  createdAt: string;
  lastSeenAt: string;
  city?: {
    name: string;
    state: string;
  };
  _count: {
    businesses: number;
    reviews: number;
    favorites: number;
  };
}

/**
 * Страница управления пользователями в админке
 */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        role: filter,
        ...(search && { search })
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': 'Bearer charlotte-admin'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки пользователей');
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter, search, page]);

  const getRoleBadge = (role: string, isPremium: boolean) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="destructive"><Shield className="w-3 h-3 mr-1" />Админ</Badge>;
      case 'BUSINESS_OWNER':
        return <Badge variant="outline" className="text-blue-600"><Building2 className="w-3 h-3 mr-1" />Владелец</Badge>;
      default:
        return (
          <div className="flex space-x-1">
            <Badge variant="outline"><User className="w-3 h-3 mr-1" />Пользователь</Badge>
            {isPremium && <Badge variant="outline" className="text-yellow-600"><Crown className="w-3 h-3 mr-1" />Premium</Badge>}
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Пользователи</h1>
          <p className="text-gray-600 mt-1">Просмотр и управление пользователями 3GIS</p>
        </div>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Фильтры и поиск
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Поиск по имени, username или Telegram ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все пользователи</SelectItem>
                <SelectItem value="user">Пользователи</SelectItem>
                <SelectItem value="business_owner">Владельцы бизнеса</SelectItem>
                <SelectItem value="admin">Администраторы</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchUsers} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ошибка */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Список пользователей */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка пользователей...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Пользователи не найдены</p>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Аватар */}
                    <div className="flex-shrink-0">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          width={64}
                          height={64}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Основная информация */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {user.firstName} {user.lastName}
                          </h3>
                          {user.username && (
                            <p className="text-sm text-gray-600">@{user.username}</p>
                          )}
                        </div>
                        {getRoleBadge(user.role, user.isPremium)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          Telegram ID: {user.telegramId}
                        </div>
                        {user.city && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {user.city.name}, {user.city.state}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Регистрация: {formatDate(user.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Последний визит: {formatDate(user.lastSeenAt)}
                        </div>
                      </div>

                      {/* Статистика активности */}
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-1 text-blue-500" />
                          {user._count.businesses} заведений
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" />
                          {user._count.reviews} отзывов
                        </div>
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-1 text-red-500" />
                          {user._count.favorites} в избранном
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Предыдущая
          </Button>
          <span className="flex items-center px-4">
            Страница {page} из {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Следующая
          </Button>
        </div>
      )}
    </div>
  );
}
