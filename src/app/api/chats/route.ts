import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

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
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  console.log(`🔍 [${requestId}] CHATS API: Request started`);
  console.log(`📋 [${requestId}] URL: ${request.url}`);
  console.log(`🕐 [${requestId}] Timestamp: ${new Date().toISOString()}`);
  
  try {
    // Проверка БД
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log(`✅ [${requestId}] Database connection OK`);
    } catch (dbError) {
      console.error(`❌ [${requestId}] Database connection failed:`, dbError);
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Логируем все параметры запроса
    const params = {
      type: searchParams.get('type'),
      cityId: searchParams.get('cityId'),
      stateId: searchParams.get('stateId'),
      topic: searchParams.get('topic'),
      search: searchParams.get('search'),
      status: searchParams.get('status'),
      isVerified: searchParams.get('isVerified'),
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20'
    };
    
    console.log(`📊 [${requestId}] Request params:`, params);
    
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
    
    console.log(`📄 [${requestId}] Pagination: page=${page}, limit=${limit}, offset=${offset}`);

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

    console.log(`🔍 [${requestId}] WHERE clause:`, JSON.stringify(where, null, 2));

    // Засекаем время запроса к БД
    const dbStartTime = Date.now();
    
    // Запрос чатов
    const [chats, totalCount] = await Promise.all([
      prisma.telegramChat.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          username: true,
          inviteLink: true,
          type: true,
          topic: true,
          memberCount: true,
          isVerified: true,
          isActive: true,
          viewCount: true,
          joinCount: true,
          status: true,
          createdAt: true,
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
    
    const dbDuration = Date.now() - dbStartTime;
    console.log(`⚡ [${requestId}] Database query completed in ${dbDuration}ms`);
    console.log(`📊 [${requestId}] Found ${chats.length} chats, total: ${totalCount}`);

    // Подсчет статистики (опционально, может тормозить)
    const statsStartTime = Date.now();
    const stats = await prisma.telegramChat.aggregate({
      where: { status: 'ACTIVE', isActive: true },
      _count: { _all: true },
      _sum: { memberCount: true },
    });
    const statsDuration = Date.now() - statsStartTime;
    console.log(`📈 [${requestId}] Stats query completed in ${statsDuration}ms`);

    const totalDuration = Date.now() - startTime;
    console.log(`🎉 [${requestId}] CHATS API: Request completed successfully in ${totalDuration}ms`);

    const response = {
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
      },
      debug: {
        requestId,
        duration: totalDuration,
        dbDuration,
        statsDuration,
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`❌ [${requestId}] CHATS API: Error after ${totalDuration}ms:`, error);
    
    if (error instanceof Error && error.message.includes('Max client connections')) {
      console.error(`🔥 [${requestId}] DATABASE OVERLOAD - too many connections`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server temporarily overloaded',
          requestId,
          duration: totalDuration
        },
        { status: 503, headers: { 'Retry-After': '5' } }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка получения списка чатов',
        requestId,
        duration: totalDuration
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chats - Создать новый чат (только для админов)
 */
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  console.log(`🔍 [${requestId}] CHATS POST: Create chat request started`);
  
  try {
    // Проверка БД
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log(`✅ [${requestId}] Database connection OK`);
    } catch (dbError) {
      console.error(`❌ [${requestId}] Database connection failed:`, dbError);
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    const body = await request.json();
    console.log(`📋 [${requestId}] Request body:`, body);
    
    const validatedData = CreateChatSchema.parse(body);
    console.log(`✅ [${requestId}] Data validation passed`);

    // TODO: Проверка прав администратора
    // const { user } = await verifyAuth(request);
    // if (user?.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    // }

    // Создание чата
    const dbStartTime = Date.now();
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
    
    const dbDuration = Date.now() - dbStartTime;
    const totalDuration = Date.now() - startTime;
    
    console.log(`✅ [${requestId}] Chat created successfully in ${dbDuration}ms`);
    console.log(`🎉 [${requestId}] CHATS POST: Request completed in ${totalDuration}ms`);

    return NextResponse.json({
      success: true,
      data: chat,
      message: 'Чат создан и отправлен на модерацию',
      debug: {
        requestId,
        duration: totalDuration,
        dbDuration
      }
    });

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`❌ [${requestId}] CHATS POST: Error after ${totalDuration}ms:`, error);
    
    if (error instanceof z.ZodError) {
      console.error(`📝 [${requestId}] Validation error:`, error.errors);
      return NextResponse.json(
        { 
          success: false,
          error: 'Ошибка валидации данных',
          details: error.errors,
          requestId,
          duration: totalDuration
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('Max client connections')) {
      console.error(`🔥 [${requestId}] DATABASE OVERLOAD during chat creation`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server temporarily overloaded',
          requestId,
          duration: totalDuration
        },
        { status: 503, headers: { 'Retry-After': '5' } }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка создания чата',
        requestId,
        duration: totalDuration
      },
      { status: 500 }
    );
  }
}