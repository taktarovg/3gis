import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, 
  Clock, 
  Eye, 
  ArrowLeft, 
  Share2, 
  User,
  MapPin,
  Phone,
  Users
} from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { MentionedBusinesses, MentionedChats, RelatedPosts } from '@/components/blog/MentionedContent';
import { BlogPostSchema } from '@/components/blog/BlogSchema';
import { BlogPageViewTracker } from '@/components/analytics/GoogleAnalytics';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  featuredImage?: string;
  featuredImageAlt?: string;
  viewCount: number;
  readingTime: number;
  publishedAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
    color: string;
  };
  author: {
    name: string;
    avatar?: string;
  };
  mentionedBusinesses: Array<{
    id: number;
    name: string;
    category: string;
    city: string;
  }>;
  mentionedChats: Array<{
    id: number;
    title: string;
    description: string;
    memberCount: number;
    telegramLink: string;
  }>;
  relatedPosts: Array<{
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage?: string;
    readingTime: number;
    publishedAt: string;
    category: {
      name: string;
      color: string;
    };
    author: {
      name: string;
    };
  }>;
}

// Получение данных поста
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blog/posts/${slug}`, {
      next: { revalidate: 300 } // Кэш на 5 минут
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch blog post');
    }

    const data = await response.json();
    return data.post;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Генерация метаданных для SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: 'Статья не найдена | 3GIS',
      description: 'Запрашиваемая статья не найдена'
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://3gis.us';
  const url = `${baseUrl}/blog/${post.slug}`;

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [
        {
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.featuredImageAlt || post.title
        }
      ] : [],
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      section: post.category.name,
      url
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : []
    },
    alternates: {
      canonical: url
    }
  };
}

// Статическая генерация параметров (опционально)
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blog/posts?limit=100`);
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.posts.map((post: any) => ({
      slug: post.slug
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://3gis.us';
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Google Analytics и Schema */}
      <BlogPageViewTracker 
        postId={post.id}
        postTitle={post.title}
        category={post.category.name}
      />
      <BlogPostSchema post={post} baseUrl={baseUrl} />
      
      <Header variant="app" />
      
      <main className="container mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <Breadcrumbs 
          items={[
            { label: 'Блог', href: '/blog' },
            { label: post.category.name, href: `/blog/category/${post.category.slug}` },
            { label: post.title, href: `/blog/${post.slug}` }
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

        {/* Основной контент */}
        <article className="max-w-4xl mx-auto">
          {/* Заголовок статьи */}
          <header className="mb-8">
            {/* Категория */}
            <div className="mb-4">
              <Link 
                href={`/blog/category/${post.category.slug}`}
                className="inline-block px-3 py-1 text-sm font-medium text-white rounded-full"
                style={{ backgroundColor: post.category.color }}
              >
                {post.category.name}
              </Link>
            </div>

            {/* Заголовок */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Метаданные */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                <span>{post.author.name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </time>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>{post.readingTime} мин чтения</span>
              </div>
              <div className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                <span>{post.viewCount.toLocaleString()} просмотров</span>
              </div>
            </div>

            {/* Кнопки "Поделиться" */}
            <div className="flex items-center justify-between border-t border-b border-gray-200 py-4">
              <p className="text-lg text-gray-700 max-w-2xl">
                {post.excerpt}
              </p>
              <ShareButtons 
                postId={post.id}
                title={post.title}
                url={postUrl}
                description={post.excerpt}
              />
            </div>
          </header>

          {/* Изображение статьи */}
          {post.featuredImage && (
            <div className="mb-8">
              <Image
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                width={1200}
                height={630}
                className="w-full h-auto rounded-lg shadow-lg"
                priority
              />
            </div>
          )}

          {/* Содержание статьи */}
          <div className="prose prose-lg max-w-none mb-12">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }: {
                  node?: any;
                  className?: string;
                  children?: React.ReactNode;
                  [key: string]: any;
                }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !node || node.tagName !== 'pre';
                  
                  return !isInline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                // Кастомные стили для изображений
                img: ({ src, alt, ...props }) => {
                  // Извлекаем width и height из props или устанавливаем значения по умолчанию
                  const width = props.width ? Number(props.width) : 800;
                  const height = props.height ? Number(props.height) : 600;
                  
                  return (
                    <Image
                      src={src || ''}
                      alt={alt || ''}
                      width={width}
                      height={height}
                      className="rounded-lg shadow-md"
                    />
                  );
                },
                // Кастомные стили для ссылок
                a: ({ href, children, ...props }) => (
                  <Link 
                    href={href || '#'}
                    className="text-blue-600 hover:text-blue-800 underline"
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    {...props}
                  >
                    {children}
                  </Link>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Упомянутые заведения */}
          <MentionedBusinesses 
            businesses={post.mentionedBusinesses}
            postId={post.id}
          />

          {/* Упомянутые чаты */}
          <MentionedChats 
            chats={post.mentionedChats}
            postId={post.id}
          />

          {/* Теги/Ключевые слова */}
          {post.keywords.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ключевые слова
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Кнопки "Поделиться" в конце статьи */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Понравилась статья?
              </h3>
              <ShareButtons 
                postId={post.id}
                title={post.title}
                url={postUrl}
                description={post.excerpt}
              />
            </div>
          </div>
        </article>

        {/* Похожие статьи */}
        <RelatedPosts 
          posts={post.relatedPosts}
          currentPostId={post.id}
        />

        {/* CTA секция */}
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Найдите больше заведений в приложении
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Откройте 3GIS в Telegram и найдите тысячи проверенных русскоязычных заведений по всей Америке
          </p>
          <Link
            href="https://t.me/ThreeGIS_bot/app"
            target="_blank"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Открыть 3GIS
            <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// CSS для prose стилей
const styles = `
  .prose {
    color: #374151;
    line-height: 1.75;
  }
  .prose h2 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: #111827;
  }
  .prose h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    color: #111827;
  }
  .prose p {
    margin-bottom: 1.25rem;
  }
  .prose ul, .prose ol {
    margin-bottom: 1.25rem;
    padding-left: 1.5rem;
  }
  .prose li {
    margin-bottom: 0.5rem;
  }
  .prose blockquote {
    font-style: italic;
    border-left: 4px solid #3B82F6;
    padding-left: 1rem;
    margin: 1.5rem 0;
    color: #6B7280;
  }
  .prose code {
    background-color: #F3F4F6;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  }
  .prose pre {
    background-color: #1F2937;
    color: #F9FAFB;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1.5rem 0;
  }
  .prose pre code {
    background-color: transparent;
    padding: 0;
    color: inherit;
  }
  .prose table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
  }
  .prose th, .prose td {
    border: 1px solid #E5E7EB;
    padding: 0.75rem;
    text-align: left;
  }
  .prose th {
    background-color: #F9FAFB;
    font-weight: 600;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
