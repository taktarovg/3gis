// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * 3GIS Endpoint для проверки валидности JWT-токена
 * Возвращает 200 OK, если токен действителен
 * Возвращает 401 Unauthorized, если токен недействителен или истек
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

    // Проверяем существует ли пользователь в 3GIS
    const user = await prisma.user.findUnique({
      where: { telegramId: payload.telegramId },
      include: {
        city: true,
        businesses: {
          include: { category: true }
        },
        favorites: {
          include: { business: { include: { category: true } } }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Обновляем время последней активности
    await prisma.user.update({
      where: { telegramId: payload.telegramId },
      data: { lastSeenAt: new Date() }
    });

    // Токен валиден и пользователь существует
    return NextResponse.json({ 
      valid: true,
      telegramId: payload.telegramId,
      userId: payload.userId,
      // role: payload.role, // Удаляем, так как нет в JWTPayload
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        avatar: user.avatar,
        role: user.role, // Берем role из базы данных
        city: user.city,
        businessCount: user.businesses.length,
        favoritesCount: user.favorites.length,
      }
    });
  } catch (error) {
    console.error('3GIS Auth: Ошибка проверки токена:', error);
    return NextResponse.json(
      { error: 'Ошибка проверки токена', details: error instanceof Error ? error.message : 'Неизвестная ошибка' },
      { status: 500 }
    );
  }
}
