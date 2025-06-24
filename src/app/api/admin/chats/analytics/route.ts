import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // дней

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const [
      totalChats,
      totalMembers,
      totalViews,
      totalJoins,
      recentChats,
      topStates,
      typeDistribution,
      statusDistribution,
      growthData
    ] = await Promise.all([
      // Общее количество чатов
      prisma.telegramChat.count({
        where: { status: 'ACTIVE' }
      }),

      // Общее количество участников
      prisma.telegramChat.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { memberCount: true }
      }),

      // Общее количество просмотров
      prisma.telegramChat.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { viewCount: true }
      }),

      // Общее количество переходов
      prisma.telegramChat.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { joinCount: true }
      }),

      // Новые чаты за период
      prisma.telegramChat.count({
        where: {
          status: 'ACTIVE',
          createdAt: { gte: daysAgo }
        }
      }),

      // Топ штатов по количеству чатов
      prisma.telegramChat.groupBy({
        by: ['stateId'],
        where: { status: 'ACTIVE', stateId: { not: null } },
        _count: true,
        orderBy: { _count: { stateId: 'desc' } },
        take: 10
      }),

      // Распределение по типам
      prisma.telegramChat.groupBy({
        by: ['type'],
        where: { status: 'ACTIVE' },
        _count: true
      }),

      // Распределение по статусам
      prisma.telegramChat.groupBy({
        by: ['status'],
        _count: true
      }),

      // Данные роста (последние 7 дней)
      Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          return prisma.telegramChat.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextDate
              }
            }
          }).then(count => ({
            date: date.toISOString().split('T')[0],
            count
          }));
        })
      )
    ]);

    // Получаем названия штатов
    const stateIds = topStates.map(s => s.stateId).filter(Boolean);
    const states = await prisma.state.findMany({
      where: { id: { in: stateIds } },
      select: { id: true, name: true }
    });

    const topStatesWithNames = topStates.map(stat => ({
      ...stat,
      stateName: states.find(s => s.id === stat.stateId)?.name || stat.stateId
    }));

    return NextResponse.json({
      overview: {
        totalChats,
        totalMembers: totalMembers._sum.memberCount || 0,
        totalViews: totalViews._sum.viewCount || 0,
        totalJoins: totalJoins._sum.joinCount || 0,
        recentChats,
      },
      distribution: {
        byType: typeDistribution,
        byStatus: statusDistribution,
        byState: topStatesWithNames,
      },
      growth: growthData.reverse(), // От старых к новым
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении аналитики' },
      { status: 500 }
    );
  }
}