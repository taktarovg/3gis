// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, createToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    // Получаем токен из заголовков или cookies
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    let currentToken: string | null = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      currentToken = authHeader.substring(7);
    } else if (cookieHeader) {
      // Парсим cookies для поиска токена
      const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      }, {});
      
      currentToken = cookies['3gis_auth_token'] || cookies['auth_token'];
    }
    
    if (!currentToken) {
      return NextResponse.json(
        { error: 'Токен авторизации отсутствует' },
        { status: 401 }
      );
    }
    
    // Верифицируем текущий токен
    const payload = verifyToken(currentToken);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Недействительный токен' },
        { status: 401 }
      );
    }
    
    // Получаем актуальные данные пользователя из БД
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    // Создаем новый токен
    const newToken = createToken({
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isPremium: user.isPremium,
        language: user.language || 'ru'
      }
    });
    
    logger.logAuth(`Token refreshed for user ${user.telegramId}`);
    
    return NextResponse.json({
      token: newToken,
      user
    });
    
  } catch (error) {
    logger.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления токена' },
      { status: 500 }
    );
  }
}
