import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - список всех постов для админки
export async function GET(request: NextRequest) {
  try {
    // В реальности здесь будет проверка авторизации админа
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Требуется авторизация админа' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Параметры запроса
    const status = searchParams.get('status'); // 'all', 'published', 'draft'
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Базовый фильтр
    const where: any = {};

    // Фильтр по статусу
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Фильтр по категории
    if (category) {
      where.category = {
        slug: category
      };
    }

    // Поиск
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
        }
      ];
    }

    // Получение постов с подробной информацией
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
          { updatedAt: 'desc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.blogPost.count({ where })
    ]);

    // Форматирование данных
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      status: post.status,
      featuredImage: post.featuredImage,
      viewCount: post.viewCount,
      readingTime: post.readingTime,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      category: post.category,
      author: {
        id: post.author.id,
        name: `${post.author.firstName} ${post.author.lastName}`.trim(),
        avatar: post.author.avatar
      },
      mentionedCount: {
        businesses: post._count.mentionedBusinesses,
        chats: post._count.mentionedChats
      }
    }));

    // Статистика для админки
    const stats = await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
      prisma.blogPost.count({ where: { status: 'DRAFT' } }),
      prisma.blogPost.aggregate({
        _sum: {
          viewCount: true
        },
        where: {
          publishedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Последние 7 дней
          }
        }
      })
    ]);

    const blogStats = {
      totalPosts: stats[0],
      publishedPosts: stats[1],
      draftPosts: stats[2],
      weeklyViews: stats[3]._sum.viewCount || 0
    };

    // Метаданные пагинации
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      posts: formattedPosts,
      stats: blogStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: {
        status,
        category,
        search
      }
    });

  } catch (error) {
    console.error('Admin blog posts API error:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при получении статей',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// POST - автосохранение черновика
export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ...postData } = body;

    if (action === 'autosave') {
      // Автосохранение существующего поста
      if (!postData.id) {
        return NextResponse.json(
          { error: 'ID поста не указан для автосохранения' },
          { status: 400 }
        );
      }

      const updatedPost = await prisma.blogPost.update({
        where: { id: postData.id },
        data: {
          title: postData.title || '',
          excerpt: postData.excerpt || '',
          content: postData.content || '',
          updatedAt: new Date()
        },
        select: {
          id: true,
          updatedAt: true
        }
      });

      return NextResponse.json({
        success: true,
        autosaved: true,
        updatedAt: updatedPost.updatedAt
      });
    }

    // Создание нового поста (из основного API)
    return NextResponse.json(
      { error: 'Используйте /api/blog/posts для создания новых постов' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Admin blog post action error:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при выполнении действия',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}