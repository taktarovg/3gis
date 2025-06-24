import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема валидации для создания чата
const CreateChatSchema = z.object({
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
});

// Получение списка чатов для админки
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Построение WHERE условий
    const where: any = {};

    if (status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { topic: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [chats, total, statusCounts] = await Promise.all([
      prisma.telegramChat.findMany({
        where,
        include: {
          city: { select: { name: true } },
          state: { select: { name: true } },
          moderatedBy: { select: { firstName: true, lastName: true } },
          _count: { select: { favorites: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.telegramChat.count({ where }),
      
      // Подсчет по статусам
      prisma.telegramChat.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return NextResponse.json({
      chats,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    });

  } catch (error) {
    console.error('Admin chats API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении чатов' },
      { status: 500 }
    );
  }
}

// Создание нового чата
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateChatSchema.parse(body);

    const chat = await prisma.telegramChat.create({
      data: {
        ...data,
        status: 'PENDING', // Всегда создаем в статусе ожидания
      },
      include: {
        city: { select: { name: true } },
        state: { select: { name: true } },
      },
    });

    return NextResponse.json(chat, { status: 201 });

  } catch (error) {
    console.error('Create chat error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при создании чата' },
      { status: 500 }
    );
  }
}