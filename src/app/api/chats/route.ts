import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема валидации для создания чата
const CreateChatSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  username: z.string().optional(),
  inviteLink: z.string().url().optional(),
  type: z.enum(['GROUP', 'CHAT', 'CHANNEL']).default('GROUP'),
  cityId: z.number().optional(),
  stateId: z.string().optional(),
  topic: z.string().optional(),
  memberCount: z.number().min(0).default(0),
});

/**
 * GET /api/chats - Получить список чатов с фильтрацией
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Параметры фильтрации
    const type = searchParams.get('type') as 'GROUP' | 'CHAT' | 'CHANNEL' | null;
    const cityId = searchParams.get('cityId');
    const stateId = searchParams.get('stateId');
    const topic = searchParams.get('topic');
    const search = searchParams.get('search');
    const status = searchParams.get('status') as 'PENDING' | 'ACTIVE' | 'REJECTED' | null;
    const isVerified = searchParams.get('isVerified');
    
    // Параметры пагинации
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = (page - 1) * limit;

    // Условия фильтрации
    const where: any = {
      isActive: true,
      ...(status ? { status } : { status: 'ACTIVE' }), // По умолчанию только активные
    };

    if (type) where.type = type;
    if (cityId) where.cityId = parseInt(cityId);
    if (stateId) where.stateId = stateId;
    if (topic) where.topic = { contains: topic, mode: 'insensitive' };
    if (isVerified) where.isVerified = isVerified === 'true';
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { topic: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Запрос чатов
    const [chats, totalCount] = await Promise.all([
      prisma.telegramChat.findMany({
        where,
        include: {
          city: {
            select: { id: true, name: true, stateId: true }
          },
          state: {
            select: { id: true, name: true, fullName: true }
          },
          _count: {
            select: { favorites: true }
          }
        },
        orderBy: [
          { isVerified: 'desc' },  // Верифицированные сначала
          { memberCount: 'desc' }, // Больше участников
          { createdAt: 'desc' }    // Новые чаты
        ],
        skip: offset,
        take: limit,
      }),
      prisma.telegramChat.count({ where })
    ]);

    // Подсчет статистики
    const stats = await prisma.telegramChat.aggregate({
      where: { status: 'ACTIVE', isActive: true },
      _count: { _all: true },
      _sum: { memberCount: true },
    });

    return NextResponse.json({
      success: true,
      data: chats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: page > 1,
      },
      stats: {
        totalChats: stats._count._all,
        totalMembers: stats._sum.memberCount || 0,
      }
    });

  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка получения списка чатов' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chats - Создать новый чат (только для админов)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateChatSchema.parse(body);

    // TODO: Проверка прав администратора
    // const { user } = await verifyAuth(request);
    // if (user?.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    // }

    // Создание чата
    const chat = await prisma.telegramChat.create({
      data: {
        ...validatedData,
        status: 'PENDING', // Новые чаты требуют модерации
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
      data: chat,
      message: 'Чат создан и отправлен на модерацию'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Ошибка валидации данных',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('Error creating chat:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка создания чата' 
      },
      { status: 500 }
    );
  }
}
