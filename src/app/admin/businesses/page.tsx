'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  User,
  MapPin,
  Phone,
  Globe,
  Star,
  Heart,
  RefreshCw,
  Plus
} from 'lucide-react';
import Image from 'next/image';
import { AddBusinessForm } from '@/components/admin/AddBusinessForm';

interface Business {
  id: number;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  status: string;
  rating: number;
  createdAt: string;
  category: {
    name: string;
    icon: string;
  };
  city: {
    name: string;
    state: string;
  };
  owner: {
    firstName: string;
    lastName: string;
    username?: string;
    telegramId: string;
  };
  photos: Array<{
    url: string;
  }>;
  _count: {
    reviews: number;
    favorites: number;
  };
}

/**
 * Страница модерации заведений в админке
 */
export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: filter,
        ...(search && { search })
      });

      const response = await fetch(`/api/admin/businesses?${params}`, {
        headers: {
          'Authorization': 'Bearer charlotte-admin'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки заведений');
      }

      const data = await response.json();
      setBusinesses(data.businesses);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  const updateBusinessStatus = async (businessId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/businesses', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer charlotte-admin'
        },
        body: JSON.stringify({
          businessId,
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка обновления статуса');
      }

      // Обновляем список
      fetchBusinesses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления');
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-orange-600"><Clock className="w-3 h-3 mr-1" />На модерации</Badge>;
      case 'ACTIVE':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Активен</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Отклонен</Badge>;
      case 'SUSPENDED':
        return <Badge variant="outline" className="text-gray-600">Приостановлен</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Бизнесы</h1>
          <p className="text-gray-600 mt-1">Управление и модерация бизнесов в справочнике</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить бизнес
        </Button>
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
                  placeholder="Поиск по названию, адресу или владельцу..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все бизнесы</SelectItem>
                <SelectItem value="pending">На модерации</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="rejected">Отклоненные</SelectItem>
                <SelectItem value="suspended">Приостановленные</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchBusinesses} disabled={loading}>
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

      {/* Список заведений */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка бизнесов...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Бизнесы не найдены</p>
              </CardContent>
            </Card>
          ) : (
            businesses.map((business) => (
              <Card key={business.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Фото */}
                    <div className="flex-shrink-0">
                      {business.photos.length > 0 ? (
                        <Image
                          src={business.photos[0].url}
                          alt={business.name}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">{business.category.icon}</span>
                        </div>
                      )}
                    </div>

                    {/* Основная информация */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{business.name}</h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            <span className="mr-1">{business.category.icon}</span>
                            {business.category.name}
                          </p>
                        </div>
                        {getStatusBadge(business.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {business.address}, {business.city.name}
                        </div>
                        {business.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {business.phone}
                          </div>
                        )}
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {business.owner.firstName} {business.owner.lastName}
                          {business.owner.username && ` (@${business.owner.username})`}
                        </div>
                        {business.website && (
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 mr-1" />
                            <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              Сайт
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            {business.rating.toFixed(1)} ({business._count.reviews})
                          </div>
                          <div className="flex items-center">
                            <Heart className="w-4 h-4 mr-1 text-red-500" />
                            {business._count.favorites}
                          </div>
                          <span>
                            Добавлено: {new Date(business.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>

                        {/* Кнопки действий */}
                        <div className="flex space-x-2">
                          {business.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => updateBusinessStatus(business.id, 'ACTIVE')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Одобрить
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => updateBusinessStatus(business.id, 'REJECTED')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Отклонить
                              </Button>
                            </>
                          )}
                          {business.status === 'ACTIVE' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-orange-600 border-orange-600 hover:bg-orange-50"
                              onClick={() => updateBusinessStatus(business.id, 'SUSPENDED')}
                            >
                              Приостановить
                            </Button>
                          )}
                          {(business.status === 'REJECTED' || business.status === 'SUSPENDED') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => updateBusinessStatus(business.id, 'ACTIVE')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Активировать
                            </Button>
                          )}
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

      {/* Форма добавления бизнеса */}
      {showAddForm && (
        <AddBusinessForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            fetchBusinesses(); // Обновляем список
            setShowAddForm(false);
          }}
        />
      )}
    </div>
  );
}
