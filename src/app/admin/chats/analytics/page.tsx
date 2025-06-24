'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Users, 
  Eye, 
  TrendingUp, 
  BarChart3,
  Calendar,
  MapPin,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalChats: number;
    totalMembers: number;
    totalViews: number;
    totalJoins: number;
    recentChats: number;
  };
  distribution: {
    byType: Array<{ type: string; _count: number }>;
    byStatus: Array<{ status: string; _count: number }>;
    byState: Array<{ stateId: string; stateName: string; _count: number }>;
  };
  growth: Array<{ date: string; count: number }>;
}

const TYPE_LABELS = {
  GROUP: 'Группы',
  CHAT: 'Чаты',
  CHANNEL: 'Каналы',
};

const STATUS_LABELS = {
  PENDING: 'На модерации',
  ACTIVE: 'Активные',
  REJECTED: 'Отклоненные',
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function ChatAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    loadAnalytics();
  }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/chats/analytics?period=${period}`);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка аналитики...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600">Ошибка загрузки данных</p>
          <Button onClick={loadAnalytics} className="mt-4">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Аналитика чатов
          </h1>
          <p className="text-gray-600">
            Статистика и показатели Telegram-сообществ
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Последние 7 дней</SelectItem>
              <SelectItem value="30">Последние 30 дней</SelectItem>
              <SelectItem value="90">Последние 90 дней</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={loadAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Всего чатов</p>
                <p className="text-xl font-semibold">
                  {formatNumber(data.overview.totalChats)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Участников</p>
                <p className="text-xl font-semibold">
                  {formatNumber(data.overview.totalMembers)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Просмотров</p>
                <p className="text-xl font-semibold">
                  {formatNumber(data.overview.totalViews)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Переходов</p>
                <p className="text-xl font-semibold">
                  {formatNumber(data.overview.totalJoins)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Новых за период</p>
                <p className="text-xl font-semibold">
                  {formatNumber(data.overview.recentChats)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Распределение по типам */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Распределение по типам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.distribution.byType.map((item) => {
                const total = data.distribution.byType.reduce((sum, t) => sum + t._count, 0);
                const percentage = total > 0 ? Math.round((item._count / total) * 100) : 0;
                
                return (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium">
                        {TYPE_LABELS[item.type as keyof typeof TYPE_LABELS] || item.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{percentage}%</span>
                      <Badge variant="outline">{item._count}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Распределение по статусам */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Распределение по статусам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.distribution.byStatus.map((item) => {
                const total = data.distribution.byStatus.reduce((sum, s) => sum + s._count, 0);
                const percentage = total > 0 ? Math.round((item._count / total) * 100) : 0;
                
                return (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge className={STATUS_COLORS[item.status as keyof typeof STATUS_COLORS]}>
                        {STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{percentage}%</span>
                      <Badge variant="outline">{item._count}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Рост по дням */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Добавление чатов (последние 7 дней)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.growth.map((day, index) => {
              const maxCount = Math.max(...data.growth.map(d => d.count));
              const width = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
              
              return (
                <div key={day.date} className="flex items-center gap-3">
                  <div className="w-16 text-sm text-gray-600">
                    {formatDate(day.date)}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-sm font-medium text-right">
                    {day.count}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Топ штатов */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Популярные штаты
          </CardTitle>
          <CardDescription>
            Штаты с наибольшим количеством сообществ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.distribution.byState.length > 0 ? (
            <div className="space-y-2">
              {data.distribution.byState.slice(0, 10).map((state, index) => (
                <div key={state.stateId} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 text-xs font-bold rounded-full flex items-center justify-center mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium">{state.stateName}</span>
                  </div>
                  <Badge variant="outline">{state._count} сообществ</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Нет данных по штатам
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}