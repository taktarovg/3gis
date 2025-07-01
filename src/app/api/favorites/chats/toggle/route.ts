import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth'

/**
 * POST /api/favorites/chats/toggle - Добавление/удаление чата из избранного
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
    const { chatId } = body

    // Валидация chatId
    if (!chatId || isNaN(parseInt(chatId))) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Неверный ID чата' 
        }, 
        { status: 400 }
      )
    }

    const parsedChatId = parseInt(chatId)

    // Проверяем, существует ли чат
    const chat = await prisma.telegramChat.findUnique({
      where: { id: parsedChatId },
      select: {
        id: true,
        title: true,
        status: true,
        isActive: true
      }
    })

    if (!chat) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Чат не найден' 
        }, 
        { status: 404 }
      )
    }

    // Проверяем, что чат активен
    if (chat.status !== 'ACTIVE' || !chat.isActive) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Чат недоступен' 
        }, 
        { status: 400 }
      )
    }

    // Проверяем, есть ли уже в избранном
    const existingFavorite = await prisma.chatFavorite.findUnique({
      where: {
        chatId_userId: {
          chatId: parsedChatId,
          userId: user.userId
        }
      }
    })

    if (existingFavorite) {
      // Удаляем из избранного
      await prisma.chatFavorite.delete({
        where: { id: existingFavorite.id }
      })

      return NextResponse.json({
        success: true,
        action: 'removed',
        isFavorite: false,
        message: `${chat.title} удален из избранного`,
        chatId: parsedChatId
      })
    } else {
      // Добавляем в избранное
      const newFavorite = await prisma.chatFavorite.create({
        data: {
          chatId: parsedChatId,
          userId: user.userId
        },
        include: {
          chat: {
            select: {
              id: true,
              title: true,
              type: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        action: 'added',
        isFavorite: true,
        message: `${chat.title} добавлен в избранное`,
        chatId: parsedChatId,
        favoriteId: newFavorite.id
      })
    }

  } catch (error) {
    console.error('Error toggling chat favorite:', error)
    
    // Проверяем на уникальные ошибки Prisma
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Чат уже в избранном' 
        }, 
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Ошибка сервера при обновлении избранного чата'
      }, 
      { status: 500 }
    )
  }
}

/**
 * GET /api/favorites/chats/toggle - Проверка статуса избранного для чата
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
    const chatId = searchParams.get('chatId')

    if (!chatId || isNaN(parseInt(chatId))) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Неверный ID чата' 
        }, 
        { status: 400 }
      )
    }

    const parsedChatId = parseInt(chatId)

    // Проверяем, есть ли в избранном
    const favorite = await prisma.chatFavorite.findUnique({
      where: {
        chatId_userId: {
          chatId: parsedChatId,
          userId: user.userId
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
      chatId: parsedChatId
    })

  } catch (error) {
    console.error('Error checking chat favorite status:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Ошибка проверки статуса избранного чата'
      }, 
      { status: 500 }
    )
  }
}
