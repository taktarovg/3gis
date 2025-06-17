import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

/**
 * POST /api/favorites/toggle - Добавление/удаление заведения из избранного
 */
export async function POST(request: NextRequest) {
  try {
    // Авторизация пользователя
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Требуется авторизация' }, 
        { status: 401 }
      )
    }

    // Парсим тело запроса
    const body = await request.json()
    const { businessId } = body

    // Валидация businessId
    if (!businessId || isNaN(parseInt(businessId))) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Неверный ID заведения' 
        }, 
        { status: 400 }
      )
    }

    const parsedBusinessId = parseInt(businessId)

    // Проверяем, существует ли заведение
    const business = await prisma.business.findUnique({
      where: { id: parsedBusinessId },
      select: {
        id: true,
        name: true,
        status: true
      }
    })

    if (!business) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Заведение не найдено' 
        }, 
        { status: 404 }
      )
    }

    // Проверяем, что заведение активно
    if (business.status !== 'ACTIVE') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Заведение недоступно' 
        }, 
        { status: 400 }
      )
    }

    // Проверяем, есть ли уже в избранном
    const existingFavorite = await prisma.businessFavorite.findUnique({
      where: {
        businessId_userId: {
          businessId: parsedBusinessId,
          userId: user.id
        }
      }
    })

    if (existingFavorite) {
      // Удаляем из избранного
      await prisma.businessFavorite.delete({
        where: { id: existingFavorite.id }
      })

      return NextResponse.json({
        success: true,
        action: 'removed',
        isFavorite: false,
        message: `${business.name} удален из избранного`,
        businessId: parsedBusinessId
      })
    } else {
      // Добавляем в избранное
      const newFavorite = await prisma.businessFavorite.create({
        data: {
          businessId: parsedBusinessId,
          userId: user.id
        },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              category: {
                select: { name: true, icon: true }
              }
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        action: 'added',
        isFavorite: true,
        message: `${business.name} добавлен в избранное`,
        businessId: parsedBusinessId,
        favoriteId: newFavorite.id
      })
    }

  } catch (error) {
    console.error('Error toggling favorite:', error)
    
    // Проверяем на уникальные ошибки Prisma
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Заведение уже в избранном' 
        }, 
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Ошибка сервера при обновлении избранного'
      }, 
      { status: 500 }
    )
  }
}

/**
 * GET /api/favorites/toggle - Проверка статуса избранного для заведения
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Требуется авторизация' }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId || isNaN(parseInt(businessId))) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Неверный ID заведения' 
        }, 
        { status: 400 }
      )
    }

    const parsedBusinessId = parseInt(businessId)

    // Проверяем, есть ли в избранном
    const favorite = await prisma.businessFavorite.findUnique({
      where: {
        businessId_userId: {
          businessId: parsedBusinessId,
          userId: user.id
        }
      },
      select: {
        id: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      isFavorite: !!favorite,
      favoriteId: favorite?.id || null,
      addedAt: favorite?.createdAt || null,
      businessId: parsedBusinessId
    })

  } catch (error) {
    console.error('Error checking favorite status:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Ошибка проверки статуса избранного'
      }, 
      { status: 500 }
    )
  }
}
