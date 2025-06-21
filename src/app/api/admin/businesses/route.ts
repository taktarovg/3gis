import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API для работы с заведениями в админке
 */
export async function GET(request: NextRequest) {
  try {
    // Простая проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer charlotte-admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    // Условия фильтрации
    let whereClause: any = {};
    
    if (status !== 'all') {
      whereClause.status = status.toUpperCase();
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { owner: { firstName: { contains: search, mode: 'insensitive' } } },
        { owner: { lastName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Получаем заведения с пагинацией
    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where: whereClause,
        include: {
          category: true,
          city: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              telegramId: true
            }
          },
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
          { status: 'asc' }, // PENDING сначала
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.business.count({ where: whereClause })
    ]);

    return NextResponse.json({
      businesses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin businesses error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения заведений' },
      { status: 500 }
    );
  }
}

/**
 * Обновление статуса заведения (модерация)
 */
export async function PATCH(request: NextRequest) {
  try {
    // Простая проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer charlotte-admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, status, reason } = body;

    if (!businessId || !status) {
      return NextResponse.json(
        { error: 'Требуется ID заведения и новый статус' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Недопустимый статус' },
        { status: 400 }
      );
    }

    // Обновляем статус заведения
    const updatedBusiness = await prisma.business.update({
      where: { id: parseInt(businessId) },
      data: {
        status: status,
        updatedAt: new Date(),
        // В будущем можно добавить поле moderationReason
      },
      include: {
        category: true,
        city: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            telegramId: true
          }
        }
      }
    });

    // Здесь можно добавить отправку уведомления владельцу
    // через Telegram Bot API о смене статуса

    return NextResponse.json({
      success: true,
      business: updatedBusiness,
      message: `Статус заведения изменен на ${status}`
    });

  } catch (error) {
    console.error('Admin business update error:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления заведения' },
      { status: 500 }
    );
  }
}
