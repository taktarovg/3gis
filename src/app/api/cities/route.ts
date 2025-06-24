import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('stateId');

    const cities = await prisma.city.findMany({
      where: stateId ? { stateId } : undefined,
      select: {
        id: true,
        name: true,
        state: true,
        population: true,
      },
      orderBy: [
        { population: 'desc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ success: true, cities });

  } catch (error) {
    console.error('Cities API error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении городов', cities: [] },
      { status: 500 }
    );
  }
}