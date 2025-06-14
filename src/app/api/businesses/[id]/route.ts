// src/app/api/businesses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params для Next.js 15
    const { id } = await params;
    const businessId = parseInt(id);
    
    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: 'Неверный ID заведения' },
        { status: 400 }
      );
    }

    // Получаем детальную информацию о заведении
    const business = await prisma.business.findUnique({
      where: {
        id: businessId,
        status: 'ACTIVE'
      },
      include: {
        category: true,
        city: true,
        photos: {
          orderBy: { order: 'asc' }
        },
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                username: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Показываем только последние 10 отзывов
        },
        owner: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        },
        _count: {
          select: {
            reviews: true,
            favorites: true
          }
        }
      }
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Заведение не найдено' },
        { status: 404 }
      );
    }

    // Увеличиваем счетчик просмотров
    await prisma.business.update({
      where: { id: businessId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json(business);

  } catch (error) {
    console.error('Error fetching business details:', error);
    return NextResponse.json(
      { error: 'Ошибка получения информации о заведении' },
      { status: 500 }
    );
  }
}