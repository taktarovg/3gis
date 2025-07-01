import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, User, Eye, ArrowRight, Search } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { BlogSchema } from '@/components/blog/BlogSchema';
import { BlogPageViewTracker } from '@/components/analytics/GoogleAnalytics';

// Получение данных блога
async function getBlogData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Получение постов и категорий параллельно
    const [postsResponse, categoriesResponse] = await Promise.all([
      fetch(`${baseUrl}/api/blog/posts?limit=12`, {
        next: { revalidate: 300 } // Кэш на 5 минут
      }),
      fetch(`${baseUrl}/api/blog/categories?includePostCount=true`, {
        next: { revalidate: 3600 } // Кэш на 1 час
      })
    ]);

    if (!postsResponse.ok || !categoriesResponse.ok) {
      throw new Error('Failed to fetch blog data');
    }

    const [postsData, categoriesData] = await Promise.all([
      postsResponse.json(),
      categoriesResponse.json()
    ]);

    return {
      posts: postsData.posts || [],
      categories: categoriesData.categories || [],
      pagination: postsData.pagination
    };
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return {
      posts: [],
      categories: [],
      pagination: null
    };
  }
}

// Метаданные для SEO
export const metadata = {
  title: 'Блог 3GIS - Полезные статьи для русскоговорящих в США',
  description: 'Читайте наш блог о жизни в Америке, обзоры русскоязычных заведений, гайды по адаптации и полезные советы для иммигрантов.',
  keywords: ['блог 3gis', 'русские в америке', 'иммиграция сша', 'русскоязычные услуги', 'жизнь в америке'],
  openGraph: {
    title: 'Блог 3GIS - Твой помощник в Америке',
    description: 'Полезные статьи, обзоры заведений и гайды для русскоговорящих американцев',
    images: ['/og-blog.jpg'],
    type: 'website'
  }
};

export default async function BlogPage() {
  const { posts, categories } = await getBlogData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Google Analytics */}
      <BlogPageViewTracker />
      
      {/* JSON-LD Schema */}
      <BlogSchema posts={posts} />
      
      <Header variant="app" />
      
      <main className="container mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <Breadcrumbs 
          items={[
            { label: 'Блог', href: '/blog' }
          ]}
          className="mb-6"
        />
        
        {/* Заголовок и описание */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Блог 3GIS
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Полезные статьи о жизни в Америке, обзоры русскоязычных заведений 
            и гайды по адаптации для русскоговорящих иммигрантов
          </p>
        </div>
        
        {/* Категории */}
        {categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Категории</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog/category/${category.slug}`}
                  className="group p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
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
        )}
        
        {/* Список статей */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Скоро здесь появятся статьи
            </h3>
            <p className="text-gray-600">
              Мы готовим полезный контент для вас!
            </p>
          </div>
        )}
        
        {/* CTA секция */}
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Найдите русскоязычные услуги в приложении
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Откройте 3GIS в Telegram и найдите врачей, рестораны, юристов 
            и другие услуги рядом с вами
          </p>
          <Link
            href="https://t.me/ThreeGIS_bot/app"
            target="_blank"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Открыть приложение
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Компонент карточки статьи
function BlogPostCard({ post }: { post: any }) {
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
        
        {/* Категория бейдж */}
        <div className="absolute top-3 left-3">
          <span 
            className="px-3 py-1 text-sm font-medium text-white rounded-full"
            style={{ backgroundColor: post.category.color }}
          >
            {post.category.name}
          </span>
        </div>
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