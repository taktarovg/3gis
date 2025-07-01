'use client';

import { useState, useEffect } from 'react';
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
  CheckCircle2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
  categoryId: number;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  featuredImage: string;
  featuredImageAlt: string;
  mentionedBusinesses: number[];
  mentionedChats: number[];
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
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

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [chats, setChats] = useState<TelegramChat[]>([]);
  const [showBusinessSelector, setShowBusinessSelector] = useState(false);
  const [showChatSelector, setShowChatSelector] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    loadPostData();
    loadInitialData();
    
    const autosaveInterval = setInterval(() => {
      if (formData.title || formData.content) {
        handleAutosave();
      }
    }, 30000);

    return () => clearInterval(autosaveInterval);
  }, []);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        categoryId: post.categoryId.toString(),
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        keywords: post.keywords,
        featuredImage: post.featuredImage,
        featuredImageAlt: post.featuredImageAlt,
        mentionedBusinesses: post.mentionedBusinesses,
        mentionedChats: post.mentionedChats
      });
    }
  }, [post]);

  const loadPostData = async () => {
    try {
      setTimeout(() => {
        const mockPost: BlogPost = {
          id: parseInt(postId),
          title: '10 лучших русских ресторанов в Нью-Йорке',
          slug: '10-luchshih-russkih-restoranov-v-nyu-yorke',
          excerpt: 'Подробный обзор самых популярных русскоязычных ресторанов Большого Яблока, их особенности, цены и атмосфера.',
          content: `# 10 лучших русских ресторанов в Нью-Йорке

Нью-Йорк известен своим кулинарным разнообразием, и русская кухня занимает в нем особое место. В этом обзоре мы расскажем о лучших заведениях, где можно насладиться традиционными блюдами и домашней атмосферой.

## 1. Русский Самовар (Manhattan)

Легендарный ресторан в сердце Манхэттена, который уже более 20 лет радует гостей аутентичной русской кухней.

**Адрес**: 256 W 52nd St, New York, NY 10019
**Средний чек**: $50-80 на человека
**Особенности**: Живая музыка по выходным

## 2. Café Pushkin (Brooklyn)

Уютное кафе с домашней атмосферой в самом сердце русского Брайтон-Бич.

**Адрес**: 3152 Brighton 6th St, Brooklyn, NY 11235  
**Средний чек**: $30-50 на человека
**Особенности**: Домашние пироги, детское меню`,
          status: 'PUBLISHED',
          categoryId: 2,
          metaTitle: 'Лучшие русские рестораны NYC 2024 | 3GIS',
          metaDescription: 'Полный гид по лучшим русским ресторанам Нью-Йорка: цены, меню, отзывы.',
          keywords: ['русские рестораны', 'нью-йорк', 'русская кухня'],
          featuredImage: '/images/blog/russian-restaurants-nyc.jpg',
          featuredImageAlt: 'Интерьер русского ресторана в Нью-Йорке',
          mentionedBusinesses: [1, 2],
          mentionedChats: [1],
          viewCount: 523,
          publishedAt: '2024-12-01T10:00:00Z',
          createdAt: '2024-11-28T15:30:00Z',
          updatedAt: '2024-12-01T10:00:00Z'
        };
        setPost(mockPost);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading post:', error);
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      setTimeout(() => {
        setCategories([
          { id: 1, name: 'Гайды', slug: 'guides', color: '#10B981' },
          { id: 2, name: 'Обзоры заведений', slug: 'reviews', color: '#3B82F6' },
          { id: 3, name: 'Новости 3GIS', slug: 'news', color: '#F59E0B' },
          { id: 4, name: 'Истории успеха', slug: 'success-stories', color: '#8B5CF6' }
        ]);

        setBusinesses([
          { id: 1, name: 'Русский Самовар', category: 'Ресторан', city: 'Manhattan' },
          { id: 2, name: 'Café Pushkin', category: 'Кафе', city: 'Brooklyn' },
          { id: 3, name: 'Mari Vanna', category: 'Ресторан', city: 'Manhattan' },
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
  };

  const handleAutosave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Autosave error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (publish: boolean = false) => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (publish && post?.status === 'DRAFT') {
        router.push(`/blog/${formData.slug}`);
      } else {
        router.push('/admin/blog');
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Вы уверены, что хотите удалить эту статью? Это действие нельзя отменить.')) {
      try {
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push('/admin/blog');
      } catch (error) {
        console.error('Delete error:', error);
      } finally {
        setSaving(false);
      }
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
      
      if (!formData.mentionedChats.includes(chatId)) {
        setFormData(prev => ({
          ...prev,
          mentionedChats: [...prev.mentionedChats, chatId]
        }));
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка статьи...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Статья не найдена
          </h3>
          <p className="text-gray-500 mb-4">
            Статья с ID {postId} не существует или была удалена
          </p>
          <Link href="/admin/blog">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться к блогу
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const selectedCategory = categories.find(c => c.id === parseInt(formData.categoryId));

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
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">Редактирование статьи</h1>
              <Badge 
                variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}
                className={post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : ''}
              >
                {post.status === 'PUBLISHED' ? 'Опубликовано' : 'Черновик'}
              </Badge>
              {selectedCategory && (
                <Badge 
                  variant="outline" 
                  style={{ backgroundColor: selectedCategory.color + '20', color: selectedCategory.color }}
                >
                  {selectedCategory.name}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
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
              ) : null}
              
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {post.viewCount} просмотров
              </span>
              
              {post.publishedAt && (
                <span>Опубликовано {formatDate(post.publishedAt)}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {post.status === 'PUBLISHED' && (
            <Link href={`/blog/${post.slug}`} target="_blank">
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Открыть
              </Button>
            </Link>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
          
          {post.status === 'DRAFT' ? (
            <Button 
              onClick={() => handleSave(true)}
              disabled={saving || !formData.title || !formData.content}
            >
              <Globe className="w-4 h-4 mr-2" />
              Опубликовать
            </Button>
          ) : (
            <Button onClick={() => handleSave(false)} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              Обновить
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="text-red-600 hover:text-red-700"
            onClick={handleDelete}
            disabled={saving}
          >
            <Trash2 className="w-4 h-4" />
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Заголовок статьи *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">Краткое описание</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="content">Содержание статьи *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={20}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO настройки */}
          <Card>
            <CardHeader>
              <CardTitle>SEO оптимизация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Длина: {formData.metaTitle.length}/60
                </p>
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  rows={2}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Длина: {formData.metaDescription.length}/160
                </p>
              </div>

              <div>
                <Label>Ключевые слова</Label>
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
                        <button onClick={() => removeKeyword(keyword)}>
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
          {/* Категория */}
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
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
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
                <Label>Изображение статьи</Label>
                <Button variant="outline" className="w-full mt-1">
                  <Upload className="w-4 h-4 mr-2" />
                  {formData.featuredImage ? 'Изменить' : 'Загрузить'}
                </Button>
                {formData.featuredImage && (
                  <div className="mt-2">
                    <img 
                      src={formData.featuredImage} 
                      alt={formData.featuredImageAlt}
                      className="w-full h-32 object-cover rounded border"
                    />
                    <Input
                      value={formData.featuredImageAlt}
                      onChange={(e) => setFormData(prev => ({ ...prev, featuredImageAlt: e.target.value }))}
                      placeholder="Alt текст"
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Заведения */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Заведения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full mb-3"
                onClick={() => setShowBusinessSelector(!showBusinessSelector)}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Управление заведениями
              </Button>

              {showBusinessSelector && (
                <div className="space-y-2 border rounded-lg p-3 bg-gray-50 mb-3">
                  {businesses.map((business) => (
                    <div key={business.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <p className="text-sm font-medium">{business.name}</p>
                        <p className="text-xs text-gray-500">{business.category}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => copyBusinessLink(business.id)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Добавить
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {formData.mentionedBusinesses.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Упомянутые:</p>
                  <div className="space-y-2">
                    {formData.mentionedBusinesses.map((businessId) => {
                      const business = businesses.find(b => b.id === businessId);
                      return business ? (
                        <div key={businessId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{business.name}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              mentionedBusinesses: prev.mentionedBusinesses.filter(id => id !== businessId)
                            }))}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Чаты */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Telegram чаты
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full mb-3"
                onClick={() => setShowChatSelector(!showChatSelector)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Управление чатами
              </Button>

              {showChatSelector && (
                <div className="space-y-2 border rounded-lg p-3 bg-gray-50 mb-3">
                  {chats.map((chat) => (
                    <div key={chat.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <p className="text-sm font-medium">{chat.title}</p>
                        <p className="text-xs text-gray-500">{chat.memberCount} участников</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => copyChatLink(chat.id)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Добавить
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {formData.mentionedChats.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Упомянутые:</p>
                  <div className="space-y-2">
                    {formData.mentionedChats.map((chatId) => {
                      const chat = chats.find(c => c.id === chatId);
                      return chat ? (
                        <div key={chatId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{chat.title}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              mentionedChats: prev.mentionedChats.filter(id => id !== chatId)
                            }))}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
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