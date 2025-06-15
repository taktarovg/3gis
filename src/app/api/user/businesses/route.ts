// src/app/api/user/businesses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * 3GIS API для получения заведений, добавленных пользователем
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

    // Получаем заведения, добавленные пользователем
    const businesses = await prisma.business.findMany({
      where: {
        owner: { telegramId: payload.telegramId }
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Преобразуем в нужный формат
    const formattedBusinesses = businesses.map(business => ({
      id: business.id,
      name: business.name,
      category: {
        name: business.category.name,
        icon: business.category.icon
      },
      city: {
        name: business.city.name,
        state: business.city.state
      },
      address: business.address,
      status: business.status,
      premiumTier: business.premiumTier,
      isVerified: business.isVerified,
      viewCount: business.viewCount,
      rating: business.rating,
      reviewCount: business._count.reviews,
      photos: business.photos.map(p => ({ url: p.url })),
      createdAt: business.createdAt
    }));

    return NextResponse.json({ 
      businesses: formattedBusinesses,
      count: formattedBusinesses.length
    });

  } catch (error) {
    console.error('3GIS User Businesses API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении ваших заведений' },
      { status: 500 }
    );
  }
}
