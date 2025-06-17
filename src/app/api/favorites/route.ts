import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

/**
 * GET /api/favorites - Получение списка избранных заведений пользователя
 */
export async function GET(request: NextRequest) {
  try {
    // Авторизация через JWT token
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Требуется авторизация' }, 
        { status: 401 }
      )
    }

    // Получаем избранные заведения с полной информацией
    const favorites = await prisma.businessFavorite.findMany({
      where: { userId: user.userId },
      include: {
        business: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                nameEn: true,
                slug: true,
                icon: true
              }
            },
            city: {
              select: {
                id: true,
                name: true,
                state: true
              }
            },
            photos: {
              take: 1,
              orderBy: { order: 'asc' },
              select: {
                id: true,
                url: true,
                caption: true
              }
            },
            _count: {
              select: {
                reviews: true,
                favorites: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Форматируем ответ
    const formattedFavorites = favorites.map(favorite => ({
      id: favorite.id,
      addedAt: favorite.createdAt,
      business: {
        ...favorite.business,
        isFavorite: true, // Помечаем как избранное
        distance: null, // Будет вычислено на клиенте если нужно
        favoriteCount: favorite.business._count.favorites
      }
    }))

    return NextResponse.json({
      success: true,
      favorites: formattedFavorites,
      count: formattedFavorites.length
    })

  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Ошибка сервера при получении избранного'
      }, 
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/favorites - Очистка всего избранного пользователя
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Требуется авторизация' }, 
        { status: 401 }
      )
    }

    // Удаляем все избранные заведения пользователя
    const result = await prisma.businessFavorite.deleteMany({
      where: { userId: user.userId }
    })

    return NextResponse.json({
      success: true,
      message: 'Избранное очищено',
      deletedCount: result.count
    })

  } catch (error) {
    console.error('Error clearing favorites:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Ошибка при очистке избранного'
      }, 
      { status: 500 }
    )
  }
}
