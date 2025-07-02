'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClientButton } from '@/components/ui/client-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Filter,
  Calendar,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  status: 'DRAFT' | 'PUBLISHED';
  category: {
    name: string;
    color: string;
  };
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  weeklyViews: number;
  monthlyViews: number;
  topCategory: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    loadBlogData();
  }, []);

  const loadBlogData = async () => {
    try {
      // Загружаем данные из API
      const response = await fetch('/api/blog/posts?limit=50');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
        
        // Вычисляем статистику
        const publishedCount = data.posts.filter((p: BlogPost) => p.status === 'PUBLISHED').length;
        const draftCount = data.posts.filter((p: BlogPost) => p.status === 'DRAFT').length;
        const totalViews = data.posts.reduce((sum: number, p: BlogPost) => sum + p.viewCount, 0);
        
        setStats({
          totalPosts: data.posts.length,
          publishedPosts: publishedCount,
          draftPosts: draftCount,
          weeklyViews: Math.floor(totalViews * 0.3), // Примерно 30% от общих
          monthlyViews: totalViews,
          topCategory: 'Гайды'
        });
      } else {
        console.error('Failed to load blog posts');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading blog data:', error);
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка данных блога...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление блогом 3GIS</h1>
          <p className="text-gray-600">Создавайте контент для SEO продвижения справочника</p>
        </div>
        <Link href="/admin/blog/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Создать статью
          </Button>
        </Link>
      </div>

      {/* Быстрая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Всего статей</p>
                <p className="text-xl font-semibold">{stats?.totalPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Опубликовано</p>
                <p className="text-xl font-semibold">{stats?.publishedPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Edit className="w-8 h-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Черновики</p>
                <p className="text-xl font-semibold">{stats?.draftPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Просмотры (месяц)</p>
                <p className="text-xl font-semibold">{stats?.monthlyViews?.toLocaleString()}</p>
                <p className="text-xs text-gray-500">+{stats?.weeklyViews} за неделю</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры и поиск */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Поиск статей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <ClientButton
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            Все ({stats?.totalPosts})
          </ClientButton>
          <ClientButton
            variant={statusFilter === 'published' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('published')}
          >
            Опубликованные ({stats?.publishedPosts})
          </ClientButton>
          <ClientButton
            variant={statusFilter === 'draft' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('draft')}
          >
            Черновики ({stats?.draftPosts})
          </ClientButton>
        </div>
      </div>

      {/* Список статей */}
      <Card>
        <CardHeader>
          <CardTitle>Статьи блога</CardTitle>
          <CardDescription>
            Управление всеми статьями и их публикацией
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'Статьи не найдены' : 'Нет статей'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'Начните создавать контент для SEO продвижения'
                  }
                </p>
                {!searchQuery && (
                  <Link href="/admin/blog/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Создать первую статью
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{post.title}</h3>
                      <Badge
                        variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}
                        className={post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {post.status === 'PUBLISHED' ? 'Опубликовано' : 'Черновик'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        style={{ backgroundColor: post.category.color + '20', color: post.category.color }}
                      >
                        {post.category.name}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.viewCount} просмотров
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.publishedAt ? (
                          <>Опубликовано {formatDate(post.publishedAt)}</>
                        ) : (
                          <>Создано {formatDate(post.createdAt)}</>
                        )}
                      </span>
                      <span>
                        Обновлено {formatDate(post.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {post.status === 'PUBLISHED' && (
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                    <Link href={`/admin/blog/${post.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <ClientButton variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </ClientButton>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Быстрые ссылки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Популярные статьи (30 дней)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Как найти русскоговорящего врача</span>
                <span className="text-sm font-medium">892 просмотра</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">10 лучших русских ресторанов</span>
                <span className="text-sm font-medium">523 просмотра</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Юридические услуги в NYC</span>
                <span className="text-sm font-medium">445 просмотров</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Быстрые действия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/admin/blog/create">
                <Button className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Создать новую статью
                </Button>
              </Link>
              <Link href="/admin/blog/categories">
                <Button variant="outline" className="w-full justify-start">
                  <Filter className="w-4 h-4 mr-2" />
                  Управление категориями
                </Button>
              </Link>
              <Link href="/blog" target="_blank">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  Посмотреть публичный блог
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}