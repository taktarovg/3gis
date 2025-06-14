// src/app/api/businesses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Параметры поиска
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const city = searchParams.get('city') || 'New York'; // По умолчанию Нью-Йорк
    const filter = searchParams.get('filter');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Строим where условие
    const where: any = {
      status: 'ACTIVE'
    };

    // Фильтр по категории
    if (category) {
      where.category = {
        slug: category
      };
    }

    // Поиск по тексту
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Фильтр по городу
    where.city = {
      name: city
    };

    // Специальные фильтры
    if (filter === 'russian') {
      where.languages = {
        has: 'ru'
      };
    }

    if (filter === 'open_now') {
      // TODO: Добавить логику проверки часов работы
      // Пока просто фильтруем те, у кого есть часы работы
      where.businessHours = {
        not: null
      };
    }

    // Получаем заведения
    const businesses = await prisma.business.findMany({
      where,
      include: {
        category: true,
        city: true,
        photos: {
          take: 1,
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            reviews: true,
            favorites: true
          }
        }
      },
      orderBy: [
        { premiumTier: 'desc' }, // Премиум заведения сначала
        { rating: 'desc' },
        { reviewCount: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    });

    // Получаем общее количество для пагинации
    const total = await prisma.business.count({ where });

    return NextResponse.json({
      businesses,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    });

  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Ошибка получения списка заведений' },
      { status: 500 }
    );
  }
}