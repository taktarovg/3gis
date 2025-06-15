// src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * 3GIS API для получения избранных заведений пользователя
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Неверный токен авторизации' },
        { status: 401 }
      );
    }

    // Получаем избранные заведения пользователя
    const favorites = await prisma.businessFavorite.findMany({
      where: {
        user: { telegramId: payload.telegramId }
      },
      include: {
        business: {
          include: {
            category: true,
            city: true,
            photos: {
              orderBy: { order: 'asc' },
              take: 1
            },
            _count: {
              select: { reviews: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Преобразуем в нужный формат
    const formattedFavorites = favorites.map(fav => ({
      id: fav.business.id,
      name: fav.business.name,
      category: {
        name: fav.business.category.name,
        icon: fav.business.category.icon
      },
      city: {
        name: fav.business.city.name,
        state: fav.business.city.state
      },
      address: fav.business.address,
      phone: fav.business.phone,
      rating: fav.business.rating,
      reviewCount: fav.business._count.reviews,
      photos: fav.business.photos.map(p => ({ url: p.url })),
      addedAt: fav.createdAt
    }));

    return NextResponse.json({ 
      favorites: formattedFavorites,
      count: formattedFavorites.length
    });

  } catch (error) {
    console.error('3GIS Favorites API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении избранных заведений' },
      { status: 500 }
    );
  }
}
