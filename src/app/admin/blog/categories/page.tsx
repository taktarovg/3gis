'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Edit, 
  Trash2,
  ArrowLeft,
  Tag,
  FileText,
  Palette,
  Save,
  X,
  Check
} from 'lucide-react';
import Link from 'next/link';

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  postCount: number;
}

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6'
  });

  const generateSlug = useCallback((name: string): string => {
    return name
      .toLowerCase()
      .replace(/[а-я]/g, (char) => {
        const map: { [key: string]: string } = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm',
          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
          'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
          'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return map[char] || char;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      // Симуляция загрузки данных
      setTimeout(() => {
        setCategories([
          {
            id: 1,
            name: 'Гайды',
            slug: 'guides',
            description: 'Практические советы по жизни в США',
            color: '#10B981',
            postCount: 5
          },
          {
            id: 2,
            name: 'Обзоры заведений',
            slug: 'reviews',
            description: 'Детальные обзоры русскоязычных заведений',
            color: '#3B82F6',
            postCount: 3
          },
          {
            id: 3,
            name: 'Новости 3GIS',
            slug: 'news',
            description: 'Обновления и новые заведения на платформе',
            color: '#F59E0B',
            postCount: 2
          },
          {
            id: 4,
            name: 'Истории успеха',
            slug: 'success-stories',
            description: 'Интервью с русскоязычными предпринимателями',
            color: '#8B5CF6',
            postCount: 2
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading categories:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Автогенерация slug при изменении названия
  useEffect(() => {
    if (formData.name && !editingCategory) {
      const generatedSlug = generateSlug(formData.name);
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, editingCategory, generateSlug]);

  const handleCreateCategory = async () => {
    try {
      const newCategory: BlogCategory = {
        id: Date.now(),
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
        postCount: 0
      };

      setCategories(prev => [...prev, newCategory]);
      setFormData({ name: '', slug: '', description: '', color: '#3B82F6' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleUpdateCategory = async () => {
    try {
      if (!editingCategory) return;

      setCategories(prev => 
        prev.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, ...formData, slug: formData.slug || generateSlug(formData.name) }
            : cat
        )
      );
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '', color: '#3B82F6' });
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && category.postCount > 0) {
      alert(`Нельзя удалить категорию "${category.name}" - в ней есть ${category.postCount} статей. Сначала переместите их в другую категорию.`);
      return;
    }

    if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const startEditing = (category: BlogCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color
    });
    setShowCreateForm(false);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', color: '#3B82F6' });
  };

  const startCreating = () => {
    setShowCreateForm(true);
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', color: '#3B82F6' });
  };

  const predefinedColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280'  // Gray
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка категорий...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к блогу
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Категории блога</h1>
            <p className="text-gray-600">Управление категориями для организации контента</p>
          </div>
        </div>
        
        <Button onClick={startCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Создать категорию
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Список категорий */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Существующие категории ({categories.length})
              </CardTitle>
              <CardDescription>
                Управление категориями для структурирования статей блога
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Нет категорий
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Создайте первую категорию для организации статей
                  </p>
                  <Button onClick={startCreating}>
                    <Plus className="w-4 h-4 mr-2" />
                    Создать категорию
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium text-gray-900">{category.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {category.postCount} статей
                            </Badge>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              /blog/category/{category.slug}
                            </code>
                          </div>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={category.postCount > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Форма создания/редактирования */}
        <div>
          {(showCreateForm || editingCategory) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {editingCategory ? 'Редактирование категории' : 'Новая категория'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCreateForm(false);
                      cancelEditing();
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Название категории *</Label>
                  <Input
                    id="categoryName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Например: Гайды"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="categorySlug">URL (slug)</Label>
                  <div className="flex mt-1">
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                      /category/
                    </span>
                    <Input
                      id="categorySlug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="rounded-l-none"
                      placeholder="guides"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="categoryDescription">Описание</Label>
                  <Textarea
                    id="categoryDescription"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Краткое описание категории..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Цвет категории</Label>
                  <div className="mt-2">
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                            formData.color === color ? 'border-gray-900' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                        >
                          {formData.color === color && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-16 h-8 p-1 border"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        placeholder="#3B82F6"
                        className="flex-1 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                    disabled={!formData.name.trim()}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingCategory ? 'Сохранить' : 'Создать'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      cancelEditing();
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Информационная карточка */}
          {!showCreateForm && !editingCategory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  О категориях
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Цветовое кодирование</h4>
                  <p className="text-gray-600">
                    Каждая категория имеет свой цвет для визуального разделения контента
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">SEO URL</h4>
                  <p className="text-gray-600">
                    Slug автоматически генерируется из названия и используется в URL
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Удаление</h4>
                  <p className="text-gray-600">
                    Категории с существующими статьями нельзя удалить
                  </p>
                </div>

                <div className="pt-3 border-t">
                  <h4 className="font-medium mb-2">Статистика</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Всего категорий:</span>
                      <span className="font-medium">{categories.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Всего статей:</span>
                      <span className="font-medium">
                        {categories.reduce((sum, cat) => sum + cat.postCount, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
