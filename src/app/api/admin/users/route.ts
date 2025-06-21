import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API для получения списка пользователей в админке
 */
export async function GET(request: NextRequest) {
  try {
    // Простая проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer charlotte-admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    // Условия фильтрации
    let whereClause: any = {};
    
    if (role && role !== 'all') {
      whereClause.role = role.toUpperCase();
    }

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { telegramId: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Получаем пользователей с пагинацией
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          city: true,
          _count: {
            select: {
              businesses: true,
              reviews: true,
              favorites: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения пользователей' },
      { status: 500 }
    );
  }
}
