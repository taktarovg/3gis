import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      nameEn,
      description,
      categoryId,
      address,
      cityId,
      phone,
      website,
      email,
      languages = ['ru', 'en'],
      hasParking = false,
      hasWiFi = false,
      acceptsCrypto = false,
      businessHours,
      ownerId,
      photos = []
    } = body;

    // Валидация обязательных полей
    if (!name || !categoryId || !address || !cityId || !ownerId) {
      return NextResponse.json(
        { error: 'Обязательные поля: name, categoryId, address, cityId, ownerId' },
        { status: 400 }
      );
    }

    // Проверяем существование категории
    const category = await prisma.businessCategory.findUnique({
      where: { id: parseInt(categoryId) }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 400 }
      );
    }

    // Проверяем существование города
    const city = await prisma.city.findUnique({
      where: { id: parseInt(cityId) }
    });

    if (!city) {
      return NextResponse.json(
        { error: 'Город не найден' },
        { status: 400 }
      );
    }

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: parseInt(ownerId) }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 400 }
      );
    }

    // Создаем заведение в транзакции
    const business = await prisma.$transaction(async (tx) => {
      // Создаем заведение
      const newBusiness = await tx.business.create({
        data: {
          name,
          nameEn: nameEn || null,
          description: description || null,
          categoryId: parseInt(categoryId),
          address,
          cityId: parseInt(cityId),
          stateId: city.stateId, // Автоматически определяем штат из города
          state: city.state,
          phone: phone || null,
          website: website || null,
          email: email || null,
          languages,
          hasParking,
          hasWiFi,
          acceptsCrypto,
          businessHours: businessHours || null,
          ownerId: parseInt(ownerId),
          status: 'PENDING' // Требует модерации
        },
        include: {
          category: true,
          city: true,
          owner: true
        }
      });

      // Добавляем фотографии если есть
      if (photos.length > 0) {
        await Promise.all(
          photos.map(async (photoUrl: string, index: number) => {
            return tx.businessPhoto.create({
              data: {
                url: photoUrl,
                order: index,
                businessId: newBusiness.id,
                s3Key: extractS3KeyFromUrl(photoUrl),
                format: 'webp'
              }
            });
          })
        );
      }

      return newBusiness;
    });

    // Возвращаем созданное заведение с фотографиями
    const businessWithPhotos = await prisma.business.findUnique({
      where: { id: business.id },
      include: {
        category: true,
        city: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        },
        photos: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            reviews: true,
            favorites: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      business: businessWithPhotos,
      message: 'Заведение успешно создано и отправлено на модерацию'
    });

  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = parseInt(searchParams.get('radius') || '10');
    const filter = searchParams.get('filter');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Базовые условия поиска
    let whereClause: any = {
      status: 'ACTIVE'
    };

    // Фильтр по категории
    if (category) {
      whereClause.category = {
        slug: category
      };
    }

    // Фильтр по городу
    if (city) {
      whereClause.city = {
        name: city
      };
    }

    // Поиск по названию и описанию
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Фильтр по особенностям
    if (filter) {
      switch (filter) {
        case 'russian':
          whereClause.languages = {
            has: 'ru'
          };
          break;
        case 'parking':
          whereClause.hasParking = true;
          break;
        case 'wifi':
          whereClause.hasWiFi = true;
          break;
        case 'crypto':
          whereClause.acceptsCrypto = true;
          break;
      }
    }

    // Получаем заведения
    const businesses = await prisma.business.findMany({
      where: whereClause,
      include: {
        category: true,
        city: true,
        photos: {
          orderBy: { order: 'asc' },
          take: 1 // Только первое фото для списка
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
        { isVerified: 'desc' },  // Верифицированные сначала
        { rating: 'desc' },      // По рейтингу
        { createdAt: 'desc' }    // Новые сначала
      ],
      take: limit,
      skip: offset
    });

    // Если есть координаты пользователя, добавляем расстояние
    let businessesWithDistance = businesses;
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      businessesWithDistance = businesses
        .filter(b => b.latitude && b.longitude)
        .map(business => ({
          ...business,
          distance: calculateDistance(
            userLat, userLng,
            business.latitude!, business.longitude!
          )
        }))
        .filter(b => b.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    }

    // Получаем общее количество для пагинации
    const total = await prisma.business.count({ where: whereClause });

    return NextResponse.json({
      businesses: businessesWithDistance,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении списка заведений' },
      { status: 500 }
    );
  }
}

/**
 * Извлечение S3 ключа из URL
 */
function extractS3KeyFromUrl(url: string): string {
  try {
    const urlParts = url.split('/');
    const bucketIndex = urlParts.findIndex(part => part.includes('3gis-photos'));
    return urlParts.slice(bucketIndex + 1).join('/');
  } catch {
    return '';
  }
}

/**
 * Расчет расстояния по формуле Haversine
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Радиус Земли в км
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
