import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API для получения городов по штату
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('state');

    if (!stateId) {
      // Если штат не указан, возвращаем все города (для обратной совместимости)
      const cities = await prisma.city.findMany({
        include: {
          state: true
        },
        orderBy: [
          { state: { name: 'asc' } },
          { name: 'asc' }
        ]
      });

      return NextResponse.json(cities);
    }

    // Получаем города конкретного штата
    const cities = await prisma.city.findMany({
      where: {
        stateId: stateId
      },
      include: {
        state: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(cities);
    
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении городов' },
      { status: 500 }
    );
  }
}
