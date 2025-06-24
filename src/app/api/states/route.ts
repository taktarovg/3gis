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
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(states);

  } catch (error) {
    console.error('States API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении штатов' },
      { status: 500 }
    );
  }
}