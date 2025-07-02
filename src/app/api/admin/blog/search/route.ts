import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/blog/search - поиск заведений и чатов для блога
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({
        businesses: [],
        chats: []
      });
    }

    // Параллельный поиск заведений и чатов
    const [businesses, chats] = await Promise.all([
      // Поиск заведений
      prisma.business.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { nameEn: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { address: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          category: {
            select: {
              name: true,
              slug: true
            }
          },
          city: {
            select: {
              name: true,
              stateId: true
            }
          }
        },
        take: 20,
        orderBy: [
          { premiumTier: 'desc' },
          { rating: 'desc' },
          { viewCount: 'desc' }
        ]
      }),

      // Поиск чатов
      prisma.telegramChat.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { topic: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          city: {
            select: {
              name: true,
              stateId: true
            }
          }
        },
        take: 20,
        orderBy: [
          { memberCount: 'desc' },
          { viewCount: 'desc' }
        ]
      })
    ]);

    // Форматируем результаты для фронтенда
    const formattedBusinesses = businesses.map(business => ({
      id: business.id,
      name: business.name,
      nameEn: business.nameEn,
      description: business.description,
      address: business.address,
      category: business.category.name,
      city: `${business.city.name}, ${business.city.stateId}`,
      rating: business.rating,
      viewCount: business.viewCount,
      premiumTier: business.premiumTier
    }));

    const formattedChats = chats.map(chat => ({
      id: chat.id,
      title: chat.title,
      description: chat.description,
      topic: chat.topic,
      memberCount: chat.memberCount,
      city: chat.city ? `${chat.city.name}, ${chat.city.stateId}` : null,
      viewCount: chat.viewCount
    }));

    return NextResponse.json({
      businesses: formattedBusinesses,
      chats: formattedChats
    });
  } catch (error) {
    console.error('Ошибка поиска в блоге:', error);
    return NextResponse.json(
      { error: 'Ошибка поиска' },
      { status: 500 }
    );
  }
}
