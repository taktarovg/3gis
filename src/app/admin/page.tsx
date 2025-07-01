'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  MessageSquare, 
  BarChart3,
  TrendingUp,
  Calendar,
  Eye,
  Star,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  businesses: {
    total: number;
    active: number;
    pending: number;
    premium: number;
  };
  users: {
    total: number;
    recent: number;
  };
  chats: {
    total: number;
    active: number;
    pending: number;
  };
  blog: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    weeklyViews: number;
  };
  views: {
    total: number;
    today: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Симуляция загрузки данных - в реальности здесь будет API вызов
      setTimeout(() => {
        setStats({
          businesses: {
            total: 247,
            active: 234,
            pending: 13,
            premium: 45,
          },
          users: {
            total: 1284,
            recent: 23,
          },
          chats: {
            total: 18,
            active: 15,
            pending: 3,
          },
          blog: {
            totalPosts: 12,
            publishedPosts: 8,
            draftPosts: 4,
            weeklyViews: 1450,
          },
          views: {
            total: 12540,
            today: 156,
          },
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка статистики...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Панель администратора 3GIS
        </h1>
        <p className="text-gray-600">
          Добро пожаловать в панель управления русскоязычным справочником в США
        </p>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Заведения</p>
                <p className="text-xl font-semibold">{stats?.businesses?.total}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {stats?.businesses?.active} активных
                  </Badge>
                  {stats?.businesses?.pending && stats.businesses.pending > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      {stats.businesses.pending} ожидают
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Пользователи</p>
                <p className="text-xl font-semibold">{stats?.users?.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  +{stats?.users?.recent} за сегодня
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Чаты</p>
                <p className="text-xl font-semibold">{stats?.chats?.total}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {stats?.chats?.active} активных
                  </Badge>
                  {stats?.chats?.pending && stats.chats.pending > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      {stats.chats.pending} на модерации
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-indigo-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Блог</p>
                <p className="text-xl font-semibold">{stats?.blog?.totalPosts}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {stats?.blog?.publishedPosts} опубликовано
                  </Badge>
                  {stats?.blog?.draftPosts && stats.blog.draftPosts > 0 && (
                    <Badge className="bg-gray-100 text-gray-800 text-xs">
                      {stats.blog.draftPosts} черновиков
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Управление заведениями
            </CardTitle>
            <CardDescription>
              Модерация и управление бизнесами в справочнике
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Активные заведения:</span>
                <span className="font-medium">{stats?.businesses?.active}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Premium подписки:</span>
                <span className="font-medium text-yellow-600">{stats?.businesses?.premium}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>На модерации:</span>
                <span className="font-medium text-orange-600">{stats?.businesses?.pending}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Link href="/admin/businesses">
                <Button className="w-full" size="sm">
                  Управление заведениями
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Telegram сообщества
            </CardTitle>
            <CardDescription>
              Модерация русскоязычных чатов и групп
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Всего чатов:</span>
                <span className="font-medium">{stats?.chats?.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Активные:</span>
                <span className="font-medium text-green-600">{stats?.chats?.active}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>На модерации:</span>
                <span className="font-medium text-yellow-600">{stats?.chats?.pending}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Link href="/admin/chats">
                <Button className="w-full" size="sm">
                  Управление чатами
                </Button>
              </Link>
              <Link href="/admin/chats/analytics">
                <Button className="w-full" size="sm" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Аналитика
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Блог 3GIS
            </CardTitle>
            <CardDescription>
              Управление статьями и контентом для SEO продвижения
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Всего статей:</span>
                <span className="font-medium">{stats?.blog?.totalPosts}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Опубликовано:</span>
                <span className="font-medium text-green-600">{stats?.blog?.publishedPosts}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Просмотров за неделю:</span>
                <span className="font-medium text-blue-600">{stats?.blog?.weeklyViews}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Link href="/admin/blog">
                <Button className="w-full" size="sm">
                  Управление блогом
                </Button>
              </Link>
              <Link href="/admin/blog/create">
                <Button className="w-full" size="sm" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Создать статью
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Последняя активность */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Последняя активность
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Новое заведение добавлено</p>
                    <p className="text-xs text-gray-500">Русский ресторан в Brooklyn</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">5 мин назад</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Чат прошел модерацию</p>
                    <p className="text-xs text-gray-500">NYC Russian Community</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">12 мин назад</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Premium подписка</p>
                    <p className="text-xs text-gray-500">Мастер красоты оформил подписку</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">1 ч назад</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium">Новый пользователь</p>
                    <p className="text-xs text-gray-500">Регистрация через Telegram</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">2 ч назад</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Популярные категории
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🍽️</span>
                  <div>
                    <p className="text-sm font-medium">Рестораны</p>
                    <p className="text-xs text-gray-500">89 заведений</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">2,340</p>
                  <p className="text-xs text-gray-500">просмотров</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚕️</span>
                  <div>
                    <p className="text-sm font-medium">Медицина</p>
                    <p className="text-xs text-gray-500">67 заведений</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">1,890</p>
                  <p className="text-xs text-gray-500">просмотров</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💄</span>
                  <div>
                    <p className="text-sm font-medium">Красота</p>
                    <p className="text-xs text-gray-500">45 заведений</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">1,230</p>
                  <p className="text-xs text-gray-500">просмотров</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚖️</span>
                  <div>
                    <p className="text-sm font-medium">Юристы</p>
                    <p className="text-xs text-gray-500">34 заведения</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">980</p>
                  <p className="text-xs text-gray-500">просмотров</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}