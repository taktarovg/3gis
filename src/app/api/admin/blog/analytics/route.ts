import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/blog/analytics - получение статистики блога
export async function GET(request: NextRequest) {
  try {
    // Базовая статистика
    const [totalPosts, publishedPosts, draftPosts] = await Promise.all([
      // Общее количество постов
      prisma.blogPost.count(),

      // Количество опубликованных постов
      prisma.blogPost.count({
        where: { status: 'PUBLISHED' }
      }),

      // Количество черновиков
      prisma.blogPost.count({
        where: { status: 'DRAFT' }
      })
    ]);

    // Статистика по категориям
    const categoryStats = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Последние опубликованные посты
    const recentPosts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        category: {
          select: {
            name: true,
            color: true
          }
        },
        author: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 5
    });

    const stats = {
      totalPosts,
      publishedPosts,
      draftPosts,
      weeklyViews: 0, // Пока не реализовано
      monthlyViews: 0, // Пока не реализовано
      categoryStats: categoryStats.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        color: cat.color,
        postsCount: cat._count.posts
      })),
      recentPosts: recentPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        publishedAt: post.publishedAt,
        viewCount: post.viewCount,
        category: post.category,
        author: {
          name: `${post.author.firstName} ${post.author.lastName}`.trim()
        }
      }))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Ошибка получения аналитики блога:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить статистику' },
      { status: 500 }
    );
  }
}
