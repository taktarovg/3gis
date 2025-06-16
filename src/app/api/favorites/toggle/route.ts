// src/app/api/favorites/toggle/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * 3GIS API для добавления/удаления заведения из избранного
 */
export async function POST(request: NextRequest) {
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

    const { businessId } = await request.json();

    if (!businessId) {
      return NextResponse.json(
        { error: 'Не указан ID заведения' },
        { status: 400 }
      );
    }

    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId: payload.telegramId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверяем существует ли заведение
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Заведение не найдено' },
        { status: 404 }
      );
    }

    // Проверяем есть ли уже в избранном
    const existingFavorite = await prisma.businessFavorite.findUnique({
      where: {
        businessId_userId: {
          businessId: businessId,
          userId: user.id
        }
      }
    });

    let isFavorite: boolean;

    if (existingFavorite) {
      // Удаляем из избранного
      await prisma.businessFavorite.delete({
        where: {
          businessId_userId: {
            businessId: businessId,
            userId: user.id
          }
        }
      });
      isFavorite = false;
      console.log(`3GIS: Business ${businessId} removed from favorites for user ${user.id}`);
    } else {
      // Добавляем в избранное
      await prisma.businessFavorite.create({
        data: {
          businessId: businessId,
          userId: user.id
        }
      });
      isFavorite = true;
      console.log(`3GIS: Business ${businessId} added to favorites for user ${user.id}`);
    }

    return NextResponse.json({ 
      success: true,
      isFavorite,
      message: isFavorite ? 'Добавлено в избранное' : 'Удалено из избранного'
    });

  } catch (error) {
    console.error('3GIS Favorites Toggle API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при изменении избранного' },
      { status: 500 }
    );
  }
}
