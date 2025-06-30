import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateUniqueSlug } from '@/lib/slug-generator';

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