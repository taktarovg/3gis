// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.businessCategory.findMany({
      orderBy: { order: 'asc' },
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

    return NextResponse.json(categories);

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Ошибка получения категорий' },
      { status: 500 }
    );
  }
}