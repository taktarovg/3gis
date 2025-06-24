import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/chats/[id] - Получить детальную информацию о чате
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

    // Получение чата с полной информацией
    const chat = await prisma.telegramChat.findUnique({
      where: { 
        id: chatId,
        status: 'ACTIVE',
        isActive: true
      },
      include: {
        city: {
          select: { 
            id: true, 
            name: true, 
            stateId: true,
            state: {
              select: { name: true, fullName: true }
            }
          }
        },
        state: {
          select: { 
            id: true, 
            name: true, 
            fullName: true,
            region: true
          }
        },
        moderatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: { favorites: true }
        }
      }
    });

    if (!chat) {
      return NextResponse.json(
        { success: false, error: 'Чат не найден' },
        { status: 404 }
      );
    }

    // Увеличение счетчика просмотров
    await prisma.telegramChat.update({
      where: { id: chatId },
      data: { viewCount: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      data: chat
    });

  } catch (error) {
    console.error('Error fetching chat details:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка получения информации о чате' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/chats/[id] - Обновить информацию о чате (только админы)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chatId = parseInt(id);
    const body = await request.json();
    
    if (isNaN(chatId)) {
      return NextResponse.json(
        { success: false, error: 'Некорректный ID чата' },
        { status: 400 }
      );
    }

    // TODO: Проверка прав администратора
    // const { user } = await verifyAuth(request);
    // if (user?.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    // }

    // Валидация данных для обновления
    const allowedFields = [
      'title', 'description', 'username', 'inviteLink', 
      'type', 'cityId', 'stateId', 'topic', 'memberCount',
      'isVerified', 'isActive', 'status'
    ];
    
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Обновление чата
    const updatedChat = await prisma.telegramChat.update({
      where: { id: chatId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        city: {
          select: { id: true, name: true, stateId: true }
        },
        state: {
          select: { id: true, name: true, fullName: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedChat,
      message: 'Информация о чате обновлена'
    });

  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка обновления чата' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chats/[id] - Удалить чат (только админы)
 */
export async function DELETE(
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

    // TODO: Проверка прав администратора
    // const { user } = await verifyAuth(request);
    // if (user?.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    // }

    // Мягкое удаление (деактивация)
    await prisma.telegramChat.update({
      where: { id: chatId },
      data: { 
        isActive: false,
        status: 'REJECTED',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Чат деактивирован'
    });

  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка удаления чата' 
      },
      { status: 500 }
    );
  }
}
