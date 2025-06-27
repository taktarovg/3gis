import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const states = await prisma.state.findMany({
      select: {
        id: true,
        name: true,
        fullName: true,
        region: true,
        _count: {
          select: {
            cities: true // Подсчет городов в штате
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      states,
      count: states.length
    });

  } catch (error) {
    console.error('States API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при получении штатов',
        states: [] 
      },
      { status: 500 }
    );
  }
}