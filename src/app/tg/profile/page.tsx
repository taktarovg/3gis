// src/app/tg/profile/page.tsx
'use client';

import { useState } from 'react';
import { 
  User, 
  MapPin, 
  Bell, 
  Globe, 
  Star, 
  Building2, 
  Heart,
  Settings,
  LogOut,
  Camera
} from 'lucide-react';
import { useTelegramAuth } from '@/hooks/use-telegram-auth';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useGeolocation } from '@/hooks/use-geolocation';
import Image from 'next/image';

/**
 * Страница профиля пользователя для 3GIS MVP
 */
export default function ProfilePage() {
  const { user, logout } = useTelegramAuth();
  const updateUserLocation = useAuthStore((state) => state.updateUserLocation);
  const { latitude, longitude, requestLocation, isLoading: locationLoading, hasLocation } = useGeolocation();
  
  const [notifications, setNotifications] = useState({
    newPlaces: true,
    reviews: false,
    promotions: true,
  });

  // Обновление геолокации
  const handleUpdateLocation = async () => {
    await requestLocation();
    if (hasLocation && latitude && longitude) {
      updateUserLocation(latitude, longitude);
      // TODO: Отправить на сервер
    }
  };

  // Выход из аккаунта
  const handleLogout = () => {
    logout();
    // В Telegram Mini App выход происходит автоматически
  };

  if (!user) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  // Заглушки для статистики (будут заполнены при реализации соответствующего функционала)
  const businessesCount = 0; // TODO: Получать из API когда будет готово
  const favoritesCount = 0;  // TODO: Получать из API когда будет готово
  const reviewsCount = 0;    // TODO: Получать из API когда будет готово

  return (
    <div className="p-4 space-y-6">
      {/* Header с информацией пользователя */}
      <div className="bg-white rounded-lg p-6 space-y-4">
        <div className="flex items-center space-x-4">
          {/* Аватар */}
          <div className="relative">
            <Image
              src={user.avatar || `https://avatar.iran.liara.run/public/${user.telegramId}`}
              alt={`${user.firstName} ${user.lastName}`}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full border-4 border-blue-100"
            />
            <button className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full">
              <Camera className="h-3 w-3" />
            </button>
          </div>
          
          {/* Информация о пользователе */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            {user.username && (
              <p className="text-gray-500">
                @{user.username}
              </p>
            )}
            <p className="text-sm text-gray-400">
              Участник с {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Статистика пользователя */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Building2 className="h-4 w-4 text-blue-500 mr-1" />
              <span className="font-semibold text-lg">
                {businessesCount}
              </span>
            </div>
            <p className="text-xs text-gray-500">Мои места</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Heart className="h-4 w-4 text-red-500 mr-1" />
              <span className="font-semibold text-lg">
                {favoritesCount}
              </span>
            </div>
            <p className="text-xs text-gray-500">Избранное</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="font-semibold text-lg">
                {reviewsCount}
              </span>
            </div>
            <p className="text-xs text-gray-500">Отзывы</p>
          </div>
        </div>
      </div>

      {/* Настройки местоположения */}
      <div className="bg-white rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Местоположение
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Мой город</p>
              <p className="text-sm text-gray-500">
                Нью-Йорк, NY
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleUpdateLocation}
              disabled={locationLoading}
            >
              {locationLoading ? 'Определяем...' : 'Обновить'}
            </Button>
          </div>
          
          {user.latitude && user.longitude && (
            <p className="text-xs text-gray-400">
              Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
            </p>
          )}
        </div>
      </div>

      {/* Настройки уведомлений */}
      <div className="bg-white rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Уведомления
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Новые места рядом</p>
              <p className="text-sm text-gray-500">
                Уведомления о новых заведениях в вашем районе
              </p>
            </div>
            <Switch
              checked={notifications.newPlaces}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, newPlaces: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Ответы на отзывы</p>
              <p className="text-sm text-gray-500">
                Уведомления об ответах владельцев на ваши отзывы
              </p>
            </div>
            <Switch
              checked={notifications.reviews}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, reviews: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Специальные предложения</p>
              <p className="text-sm text-gray-500">
                Акции и скидки от заведений
              </p>
            </div>
            <Switch
              checked={notifications.promotions}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, promotions: checked }))
              }
            />
          </div>
        </div>
      </div>

      {/* Общие настройки */}
      <div className="bg-white rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Настройки
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium">Язык интерфейса</p>
                <p className="text-sm text-gray-500">Русский</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Изменить
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium">Единицы измерения</p>
                <p className="text-sm text-gray-500">Километры</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Изменить
            </Button>
          </div>
        </div>
      </div>

      {/* Для бизнеса */}
      {user.role === 'BUSINESS_OWNER' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Владелец бизнеса
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            Управляйте своими заведениями и отвечайте на отзывы
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Панель управления
          </Button>
        </div>
      )}

      {/* О приложении */}
      <div className="bg-white rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          О приложении
        </h2>
        
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>3GIS</strong> - справочник русскоязычных организаций в США
          </p>
          <p>Версия: 1.0.0 (MVP)</p>
          <p>
            Помогаем найти рестораны, врачей, юристов и другие услуги 
            на русском языке по всей Америке
          </p>
        </div>
        
        <div className="pt-3 border-t border-gray-100">
          <button className="text-sm text-blue-600 hover:text-blue-700">
            Политика конфиденциальности
          </button>
          <span className="mx-2 text-gray-300">•</span>
          <button className="text-sm text-blue-600 hover:text-blue-700">
            Условия использования
          </button>
        </div>
      </div>

      {/* Выход */}
      <div className="bg-white rounded-lg p-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Выйти из аккаунта
        </Button>
      </div>

      {/* Отступ для нижней навигации */}
      <div className="h-4"></div>
    </div>
  );
}
