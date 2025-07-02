'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Save, 
  Eye, 
  Upload,
  ArrowLeft,
  FileText,
  Globe,
  Building2,
  MessageSquare,
  X,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface Business {
  id: number;
  name: string;
  category: string;
  city: string;
}

interface TelegramChat {
  id: number;
  title: string;
  category: string;
  memberCount: number;
}

export default function CreateBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Данные формы
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    categoryId: '',
    metaTitle: '',
    metaDescription: '',
    keywords: [] as string[],
    featuredImage: '',
    featuredImageAlt: '',
    mentionedBusinesses: [] as number[],
    mentionedChats: [] as number[]
  });

  // Вспомогательные данные
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [chats, setChats] = useState<TelegramChat[]>([]);
  const [showBusinessSelector, setShowBusinessSelector] = useState(false);
  const [showChatSelector, setShowChatSelector] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  const generateSlug = useCallback((title: string): string => {
    return title
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

  const loadInitialData = useCallback(async () => {
    try {
      // Симуляция загрузки данных
      setTimeout(() => {
        setCategories([
          { id: 1, name: 'Гайды', slug: 'guides', color: '#10B981' },
          { id: 2, name: 'Обзоры заведений', slug: 'reviews', color: '#3B82F6' },
          { id: 3, name: 'Новости 3GIS', slug: 'news', color: '#F59E0B' },
          { id: 4, name: 'Истории успеха', slug: 'success-stories', color: '#8B5CF6' }
        ]);

        setBusinesses([
          { id: 1, name: 'Русский Самовар', category: 'Ресторан', city: 'Manhattan' },
          { id: 2, name: 'Dr. Petrov Medical Center', category: 'Медицина', city: 'Brooklyn' },
          { id: 3, name: 'Красота и Стиль', category: 'Салон красоты', city: 'Queens' },
          { id: 4, name: 'Адвокат Иванов', category: 'Юристы', city: 'Manhattan' }
        ]);

        setChats([
          { id: 1, title: 'NYC Russian Community', category: 'Общение', memberCount: 2340 },
          { id: 2, title: 'Работа в Нью-Йорке', category: 'Работа', memberCount: 1250 },
          { id: 3, title: 'Мамы Нью-Йорка', category: 'Семья', memberCount: 890 },
          { id: 4, title: 'IT в США', category: 'Технологии', memberCount: 1670 }
        ]);
      }, 500);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }, []);

  const handleAutosave = useCallback(async () => {
    setSaving(true);
    try {
      // Симуляция автосохранения
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Autosave error:', error);
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Автогенерация slug при изменении заголовка
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const generatedSlug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, formData.slug, generateSlug]);

  useEffect(() => {
    // Автосохранение каждые 30 секунд
    const autosaveInterval = setInterval(() => {
      if (formData.title || formData.content) {
        handleAutosave();
      }
    }, 30000);

    return () => clearInterval(autosaveInterval);
  }, [formData.content, formData.title, handleAutosave]);

  const handleSave = async (publish: boolean = false) => {
    setSaving(true);
    try {
      const postData = {
        ...formData,
        status: publish ? 'PUBLISHED' : 'DRAFT'
      };
      
      // Симуляция сохранения
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (publish) {
        // Редирект на публичную страницу
        router.push(`/blog/${formData.slug}`);
      } else {
        // Редирект в админку
        router.push('/admin/blog');
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const copyBusinessLink = (businessId: number) => {
    const link = `https://t.me/ThreeGIS_bot/app?startapp=business_${businessId}`;
    navigator.clipboard.writeText(link);
    
    // Добавляем заведение к упомянутым
    if (!formData.mentionedBusinesses.includes(businessId)) {
      setFormData(prev => ({
        ...prev,
        mentionedBusinesses: [...prev.mentionedBusinesses, businessId]
      }));
    }
  };

  const copyChatLink = (chatId: number) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      const link = `https://t.me/threegis_chat_${chat.title.toLowerCase().replace(/\s+/g, '_')}`;
      navigator.clipboard.writeText(link);
      
      // Добавляем чат к упомянутым
      if (!formData.mentionedChats.includes(chatId)) {
        setFormData(prev => ({
          ...prev,
          mentionedChats: [...prev.mentionedChats, chatId]
        }));
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
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
            <h1 className="text-2xl font-bold text-gray-900">Создание статьи</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {saving ? (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 animate-spin" />
                  Сохранение...
                </span>
              ) : lastSaved ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  Сохранено {lastSaved.toLocaleTimeString()}
                </span>
              ) : (
                <span>Новая статья</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Сохранить черновик
          </Button>
          <Button 
            onClick={() => handleSave(true)}
            disabled={saving || !formData.title || !formData.content}
          >
            <Globe className="w-4 h-4 mr-2" />
            Опубликовать
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основной контент */}
        <div className="lg:col-span-2 space-y-6">
          {/* Основная информация */}
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>
                Заголовок, содержание и краткое описание статьи
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Заголовок статьи *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Например: 10 лучших русских ресторанов в Нью-Йорке"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="slug">URL (slug)</Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                    3gis.us/blog/
                  </span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="rounded-l-none"
                    placeholder="url-statii"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">Краткое описание</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Краткое описание статьи для превью..."
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Используется для превью и SEO описания
                </p>
              </div>

              <div>
                <Label htmlFor="content">Содержание статьи *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Напишите содержание статьи в формате Markdown..."
                  rows={15}
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Поддерживается Markdown разметка
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SEO настройки */}
          <Card>
            <CardHeader>
              <CardTitle>SEO оптимизация</CardTitle>
              <CardDescription>
                Настройки для поисковой оптимизации
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="Если не указан, будет использован основной заголовок"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Рекомендуется до 60 символов
                </p>
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="Если не указано, будет использовано краткое описание"
                  rows={2}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Рекомендуется до 160 символов
                </p>
              </div>

              <div>
                <Label htmlFor="keywords">Ключевые слова</Label>
                <div className="flex mt-1">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Добавить ключевое слово"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="rounded-r-none"
                  />
                  <Button 
                    type="button" 
                    onClick={addKeyword}
                    className="rounded-l-none"
                  >
                    Добавить
                  </Button>
                </div>
                {formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="gap-1">
                        {keyword}
                        <button
                          onClick={() => removeKeyword(keyword)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Категория и изображение */}
          <Card>
            <CardHeader>
              <CardTitle>Публикация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Категория *</Label>
                <select
                  id="category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="featuredImage">Изображение статьи</Label>
                <div className="mt-1">
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Загрузить изображение
                  </Button>
                </div>
                {formData.featuredImage && (
                  <div className="mt-2">
                    <Input
                      value={formData.featuredImageAlt}
                      onChange={(e) => setFormData(prev => ({ ...prev, featuredImageAlt: e.target.value }))}
                      placeholder="Alt текст для изображения"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ссылки на заведения */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Заведения
              </CardTitle>
              <CardDescription>
                Добавьте ссылки на заведения из справочника
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full mb-3"
                onClick={() => setShowBusinessSelector(!showBusinessSelector)}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Выбрать заведения
              </Button>

              {showBusinessSelector && (
                <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
                  <p className="text-sm font-medium">Выберите заведения:</p>
                  {businesses.map((business) => (
                    <div key={business.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <p className="text-sm font-medium">{business.name}</p>
                        <p className="text-xs text-gray-500">{business.category} • {business.city}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => copyBusinessLink(business.id)}
                        className="text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Копировать ссылку
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {formData.mentionedBusinesses.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Упомянутые заведения:</p>
                  <div className="space-y-1">
                    {formData.mentionedBusinesses.map((businessId) => {
                      const business = businesses.find(b => b.id === businessId);
                      return business ? (
                        <Badge key={businessId} variant="outline" className="text-xs">
                          {business.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ссылки на чаты */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Telegram чаты
              </CardTitle>
              <CardDescription>
                Добавьте ссылки на тематические чаты
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full mb-3"
                onClick={() => setShowChatSelector(!showChatSelector)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Выбрать чаты
              </Button>

              {showChatSelector && (
                <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
                  <p className="text-sm font-medium">Выберите чаты:</p>
                  {chats.map((chat) => (
                    <div key={chat.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <p className="text-sm font-medium">{chat.title}</p>
                        <p className="text-xs text-gray-500">{chat.category} • {chat.memberCount} участников</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => copyChatLink(chat.id)}
                        className="text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Копировать ссылку
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {formData.mentionedChats.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Упомянутые чаты:</p>
                  <div className="space-y-1">
                    {formData.mentionedChats.map((chatId) => {
                      const chat = chats.find(c => c.id === chatId);
                      return chat ? (
                        <Badge key={chatId} variant="outline" className="text-xs">
                          {chat.title}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
