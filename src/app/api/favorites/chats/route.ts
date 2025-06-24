import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

/**
 * GET /api/favorites/chats - Получить список избранных чатов
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

    // Получаем избранные чаты пользователя
    const favoriteChats = await prisma.chatFavorite.findMany({
      where: {
        userId: user.userId
      },
      include: {
        chat: {
          include: {
            city: {
              select: { name: true }
            },
            state: {
              select: { name: true }
            },
            _count: {
              select: { favorites: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Форматируем данные для фронтенда
    const formattedChats = favoriteChats
      .filter(fav => fav.chat.status === 'ACTIVE' && fav.chat.isActive)
      .map(fav => fav.chat);

    return NextResponse.json(formattedChats);

  } catch (error) {
    console.error('Error fetching favorite chats:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка получения избранных чатов',
        data: []
      }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/favorites/chats - Добавить чат в избранное
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Требуется авторизация' }, 
        { status: 401 }
      );
    }

    const { chatId } = await request.json();

    if (!chatId || typeof chatId !== 'number') {
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
      select: { id: true, title: true }
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Чат не найден' },
        { status: 404 }
      );
    }

    // Проверяем, не добавлен ли уже в избранное
    const existingFavorite = await prisma.chatFavorite.findUnique({
      where: {
        chatId_userId: {
          chatId: chatId,
          userId: user.userId
        }
      }
    });

    if (existingFavorite) {
      return NextResponse.json(
        { 
          success: true,
          message: 'Чат уже в избранном',
          isFavorite: true
        }
      );
    }

    // Добавляем в избранное
    const favorite = await prisma.chatFavorite.create({
      data: {
        chatId: chatId,
        userId: user.userId
      },
      include: {
        chat: {
          select: {
            id: true,
            title: true,
            type: true,
            memberCount: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Чат "${chat.title}" добавлен в избранное`,
      favorite: favorite,
      isFavorite: true
    });

  } catch (error) {
    console.error('Error adding chat to favorites:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Ошибка при добавлении в избранное'
      }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/favorites/chats - Удалить чат из избранного
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Требуется авторизация' }, 
        { status: 401 }
      );
    }

    const { chatId } = await request.json();

    if (!chatId || typeof chatId !== 'number') {
      return NextResponse.json(
        { error: 'Некорректный ID чата' },
        { status: 400 }
      );
    }

    // Удаляем из избранного
    const deletedFavorite = await prisma.chatFavorite.deleteMany({
      where: {
        chatId: chatId,
        userId: user.userId
      }
    });

    if (deletedFavorite.count === 0) {
      return NextResponse.json(
        { 
          success: true,
          message: 'Чат не был в избранном',
          isFavorite: false
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Чат удален из избранного',
      isFavorite: false
    });

  } catch (error) {
    console.error('Error removing chat from favorites:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Ошибка при удалении из избранного'
      }, 
      { status: 500 }
    );
  }
}
