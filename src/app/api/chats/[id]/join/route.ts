import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/chats/[id]/join - Отследить переход пользователя в чат
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chatId = parseInt(id);
    
    if (isNaN(chatId)) {
      return NextResponse.json(
        { success: false, error: 'Некорректный ID чата' },
        { status: 400 }
      );
    }

    // Проверка существования чата
    const chat = await prisma.telegramChat.findUnique({
      where: { 
        id: chatId,
        status: 'ACTIVE',
        isActive: true
      },
      select: {
        id: true,
        title: true,
        inviteLink: true,
        username: true
      }
    });

    if (!chat) {
      return NextResponse.json(
        { success: false, error: 'Чат не найден' },
        { status: 404 }
      );
    }

    // Увеличение счетчика переходов
    await prisma.telegramChat.update({
      where: { id: chatId },
      data: { 
        joinCount: { increment: 1 },
        updatedAt: new Date()
      }
    });

    // Формирование ссылки для перехода
    let telegramUrl = '';
    if (chat.inviteLink) {
      telegramUrl = chat.inviteLink;
    } else if (chat.username) {
      telegramUrl = `https://t.me/${chat.username}`;
    }

    return NextResponse.json({
      success: true,
      data: {
        chatId: chat.id,
        title: chat.title,
        telegramUrl,
        message: telegramUrl 
          ? 'Переход зафиксирован' 
          : 'Переход зафиксирован, но ссылка недоступна'
      }
    });

  } catch (error) {
    console.error('Error tracking chat join:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка отслеживания перехода' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chats/[id]/join - Получить ссылку для перехода в чат
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chatId = parseInt(id);
    
    if (isNaN(chatId)) {
      return NextResponse.json(
        { success: false, error: 'Некорректный ID чата' },
        { status: 400 }
      );
    }

    // Получение информации о чате
    const chat = await prisma.telegramChat.findUnique({
      where: { 
        id: chatId,
        status: 'ACTIVE',
        isActive: true
      },
      select: {
        id: true,
        title: true,
        inviteLink: true,
        username: true,
        type: true,
        memberCount: true
      }
    });

    if (!chat) {
      return NextResponse.json(
        { success: false, error: 'Чат не найден' },
        { status: 404 }
      );
    }

    // Формирование ссылки для перехода
    let telegramUrl = '';
    if (chat.inviteLink) {
      telegramUrl = chat.inviteLink;
    } else if (chat.username) {
      telegramUrl = `https://t.me/${chat.username}`;
    }

    return NextResponse.json({
      success: true,
      data: {
        chatId: chat.id,
        title: chat.title,
        type: chat.type,
        memberCount: chat.memberCount,
        telegramUrl,
        hasLink: !!telegramUrl
      }
    });

  } catch (error) {
    console.error('Error getting chat link:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка получения ссылки на чат' 
      },
      { status: 500 }
    );
  }
}
