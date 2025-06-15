// src/app/api/businesses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DistanceCalculator } from '@/lib/maps/distance-calculator';

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
    
    // Параметры геолокации
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = parseInt(searchParams.get('radius') || '10'); // км

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

    // Если есть координаты пользователя, ищем заведения с координатами
    if (lat && lng) {
      where.AND = [
        { latitude: { not: null } },
        { longitude: { not: null } }
      ];
    } else {
      // Если координат нет, фильтруем по городу
      where.city = {
        name: city
      };
    }

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
    let businesses = await prisma.business.findMany({
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
      orderBy: lat && lng ? [] : [ // Если есть геолокация, сортировку делаем потом
        { premiumTier: 'desc' }, // Премиум заведения сначала
        { rating: 'desc' },
        { reviewCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Если есть координаты пользователя, сортируем по расстоянию
    let finalBusinesses: any[] = businesses;
    
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      // Преобразуем businesses для совместимости с DistanceCalculator
      const businessesForSorting = businesses.map(business => ({
        ...business,
        latitude: business.latitude ?? undefined,
        longitude: business.longitude ?? undefined
      }));
      
      // Фильтруем заведения в радиусе и добавляем расстояние
      const businessesWithDistance = DistanceCalculator.sortByDistance(
        businessesForSorting,
        userLat,
        userLng,
        radius
      );
      
      finalBusinesses = businessesWithDistance;
    }

    // Применяем пагинацию после сортировки
    const paginatedBusinesses = finalBusinesses.slice(offset, offset + limit);
    const total = finalBusinesses.length;

    return NextResponse.json({
      businesses: paginatedBusinesses,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
      // Дополнительная информация для геолокационных запросов
      ...(lat && lng && {
        userLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
        radius,
        nearbyCount: finalBusinesses.length
      })
    });

  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Ошибка получения списка заведений' },
      { status: 500 }
    );
  }
}