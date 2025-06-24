import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ModerateSchema = z.object({
  action: z.enum(['approve', 'reject']),
  note: z.string().optional(),
  moderatorId: z.number(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = parseInt(params.id);
    const body = await request.json();
    const { action, note, moderatorId } = ModerateSchema.parse(body);

    if (isNaN(chatId)) {
      return NextResponse.json(
        { error: 'Некорректный ID чата' },
        { status: 400 }
      );
    }

    const chat = await prisma.telegramChat.update({
      where: { id: chatId },
      data: {
        status: action === 'approve' ? 'ACTIVE' : 'REJECTED',
        moderatedById: moderatorId,
        moderationNote: note,
      },
      include: {
        city: { select: { name: true } },
        state: { select: { name: true } },
        moderatedBy: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({
      success: true,
      chat,
      message: action === 'approve' ? 'Чат одобрен' : 'Чат отклонен',
    });

  } catch (error) {
    console.error('Moderate chat error:', error);
    return NextResponse.json(
      { error: 'Ошибка при модерации чата' },
      { status: 500 }
    );
  }
}