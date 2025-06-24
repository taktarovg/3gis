import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateChatSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  username: z.string().optional(),
  inviteLink: z.string().url().optional(),
  type: z.enum(['GROUP', 'CHAT', 'CHANNEL']),
  cityId: z.number().optional(),
  stateId: z.string().optional(),
  topic: z.string().optional(),
  memberCount: z.number().min(0).default(0),
  isVerified: z.boolean().default(false),
  status: z.enum(['PENDING', 'ACTIVE', 'REJECTED']),
});

// Получение чата по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = parseInt(params.id);

    const chat = await prisma.telegramChat.findUnique({
      where: { id: chatId },
      include: {
        city: { select: { name: true } },
        state: { select: { name: true } },
        moderatedBy: { select: { firstName: true, lastName: true } },
        _count: { select: { favorites: true } }
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Чат не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(chat);

  } catch (error) {
    console.error('Get chat error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении чата' },
      { status: 500 }
    );
  }
}

// Обновление чата
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = parseInt(params.id);
    const body = await request.json();
    const data = UpdateChatSchema.parse(body);

    const chat = await prisma.telegramChat.update({
      where: { id: chatId },
      data,
      include: {
        city: { select: { name: true } },
        state: { select: { name: true } },
      },
    });

    return NextResponse.json(chat);

  } catch (error) {
    console.error('Update chat error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при обновлении чата' },
      { status: 500 }
    );
  }
}

// Удаление чата
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = parseInt(params.id);

    // Сначала удаляем связанные записи
    await prisma.chatFavorite.deleteMany({
      where: { chatId },
    });

    // Затем удаляем сам чат
    await prisma.telegramChat.delete({
      where: { id: chatId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении чата' },
      { status: 500 }
    );
  }
}