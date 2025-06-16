import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, // 'owner' | 'community'
      name,
      category,
      description,
      address,
      city,
      phone,
      website,
      languages = ['ru'],
      features = [],
      photos = []
    } = body;

    // Валидация обязательных полей
    if (!name || !category || !address || !city) {
      return NextResponse.json(
        { error: 'Не заполнены обязательные поля' },
        { status: 400 }
      );
    }

    // Проверяем существование категории
    const categoryExists = await prisma.businessCategory.findFirst({
      where: { slug: category }
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 400 }
      );
    }

    // Проверяем существование города
    const cityExists = await prisma.city.findFirst({
      where: { name: city }
    });

    if (!cityExists) {
      return NextResponse.json(
        { error: 'Город не найден' },
        { status: 400 }
      );
    }

    // Создаем заведение
    const newBusiness = await prisma.business.create({
      data: {
        name,
        description,
        address,
        phone: phone || null,
        website: website || null,
        languages,
        
        // Связи
        categoryId: categoryExists.id,
        cityId: cityExists.id,
        ownerId: 1, // TODO: Получать из авторизации
        
        // Статус в зависимости от типа
        status: type === 'owner' ? 'PENDING' : 'PENDING', // Обе на модерации
        isVerified: false,
        premiumTier: type === 'owner' ? 'BASIC' : 'FREE',
        
        // Дополнительные поля
        hasParking: features.includes('parking'),
        hasWiFi: features.includes('wifi'),
        hasDelivery: features.includes('delivery'),
        acceptsCards: features.includes('cards'),
        isAccessible: features.includes('accessible'),
      },
      include: {
        category: true,
        city: true
      }
    });

    // Если есть фотографии, добавляем их
    if (photos.length > 0) {
      await Promise.all(
        photos.map((photoUrl: string, index: number) =>
          prisma.businessPhoto.create({
            data: {
              url: photoUrl,
              businessId: newBusiness.id,
              order: index
            }
          })
        )
      );
    }

    // Успешный ответ с разными сообщениями
    const message = type === 'owner' 
      ? 'Ваш бизнес отправлен на модерацию. Мы свяжемся с вами в течение 24 часов.'
      : 'Спасибо за помощь сообществу! Место будет добавлено после проверки.';

    const points = type === 'community' 
      ? { points: 5 + (photos.length * 2) } // 5 за место + 2 за каждое фото
      : null;

    return NextResponse.json({
      success: true,
      message,
      business: {
        id: newBusiness.id,
        name: newBusiness.name,
        status: newBusiness.status
      },
      points
    });

  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}