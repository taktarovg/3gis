// src/app/api/share/business/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateUniqueSlug } from '@/lib/slug-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = parseInt(id);
    
    if (isNaN(businessId)) {
      return NextResponse.json({ error: 'Invalid business ID' }, { status: 400 });
    }
    
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        category: true,
        city: true,
        photos: { take: 1, orderBy: { order: 'asc' } }
      }
    });
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    
    // Автоматически генерируем slug если его нет
    if (!business.slug) {
      const newSlug = await generateUniqueSlug(business.name, 'business', business.id);
      await prisma.business.update({
        where: { id: businessId },
        data: { slug: newSlug }
      });
      business.slug = newSlug;
    }
    
    // Автоматически генерируем OG данные если их нет
    const ogTitle = business.ogTitle || `${business.name} | ${business.category.name} | 3GIS`;
    const ogDescription = business.ogDescription || 
      `${business.name} - ${business.category.name} в ${business.city.name}. Найдите контакты, отзывы и часы работы в справочнике 3GIS.`;
    const ogImage = business.ogImage || business.photos[0]?.url;
    
    if (!business.ogTitle || !business.ogDescription) {
      await prisma.business.update({
        where: { id: businessId },
        data: {
          ogTitle,
          ogDescription,
          ...(ogImage && !business.ogImage && { ogImage })
        }
      });
    }
    
    const shareUrl = `https://3gis.biz/b/${business.slug}`;
    
    // Записываем аналитику создания ссылки
    await prisma.shareAnalytics.create({
      data: {
        entityType: 'BUSINESS',
        entityId: businessId,
        businessId,
        action: 'LINK_CREATED',
        referrer: request.headers.get('referer'),
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('remote-addr')
      }
    });
    
    return NextResponse.json({
      success: true,
      shareUrl,
      slug: business.slug,
      ogTitle,
      ogDescription,
      ogImage
    });
    
  } catch (error) {
    console.error('Share link generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 }
    );
  }
}

// src/app/api/share/chat/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chatId = parseInt(id);
    
    if (isNaN(chatId)) {
      return NextResponse.json({ error: 'Invalid chat ID' }, { status: 400 });
    }
    
    const chat = await prisma.telegramChat.findUnique({
      where: { id: chatId },
      include: {
        city: true
      }
    });
    
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    
    // Автоматически генерируем slug если его нет
    if (!chat.slug) {
      const newSlug = await generateUniqueSlug(chat.title, 'chat', chat.id);
      await prisma.telegramChat.update({
        where: { id: chatId },
        data: { slug: newSlug }
      });
      chat.slug = newSlug;
    }
    
    // Автоматически генерируем OG данные
    const ogTitle = chat.ogTitle || `${chat.title} | Telegram чат | 3GIS`;
    const ogDescription = chat.ogDescription || 
      `${chat.title} - русскоязычное сообщество в Telegram. ${chat.memberCount.toLocaleString()} участников.`;
    
    if (!chat.ogTitle || !chat.ogDescription) {
      await prisma.telegramChat.update({
        where: { id: chatId },
        data: { ogTitle, ogDescription }
      });
    }
    
    const shareUrl = `https://3gis.biz/c/${chat.slug}`;
    
    // Записываем аналитику
    await prisma.shareAnalytics.create({
      data: {
        entityType: 'CHAT',
        entityId: chatId,
        chatId,
        action: 'LINK_CREATED',
        referrer: request.headers.get('referer'),
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('remote-addr')
      }
    });
    
    return NextResponse.json({
      success: true,
      shareUrl,
      slug: chat.slug,
      ogTitle,
      ogDescription
    });
    
  } catch (error) {
    console.error('Chat share link generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate chat share link' },
      { status: 500 }
    );
  }
}

// src/app/api/analytics/share/route.ts
export async function POST(request: NextRequest) {
  try {
    const { entityType, entityId, action, utmParams, telegramUserId } = await request.json();
    
    // Получаем IP и User-Agent для аналитики
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('remote-addr');
    const userAgent = request.headers.get('user-agent');
    const referrer = request.headers.get('referer');
    
    // Находим пользователя по Telegram ID если передан
    let userId: number | undefined;
    if (telegramUserId) {
      const user = await prisma.user.findUnique({
        where: { telegramId: telegramUserId.toString() },
        select: { id: true }
      });
      userId = user?.id;
    }
    
    // Сохраняем в базу
    await prisma.shareAnalytics.create({
      data: {
        entityType,
        entityId,
        ...(entityType === 'BUSINESS' && { businessId: entityId }),
        ...(entityType === 'CHAT' && { chatId: entityId }),
        action,
        referrer,
        userAgent,
        ipAddress: ip,
        userId,
        ...utmParams,
      },
    });
    
    // Увеличиваем счетчик шеринга если это действие клика
    if (action === 'LINK_CLICKED' || action === 'SOCIAL_SHARED') {
      if (entityType === 'BUSINESS') {
        await prisma.business.update({
          where: { id: entityId },
          data: { shareCount: { increment: 1 } },
        });
      } else if (entityType === 'CHAT') {
        await prisma.telegramChat.update({
          where: { id: entityId },
          data: { shareCount: { increment: 1 } },
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Share analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to record share analytics' },
      { status: 500 }
    );
  }
}