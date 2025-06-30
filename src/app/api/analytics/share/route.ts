import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { entityType, entityId, action, utmParams, telegramUserId, referrer } = await request.json();
    
    // Получаем IP и User-Agent для аналитики
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               request.headers.get('remote-addr') || 
               null;
    const userAgent = request.headers.get('user-agent');
    const requestReferrer = referrer || request.headers.get('referer');
    
    // Находим пользователя по Telegram ID если передан
    let userId: number | undefined;
    if (telegramUserId) {
      try {
        const user = await prisma.user.findUnique({
          where: { telegramId: telegramUserId.toString() },
          select: { id: true }
        });
        userId = user?.id;
      } catch (error) {
        console.warn('Failed to find user by telegramId:', telegramUserId);
      }
    }
    
    // Валидация данных
    if (!entityType || !entityId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: entityType, entityId, action' },
        { status: 400 }
      );
    }
    
    if (!['BUSINESS', 'CHAT'].includes(entityType)) {
      return NextResponse.json(
        { error: 'Invalid entityType. Must be BUSINESS or CHAT' },
        { status: 400 }
      );
    }
    
    const validActions = ['LINK_CREATED', 'LINK_CLICKED', 'SOCIAL_SHARED', 'APP_OPENED', 'QR_SCANNED'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Сохраняем в базу
    const analyticsData = {
      entityType,
      entityId: parseInt(entityId),
      ...(entityType === 'BUSINESS' && { businessId: parseInt(entityId) }),
      ...(entityType === 'CHAT' && { chatId: parseInt(entityId) }),
      action,
      referrer: requestReferrer,
      userAgent,
      ipAddress: ip,
      userId,
      // UTM параметры
      utmSource: utmParams?.utmSource || null,
      utmMedium: utmParams?.utmMedium || null,
      utmCampaign: utmParams?.utmCampaign || null,
    };
    
    await prisma.shareAnalytics.create({
      data: analyticsData,
    });
    
    // Увеличиваем счетчик шеринга если это действие клика или соц. сетей
    if (['LINK_CLICKED', 'SOCIAL_SHARED', 'APP_OPENED'].includes(action)) {
      try {
        if (entityType === 'BUSINESS') {
          await prisma.business.update({
            where: { id: parseInt(entityId) },
            data: { shareCount: { increment: 1 } },
          });
        } else if (entityType === 'CHAT') {
          await prisma.telegramChat.update({
            where: { id: parseInt(entityId) },
            data: { shareCount: { increment: 1 } },
          });
        }
      } catch (error) {
        console.warn('Failed to increment share count:', error);
        // Не прерываем выполнение если не удалось обновить счетчик
      }
    }
    
    // Увеличиваем счетчик просмотров для LINK_CLICKED
    if (action === 'LINK_CLICKED') {
      try {
        if (entityType === 'BUSINESS') {
          await prisma.business.update({
            where: { id: parseInt(entityId) },
            data: { viewCount: { increment: 1 } },
          });
        } else if (entityType === 'CHAT') {
          await prisma.telegramChat.update({
            where: { id: parseInt(entityId) },
            data: { viewCount: { increment: 1 } },
          });
        }
      } catch (error) {
        console.warn('Failed to increment view count:', error);
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Analytics recorded successfully'
    });
    
  } catch (error) {
    console.error('Share analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to record share analytics' },
      { status: 500 }
    );
  }
}

// GET endpoint для получения статистики (опционально)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    
    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'Missing entityType or entityId parameters' },
        { status: 400 }
      );
    }
    
    // Получаем статистику по сущности
    const analytics = await prisma.shareAnalytics.findMany({
      where: {
        entityType: entityType as 'BUSINESS' | 'CHAT',
        entityId: parseInt(entityId),
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Последние 100 записей
      select: {
        action: true,
        createdAt: true,
        utmSource: true,
        utmMedium: true,
        referrer: true,
      }
    });
    
    // Группируем статистику по действиям
    const stats = analytics.reduce((acc, item) => {
      acc[item.action] = (acc[item.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return NextResponse.json({
      success: true,
      stats,
      totalEvents: analytics.length,
      recentEvents: analytics.slice(0, 10)
    });
    
  } catch (error) {
    console.error('Analytics retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    );
  }
}