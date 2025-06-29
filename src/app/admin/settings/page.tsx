'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, Database, Globe, Shield, Bell } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Настройки системы
        </h1>
        <p className="text-gray-600">
          Конфигурация и управление параметрами 3GIS
        </p>
      </div>

      <div className="grid gap-6">
        {/* Основные настройки */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Основные настройки
            </CardTitle>
            <CardDescription>
              Базовые параметры приложения
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteName">Название сайта</Label>
                <Input
                  id="siteName"
                  defaultValue="3GIS"
                  placeholder="3GIS"
                />
              </div>
              <div>
                <Label htmlFor="siteUrl">URL сайта</Label>
                <Input
                  id="siteUrl"
                  defaultValue="https://3gis.biz"
                  placeholder="https://3gis.biz"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="siteDescription">Описание сайта</Label>
              <Textarea
                id="siteDescription"
                defaultValue="Русскоязычный справочник организаций в США"
                placeholder="Описание для метатегов и SEO"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Настройки модерации */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Модерация контента
            </CardTitle>
            <CardDescription>
              Параметры модерации заведений и чатов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoApprove">Автоматическое одобрение заведений</Label>
                <p className="text-sm text-gray-500">
                  Новые заведения будут автоматически одобряться
                </p>
              </div>
              <Switch id="autoApprove" />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireVerification">Обязательная верификация</Label>
                <p className="text-sm text-gray-500">
                  Требовать подтверждение владения заведением
                </p>
              </div>
              <Switch id="requireVerification" defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="chatModeration">Модерация чатов</Label>
                <p className="text-sm text-gray-500">
                  Проверять новые чаты перед публикацией
                </p>
              </div>
              <Switch id="chatModeration" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Уведомления */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Уведомления
            </CardTitle>
            <CardDescription>
              Настройки уведомлений администраторов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="adminEmail">Email администратора</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@3gis.biz"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email уведомления</Label>
                <p className="text-sm text-gray-500">
                  Получать уведомления о новом контенте на email
                </p>
              </div>
              <Switch id="emailNotifications" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="telegramNotifications">Telegram уведомления</Label>
                <p className="text-sm text-gray-500">
                  Получать уведомления в Telegram
                </p>
              </div>
              <Switch id="telegramNotifications" />
            </div>
          </CardContent>
        </Card>

        {/* База данных */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              База данных
            </CardTitle>
            <CardDescription>
              Информация о базе данных и резервном копировании
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">10</div>
                <div className="text-sm text-gray-600">Заведений</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">2</div>
                <div className="text-sm text-gray-600">Пользователей</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">19</div>
                <div className="text-sm text-gray-600">Чатов</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                Экспорт данных
              </Button>
              <Button variant="outline" size="sm">
                Создать бэкап
              </Button>
              <Button variant="outline" size="sm">
                Очистить кэш
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Кнопки действий */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline">
            Сбросить
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Сохранить настройки
          </Button>
        </div>
      </div>
    </div>
  );
}
