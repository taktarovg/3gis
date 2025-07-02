import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, User, Eye, ArrowLeft, Search } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BlogCategorySchema } from '@/components/blog/BlogSchema';
import { BlogPageViewTracker, trackBlogEvent } from '@/components/analytics/GoogleAnalytics';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  viewCount: number;
  readingTime: number;
  publishedAt: string;
  category: {
    name: string;
    color: string;
  };
  author: {
    name: string;
  };
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  postCount: number;
}

interface CategoryPageData {
  category: BlogCategory;
  posts: BlogPost[];
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Получение данных категории и постов
async function getCategoryData(slug: string, page: number = 1): Promise<CategoryPageData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Получаем посты категории
    const postsResponse = await fetch(
      `${baseUrl}/api/blog/posts?category=${slug}&page=${page}&limit=12`,
      { next: { revalidate: 300 } }
    );

    // Получаем информацию о категории
    const categoriesResponse = await fetch(
      `${baseUrl}/api/blog/categories?includePostCount=true`,
      { next: { revalidate: 3600 } }
    );

    if (!postsResponse.ok || !categoriesResponse.ok) {
      throw new Error('Failed to fetch category data');
    }

    const [postsData, categoriesData] = await Promise.all([
      postsResponse.json(),
      categoriesResponse.json()
    ]);

    // Находим нужную категорию
    const category = categoriesData.categories.find((cat: any) => cat.slug === slug);
    
    if (!category) {
      return null;
    }

    return {
      category,
      posts: postsData.posts || [],
      pagination: postsData.pagination
    };
  } catch (error) {
    console.error('Error fetching category data:', error);
    return null;
  }
}

// Генерация метаданных
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getCategoryData(resolvedParams.slug);

  if (!data) {
    return {
      title: 'Категория не найдена | 3GIS',
      description: 'Запрашиваемая категория не найдена'
    };
  }

  const { category } = data;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://3gis.us';
  const url = `${baseUrl}/blog/category/${category.slug}`;

  return {
    title: `${category.name} | Блог 3GIS`,
    description: category.description || `Статьи в категории ${category.name} - полезные материалы для русскоговорящих в США`,
    keywords: [`${category.name.toLowerCase()}`, 'блог 3gis', 'русские в америке', 'статьи'],
    openGraph: {
      title: `${category.name} | Блог 3GIS`,
      description: category.description || `Статьи в категории ${category.name}`,
      type: 'website',
      url,
      siteName: '3GIS'
    },
    twitter: {
      card: 'summary',
      title: `${category.name} | Блог 3GIS`,
      description: category.description || `Статьи в категории ${category.name}`
    },
    alternates: {
      canonical: url
    }
  };
}

// Статическая генерация параметров
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blog/categories`);
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.categories.map((category: any) => ({
      slug: category.slug
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function CategoryPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const data = await getCategoryData(resolvedParams.slug, page);

  if (!data) {
    notFound();
  }

  const { category, posts, pagination } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Google Analytics */}
      <BlogPageViewTracker />
      
      {/* JSON-LD Schema */}
      <BlogCategorySchema 
        category={category}
        posts={posts.map(post => ({
          title: post.title,
          slug: post.slug,
          publishedAt: post.publishedAt
        }))}
      />
      
      <Header variant="app" />
      
      <main className="container mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <Breadcrumbs 
          items={[
            { label: 'Блог', href: '/blog' },
            { label: category.name, href: `/blog/category/${category.slug}` }
          ]}
          className="mb-6"
        />
        
        {/* Кнопка "Назад" */}
        <Link 
          href="/blog"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Вернуться к блогу
        </Link>

        {/* Заголовок категории */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center mb-4">
            <div 
              className="w-8 h-8 rounded-full mr-3"
              style={{ backgroundColor: category.color }}
            />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              {category.name}
            </h1>
          </div>
          
          {category.description && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              {category.description}
            </p>
          )}
          
          <p className="text-gray-500">
            {category.postCount} {category.postCount === 1 ? 'статья' : 
             category.postCount < 5 ? 'статьи' : 'статей'}
          </p>
        </div>

        {/* Список статей */}
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Пагинация */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                {pagination.hasPrevPage && (
                  <Link
                    href={`/blog/category/${resolvedParams.slug}?page=${pagination.page - 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Предыдущая
                  </Link>
                )}

                <span className="text-gray-600">
                  Страница {pagination.page} из {pagination.totalPages}
                </span>

                {pagination.hasNextPage && (
                  <Link
                    href={`/blog/category/${resolvedParams.slug}?page=${pagination.page + 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Следующая
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              В этой категории пока нет статей
            </h3>
            <p className="text-gray-600 mb-8">
              Скоро здесь появится полезный контент!
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Посмотреть все статьи
            </Link>
          </div>
        )}

        {/* Другие категории */}
        <OtherCategoriesSection currentSlug={category.slug} />

        {/* CTA секция */}
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Найдите заведения из наших обзоров
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Откройте 3GIS в Telegram и найдите все заведения, упомянутые в наших статьях
          </p>
          <Link
            href="https://t.me/ThreeGIS_bot/app"
            target="_blank"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Открыть приложение
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Компонент карточки статьи
function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link 
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Изображение */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <Search className="w-12 h-12 text-blue-400" />
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-3">
          {post.title}
        </h3>
        
        <p className="text-gray-600 line-clamp-3 mb-4">
          {post.excerpt}
        </p>

        {/* Метаданные */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{post.readingTime} мин</span>
            </div>
          </div>
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            <span>{post.viewCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Компонент других категорий
async function OtherCategoriesSection({ currentSlug }: { currentSlug: string }) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blog/categories?includePostCount=true`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const otherCategories = data.categories.filter((cat: any) => cat.slug !== currentSlug);

    if (otherCategories.length === 0) {
      return null;
    }

    return (
      <div className="mt-16 bg-white rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Другие категории
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {otherCategories.map((category: any) => (
            <Link
              key={category.id}
              href={`/blog/category/${category.slug}`}
              className="group p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {category.postCount || 0} статей
                  </p>
                </div>
                <div 
                  className="w-4 h-8 rounded"
                  style={{ backgroundColor: category.color }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading other categories:', error);
    return null;
  }
}

// CSS для line-clamp
const styles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}