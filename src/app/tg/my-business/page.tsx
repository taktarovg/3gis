'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Building, 
  Users, 
  Star, 
  Eye, 
  Phone,
  Crown,
  Award,
  TrendingUp,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

export default function MyBusinessPage() {
  const [userStats, setUserStats] = useState({
    contributedBusinesses: 0,
    ownedBusinesses: 0,
    totalViews: 0,
    totalCalls: 0,
    contributionPoints: 0,
    level: 1,
    badges: []
  });

  // Mock data - в продакшене загружать с API
  useEffect(() => {
    setUserStats({
      contributedBusinesses: 3,
      ownedBusinesses: 1,
      totalViews: 284,
      totalCalls: 12,
      contributionPoints: 47,
      level: 2,
      badges: ['Первооткрыватель', 'Помощник сообщества']
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Мой бизнес</h1>
        <p className="text-gray-600">Управляйте своими заведениями и помогайте сообществу</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {/* Add My Business - Основная CTA */}
        <Card className="border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">
                  Добавить мой бизнес
                </h3>
                <p className="text-blue-700 text-sm mb-3">
                  Зарегистрируйте свое заведение и получите премиум функции
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <Crown className="w-4 h-4" />
                  <span>Верификация • Аналитика • Ответы на отзывы</span>
                </div>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                asChild
              >
                <Link href="/tg/add-business?type=owner">
                  <Building className="w-4 h-4 mr-2" />
                  Добавить
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add to Catalog - Community contribution */}
        <Card className="border border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Добавить в каталог
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Помогите сообществу - добавьте заведение, которое знаете
                </p>
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <Award className="w-4 h-4" />
                  <span>+5 баллов • Значки • Лидерборд</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-green-500 text-green-600 hover:bg-green-50"
                asChild
              >
                <Link href="/tg/add-business?type=community">
                  <Plus className="w-4 h-4 mr-2" />
                  В каталог
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Stats & Gamification */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {userStats.contributionPoints}
            </div>
            <div className="text-sm text-gray-600">Баллов</div>
            <div className="text-xs text-gray-500 mt-1">
              Уровень {userStats.level}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {userStats.contributedBusinesses}
            </div>
            <div className="text-sm text-gray-600">Добавлено</div>
            <div className="text-xs text-gray-500 mt-1">
              мест в каталог
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Badges */}
      {userStats.badges.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Мои достижения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userStats.badges.map((badge, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Owned Businesses */}
      {userStats.ownedBusinesses > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-500" />
                Мои заведения
              </div>
              <Badge variant="outline">{userStats.ownedBusinesses}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mock business card */}
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Ресторан "Русский дом"</h4>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    Brighton Beach, Brooklyn
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <Crown className="w-3 h-3 mr-1" />
                  Премиум
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900">{userStats.totalViews}</div>
                  <div className="text-xs text-gray-500 flex items-center justify-center">
                    <Eye className="w-3 h-3 mr-1" />
                    Просмотров
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">{userStats.totalCalls}</div>
                  <div className="text-xs text-gray-500 flex items-center justify-center">
                    <Phone className="w-3 h-3 mr-1" />
                    Звонков
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-yellow-600">4.8</div>
                  <div className="text-xs text-gray-500 flex items-center justify-center">
                    <Star className="w-3 h-3 mr-1" />
                    Рейтинг
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">
                  Управлять
                </Button>
                <Button size="sm" className="flex-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Аналитика
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Community Contributions */}
      {userStats.contributedBusinesses > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-500" />
                Мой вклад в сообщество
              </div>
              <Badge variant="outline">{userStats.contributedBusinesses}</Badge>
            </CardTitle>
            <CardDescription>
              Заведения, которые вы добавили в каталог
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Mock contribution entries */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Салон "Красота"</div>
                  <div className="text-xs text-gray-500">Добавлено 2 дня назад</div>
                </div>
                <Badge variant="secondary" className="text-xs">+5 баллов</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Автосервис "Мастер"</div>
                  <div className="text-xs text-gray-500">Добавлено неделю назад</div>
                </div>
                <Badge variant="secondary" className="text-xs">+7 баллов</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {userStats.ownedBusinesses === 0 && userStats.contributedBusinesses === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Начните свой путь в 3GIS
            </h3>
            <p className="text-gray-600 mb-6">
              Добавьте свой бизнес или помогите сообществу, добавив места, которые знаете
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/tg/add-business?type=owner">
                  <Building className="w-4 h-4 mr-2" />
                  Добавить мой бизнес
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/tg/add-business?type=community">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить в каталог
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}