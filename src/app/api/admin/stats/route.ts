import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API для получения статистики админки
 * Простая авторизация через заголовок
 */
export async function GET(request: NextRequest) {
  try {
    // Простая проверка авторизации (в реальном проекте было бы сложнее)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer charlotte-admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем статистику из БД параллельно
    const [
      totalUsers,
      totalBusinesses,
      totalReviews,
      totalFavorites,
      pendingBusinesses,
      activeBusinesses,
      recentUsers,
      recentBusinesses,
      businessesByCategory,
      topCities
    ] = await Promise.all([
      // Общая статистика
      prisma.user.count(),
      prisma.business.count(),
      prisma.businessReview.count(),
      prisma.businessFavorite.count(),
      
      // Статистика заведений
      prisma.business.count({ where: { status: 'PENDING' } }),
      prisma.business.count({ where: { status: 'ACTIVE' } }),
      
      // Недавние пользователи (последние 7 дней)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Недавние заведения (последние 7 дней)
      prisma.business.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Заведения по категориям
      prisma.businessCategory.findMany({
        include: {
          _count: {
            select: { businesses: true }
          }
        },
        orderBy: {
          businesses: {
            _count: 'desc'
          }
        }
      }),
      
      // Топ городов по количеству заведений
      prisma.city.findMany({
        include: {
          _count: {
            select: { businesses: true }
          }
        },
        orderBy: {
          businesses: {
            _count: 'desc'
          }
        },
        take: 10
      })
    ]);

    const stats = {
      overview: {
        totalUsers,
        totalBusinesses,
        totalReviews,
        totalFavorites,
        pendingBusinesses,
        activeBusinesses,
        recentUsers,
        recentBusinesses,
      },
      categories: businessesByCategory.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        count: cat._count.businesses
      })),
      cities: topCities.map(city => ({
        name: city.name,
        state: city.state,
        count: city._count.businesses
      })),
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения статистики' },
      { status: 500 }
    );
  }
}
