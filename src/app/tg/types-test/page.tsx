/**
 * Тест проверки TypeScript типов после исправлений
 * Этот файл должен компилироваться без ошибок
 */

import { verifyAuth, type AuthPayload } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

// Тест что JWTPayload содержит правильные поля
export async function testJWTPayload(request: NextRequest) {
  const user = await verifyAuth(request)
  
  if (user) {
    // Эти поля должны существовать в JWTPayload
    const userId: number = user.userId
    const telegramId: string = user.telegramId
    const firstName: string = user.firstName
    const lastName: string | undefined = user.lastName
    const isPremium: boolean | undefined = user.isPremium
    
    console.log('✅ JWTPayload типы корректны', {
      userId,
      telegramId,
      firstName,
      lastName,
      isPremium
    })
    
    // Тест использования в Prisma queries
    const favorites = await prisma.businessFavorite.findMany({
      where: { userId: user.userId } // user.userId, НЕ user.id
    })
    
    console.log('✅ Prisma query работает с user.userId', favorites.length)
  }
  
  return user
}

// Тест типов для API responses
interface FavoritesAPIResponse {
  success: boolean
  favorites: Array<{
    id: number
    addedAt: Date
    business: {
      id: number
      name: string
      isFavorite: boolean
    }
  }>
  count: number
}

// Тест типа AuthPayload export
const testAuthPayload: AuthPayload = {
  userId: 1,
  telegramId: '123456789',
  firstName: 'Test',
  lastName: 'User',
  isPremium: false,
  language: 'ru',
  iat: Date.now(),
  exp: Date.now() + 86400
}

console.log('✅ AuthPayload тип экспортируется корректно', testAuthPayload)

export default function TypesTest() {
  return (
    <div>
      <h1>✅ TypeScript типы корректны</h1>
      <p>Этот файл компилируется без ошибок</p>
    </div>
  )
}
