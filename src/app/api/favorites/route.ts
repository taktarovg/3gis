import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

/**
 * GET /api/favorites - Получение списка избранных (заведения и чаты)
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'businesses', 'chats', 'all'

    // Получаем избранные заведения
    let businessFavorites: any[] = []
    if (type === 'businesses' || type === 'all' || !type) {
      const favorites = await prisma.businessFavorite.findMany({
        where: { userId: user.userId },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              nameEn: true,
              description: true,
              address: true,
              phone: true,
              website: true,
              rating: true,
              reviewCount: true,
              latitude: true,
              longitude: true,
              languages: true,
              hasParking: true,
              premiumTier: true,
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

      businessFavorites = favorites.map(favorite => ({
        id: favorite.id,
        type: 'business',
        addedAt: favorite.createdAt,
        business: {
          ...favorite.business,
          isFavorite: true,
          distance: null,
          favoriteCount: favorite.business._count.favorites
        }
      }))
    }

    // Получаем избранные чаты
    let chatFavorites: any[] = []
    if (type === 'chats' || type === 'all' || !type) {
      const favorites = await prisma.chatFavorite.findMany({
        where: { userId: user.userId },
        include: {
          chat: {
            select: {
              id: true,
              title: true,
              description: true,
              username: true,
              inviteLink: true,
              type: true,
              topic: true,
              memberCount: true,
              isVerified: true,
              status: true,
              city: {
                select: {
                  id: true,
                  name: true,
                  stateId: true
                }
              },
              state: {
                select: {
                  id: true,
                  name: true,
                  fullName: true
                }
              },
              _count: {
                select: {
                  favorites: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      chatFavorites = favorites.map(favorite => ({
        id: favorite.id,
        type: 'chat',
        addedAt: favorite.createdAt,
        chat: {
          ...favorite.chat,
          isFavorite: true,
          favoriteCount: favorite.chat._count.favorites
        }
      }))
    }

    // Объединяем результаты
    const allFavorites = [...businessFavorites, ...chatFavorites]
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())

    // Возвращаем в формате, который ожидает useFavorites
    if (type === 'businesses') {
      return NextResponse.json({
        success: true,
        favorites: businessFavorites,
        count: businessFavorites.length
      })
    }
    
    if (type === 'chats') {
      return NextResponse.json({
        success: true,
        favorites: chatFavorites,
        count: chatFavorites.length
      })
    }
    
    // По умолчанию возвращаем только заведения
    return NextResponse.json({
      success: true,
      favorites: businessFavorites,
      count: businessFavorites.length,
      meta: {
        businesses: businessFavorites.length,
        chats: chatFavorites.length,
        total: allFavorites.length
      }
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
