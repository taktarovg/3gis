import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Параметры запроса
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Базовый фильтр - только опубликованные статьи
    const where: any = {
      status: 'PUBLISHED'
    };

    // Фильтр по категории
    if (category) {
      where.category = {
        slug: category
      };
    }

    // Поиск по заголовку и содержанию
    if (search && search.length >= 2) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          excerpt: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Получение постов с пагинацией
    const [posts, totalCount] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          },
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          _count: {
            select: {
              mentionedBusinesses: true,
              mentionedChats: true
            }
          }
        },
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.blogPost.count({ where })
    ]);

    // Форматирование данных для фронтенда
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      featuredImageAlt: post.featuredImageAlt,
      viewCount: post.viewCount,
      readingTime: post.readingTime,
      publishedAt: post.publishedAt,
      category: post.category,
      author: {
        name: `${post.author.firstName} ${post.author.lastName}`.trim(),
        avatar: post.author.avatar
      },
      mentionedCount: {
        businesses: post._count.mentionedBusinesses,
        chats: post._count.mentionedChats
      }
    }));

    // Метаданные пагинации
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        category,
        search
      }
    });

  } catch (error) {
    console.error('Blog posts API error:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при получении статей блога',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// POST - создание нового поста (только для админов)
export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации (в реальности будет проверка JWT токена)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Валидация обязательных полей
    if (!body.title || !body.content || !body.categoryId || !body.authorId) {
      return NextResponse.json(
        { error: 'Не все обязательные поля заполнены' },
        { status: 400 }
      );
    }

    // Генерация slug, если не указан
    let slug = body.slug;
    if (!slug) {
      slug = generateSlug(body.title);
      
      // Проверка уникальности slug
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug }
      });
      
      if (existingPost) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Расчет времени чтения (примерно 200 слов в минуту)
    const readingTime = Math.max(1, Math.ceil(body.content.split(' ').length / 200));

    // Создание поста
    const newPost = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt || '',
        content: body.content,
        categoryId: parseInt(body.categoryId),
        authorId: parseInt(body.authorId),
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        keywords: body.keywords || [],
        featuredImage: body.featuredImage || null,
        featuredImageAlt: body.featuredImageAlt || null,
        readingTime,
        status: body.status || 'DRAFT',
        publishedAt: body.status === 'PUBLISHED' ? new Date() : null
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Создание связей с заведениями и чатами
    if (body.mentionedBusinesses && body.mentionedBusinesses.length > 0) {
      await prisma.blogPostBusiness.createMany({
        data: body.mentionedBusinesses.map((businessId: number) => ({
          blogPostId: newPost.id,
          businessId
        }))
      });
    }

    if (body.mentionedChats && body.mentionedChats.length > 0) {
      await prisma.blogPostChat.createMany({
        data: body.mentionedChats.map((chatId: number) => ({
          blogPostId: newPost.id,
          chatId
        }))
      });
    }

    return NextResponse.json({
      success: true,
      post: {
        id: newPost.id,
        slug: newPost.slug,
        status: newPost.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create blog post error:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при создании статьи',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// Функция генерации slug
function generateSlug(title: string): string {
  const translitMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };

  return title
    .toLowerCase()
    .replace(/[а-я]/g, (char) => translitMap[char] || char)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100); // Ограничение длины
}