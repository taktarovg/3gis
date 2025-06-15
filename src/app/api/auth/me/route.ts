// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromHeader, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me - Получение информации о текущем пользователе
 * Используется для проверки валидности токена и загрузки актуальных данных
 */
export async function GET(request: NextRequest) {
  try {
    // Извлекаем и проверяем токен
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = requireAuth(token);

    // Получаем актуальные данные пользователя из БД
    const user = await prisma.user.findUnique({
      where: { 
        id: payload.userId 
      },
      include: {
        city: true,
        businesses: {
          include: { 
            category: true, 
            city: true 
          }
        },
        favorites: {
          include: { 
            business: { 
              include: { 
                category: true 
              } 
            } 
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Обновляем время последней активности
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    
    if (error instanceof Error && error.message.includes('Токен')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка сервера при получении данных пользователя' },
      { status: 500 }
    );
  }
}
