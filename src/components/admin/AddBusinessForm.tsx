'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Upload, Loader2, Check } from 'lucide-react';
import { AdminImageUpload } from '@/components/admin/AdminImageUpload';

interface Category {
  id: number;
  name: string;
  nameEn: string;
  slug: string;
  icon: string;
}

interface City {
  id: number;
  name: string;
  state: string;
}

interface AddBusinessFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Форма добавления бизнеса в админке
 */
export function AddBusinessForm({ onClose, onSuccess }: AddBusinessFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    categoryId: '',
    address: '',
    cityId: '',
    phone: '',
    website: '',
    languages: ['ru', 'en']
  });

  // Загружаем категории и города
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, citiesRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/cities')
        ]);

        const categoriesData = await categoriesRes.json();
        const citiesData = await citiesRes.json();

        setCategories(categoriesData);
        setCities(citiesData);
      } catch (err) {
        setError('Ошибка загрузки данных');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer charlotte-admin'
        },
        body: JSON.stringify({
          ...formData,
          categoryId: parseInt(formData.categoryId),
          cityId: parseInt(formData.cityId),
          photos: uploadedImages,
          status: 'ACTIVE' // Админ сразу активирует
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка создания бизнеса');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImages(prev => [...prev, imageUrl]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Добавить новый бизнес</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Основная информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Название (обязательно)
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ресторан Русский дом"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Название на английском
                </label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                  placeholder="Russian House Restaurant"
                />
              </div>
            </div>

            {/* Описание */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Описание
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Традиционная русская кухня в сердце Брайтон-Бич..."
                rows={3}
              />
            </div>

            {/* Категория и город */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Категория (обязательно)
                </label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Город (обязательно)
                </label>
                <Select value={formData.cityId} onValueChange={(value) => setFormData(prev => ({ ...prev, cityId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите город" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}, {city.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Адрес */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Адрес (обязательно)
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="1273 Brighton Beach Ave"
                required
              />
            </div>

            {/* Контакты */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Телефон
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(718) 555-0123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Веб-сайт
                </label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Загрузка изображений */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Фотографии (до 10 штук)
              </label>
              
              {/* Уже загруженные изображения */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {uploadedImages.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Фото ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Кнопка загрузки */}
              {uploadedImages.length < 10 && (
                <AdminImageUpload
                  onUpload={handleImageUpload}
                  maxFiles={10}
                  currentImages={uploadedImages}
                />
              )}
            </div>

            {/* Кнопки */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.name || !formData.categoryId || !formData.cityId || !formData.address}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Создаем...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Создать бизнес
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
