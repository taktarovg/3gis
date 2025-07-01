// src/app/api/favorites/chats/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

/**
 * GET /api/favorites/chats/status?chatId=123 - Проверить статус избранного для конкретного чата
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Требуется авторизация' }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const chatIdParam = searchParams.get('chatId');

    if (!chatIdParam) {
      return NextResponse.json(
        { error: 'Не указан ID чата' },
        { status: 400 }
      );
    }

    const chatId = parseInt(chatIdParam, 10);
    if (isNaN(chatId)) {
      return NextResponse.json(
        { error: 'Некорректный ID чата' },
        { status: 400 }
      );
    }

    // Проверяем существование чата
    const chat = await prisma.telegramChat.findUnique({
      where: { 
        id: chatId,
        status: 'ACTIVE',
        isActive: true
      },
      select: { 
        id: true, 
        title: true,
        _count: {
          select: { favorites: true }
        }
      }
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Чат не найден' },
        { status: 404 }
      );
    }

    // Проверяем, добавлен ли в избранное текущим пользователем
    const favorite = await prisma.chatFavorite.findUnique({
      where: {
        chatId_userId: {
          chatId: chatId,
          userId: user.userId
        }
      }
    });

    return NextResponse.json({
      chatId,
      isFavorite: !!favorite,
      favoritesCount: chat._count.favorites,
      title: chat.title
    });

  } catch (error) {
    console.error('Error checking chat favorite status:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка проверки статуса избранного',
        chatId: null,
        isFavorite: false,
        favoritesCount: 0
      }, 
      { status: 500 }
    );
  }
}
