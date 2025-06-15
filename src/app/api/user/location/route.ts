// src/app/api/user/location/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromHeader, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/user/location - Обновление геолокации пользователя
 */
export async function PATCH(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = requireAuth(token);

    // Получаем данные из запроса
    const body = await request.json();
    const { latitude, longitude } = body;

    // Валидация координат
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Некорректные координаты' },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Координаты вне допустимого диапазона' },
        { status: 400 }
      );
    }

    // Обновляем геолокацию пользователя
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        latitude,
        longitude,
        lastSeenAt: new Date(),
      },
      include: {
        city: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Геолокация обновлена',
      location: {
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude,
      },
    });
  } catch (error) {
    console.error('Error updating user location:', error);
    
    if (error instanceof Error && error.message.includes('Токен')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при обновлении геолокации' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/location - Получение текущей геолокации пользователя
 */
export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = requireAuth(token);

    // Получаем данные пользователя
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        latitude: true,
        longitude: true,
        city: {
          select: {
            name: true,
            state: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      location: {
        latitude: user.latitude,
        longitude: user.longitude,
      },
      city: user.city,
    });
  } catch (error) {
    console.error('Error getting user location:', error);
    
    if (error instanceof Error && error.message.includes('Токен')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при получении геолокации' },
      { status: 500 }
    );
  }
}
