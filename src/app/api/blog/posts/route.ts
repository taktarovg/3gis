import { NextRequest, NextResponse } from 'next/server';

// Функция для генерации slug из заголовка
function generateSlug(title: string): string {
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
}

// Функция для вычисления времени чтения
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// GET - получить все посты (для админки)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Моковые данные для демонстрации (пока нет полной интеграции с Supabase)
    const allPosts = [
      {
        id: 1,
        title: '10 лучших русских ресторанов в Нью-Йорке',
        slug: '10-luchshih-russkih-restoranov-v-nyu-yorke',
        excerpt: 'Подробный обзор самых популярных русскоязычных ресторанов Большого Яблока',
        content: 'Полное содержание статьи...',
        status: 'PUBLISHED',
        category: { id: 2, name: 'Обзоры заведений', color: '#3B82F6' },
        viewCount: 523,
        publishedAt: '2024-12-01T10:00:00Z',
        createdAt: '2024-11-28T15:30:00Z',
        updatedAt: '2024-12-01T10:00:00Z',
        author: { id: 1, name: '3GIS Team' },
        readingTime: 5,
        featuredImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=400&fit=crop',
        keywords: ['рестораны', 'русская кухня', 'Нью-Йорк']
      },
      {
        id: 2,
        title: 'Как найти русскоговорящего врача в США',
        slug: 'kak-najti-russkogovoryashchego-vracha-v-ssha',
        excerpt: 'Пошаговое руководство по поиску медицинской помощи на родном языке',
        content: 'Полное содержание статьи...',
        status: 'PUBLISHED',
        category: { id: 1, name: 'Гайды', color: '#10B981' },
        viewCount: 892,
        publishedAt: '2024-11-25T14:00:00Z',
        createdAt: '2024-11-20T12:00:00Z',
        updatedAt: '2024-11-25T14:00:00Z',
        author: { id: 1, name: '3GIS Team' },
        readingTime: 7,
        featuredImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
        keywords: ['врачи', 'медицина', 'русскоговорящие']
      }
    ];

    // Фильтрация по статусу
    const filteredPosts = status 
      ? allPosts.filter(post => post.status === status.toUpperCase())
      : allPosts;

    // Пагинация
    const paginatedPosts = filteredPosts.slice(offset, offset + limit);

    return NextResponse.json({
      posts: paginatedPosts,
      total: filteredPosts.length,
      hasMore: offset + limit < filteredPosts.length
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - создать новый пост
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      title,
      slug: providedSlug,
      excerpt,
      content,
      categoryId,
      metaTitle,
      metaDescription,
      keywords = [],
      featuredImage,
      featuredImageAlt,
      status = 'DRAFT',
      mentionedBusinesses = [],
      mentionedChats = []
    } = body;

    // Валидация
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Генерация slug если не предоставлен
    const slug = providedSlug || generateSlug(title);
    
    // Вычисление времени чтения
    const readingTime = calculateReadingTime(content);

    // Создание нового поста (в реальности - сохранение в БД)
    const newPost = {
      id: Date.now(), // В реальности будет автоинкремент из БД
      title,
      slug,
      excerpt: excerpt || title,
      content,
      categoryId: parseInt(categoryId) || 1,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt || title,
      keywords: Array.isArray(keywords) ? keywords : [],
      featuredImage: featuredImage || null,
      featuredImageAlt: featuredImageAlt || '',
      status: status.toUpperCase(),
      readingTime,
      viewCount: 0,
      publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: 1, // В реальности получать из сессии
      mentionedBusinesses,
      mentionedChats
    };

    console.log('✅ Blog post created:', {
      id: newPost.id,
      title: newPost.title,
      slug: newPost.slug,
      status: newPost.status
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Create blog post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}