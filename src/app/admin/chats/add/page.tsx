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

        {/* Кнопки действий */}
        <div className="flex justify-between pt-6 border-t">
          <Link href="/admin/chats">
            <Button variant="outline">
              Отмена
            </Button>
          </Link>
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  title: '',
                  description: '',
                  username: '',
                  inviteLink: '',
                  type: 'GROUP',
                  stateId: '',
                  cityId: '',
                  topic: '',
                  memberCount: 0,
                  isVerified: false,
                });
                setErrors({});
              }}
            >
              Очистить
            </Button>
            
            <Button
              type="submit"
              disabled={loading || !formData.title}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Создать чат
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}