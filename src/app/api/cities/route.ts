// src/app/api/cities/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { population: 'desc' },
      include: {
        _count: {
          select: {
            businesses: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    });

    return NextResponse.json(cities);

  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Ошибка получения списка городов' },
      { status: 500 }
    );
  }
}