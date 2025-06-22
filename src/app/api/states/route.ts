import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API для получения списка штатов США
 */
export async function GET(request: NextRequest) {
  try {
    const states = await prisma.state.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(states);
    
  } catch (error) {
    console.error('Error fetching states:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении штатов' },
      { status: 500 }
    );
  }
}
