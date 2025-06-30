// src/lib/database-utils.ts
import { prisma } from '@/lib/prisma';

/**
 * Безопасно получает значение shareCount из объекта БД
 */
export function getShareCount(entity: { shareCount?: number | null; share_count?: number | null }): number {
  return entity.shareCount ?? entity.share_count ?? 0;
}

/**
 * Безопасно обновляет shareCount в БД
 */
export async function incrementShareCount(
  model: any, 
  id: number
): Promise<void> {
  try {
    await model.update({
      where: { id },
      data: {
        shareCount: {
          increment: 1
        }
      }
    });
  } catch (error) {
    console.warn('Failed to increment share count:', error);
    // Fallback: устанавливаем значение вручную
    try {
      const current = await model.findUnique({
        where: { id },
        select: { shareCount: true }
      });
      
      await model.update({
        where: { id },
        data: {
          shareCount: (current?.shareCount ?? 0) + 1
        }
      });
    } catch (fallbackError) {
      console.error('Failed fallback share count update:', fallbackError);
    }
  }
}

/**
 * Безопасно получает бизнес с обработкой отсутствующих полей
 */
export function sanitizeBusinessData(business: any) {
  return {
    ...business,
    shareCount: getShareCount(business),
    share_count: getShareCount(business), // Alias для совместимости
    slug: business.slug || null,
    ogTitle: business.ogTitle || business.og_title || null,
    ogDescription: business.ogDescription || business.og_description || null,
    ogImage: business.ogImage || business.og_image || null,
  };
}

/**
 * Безопасно получает чат с обработкой отсутствующих полей
 */
export function sanitizeChatData(chat: any) {
  return {
    ...chat,
    shareCount: getShareCount(chat),
    share_count: getShareCount(chat), // Alias для совместимости
    slug: chat.slug || null,
    ogTitle: chat.ogTitle || chat.og_title || null,
    ogDescription: chat.ogDescription || chat.og_description || null,
    ogImage: chat.ogImage || chat.og_image || null,
  };
}

/**
 * Универсальная функция для безопасного выполнения Prisma запросов
 * с обработкой ошибок отсутствующих колонок
 */
export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  try {
    return await queryFn();
  } catch (error: any) {
    // Проверяем, не связана ли ошибка с отсутствующими колонками
    if (error?.code === 'P2022' || error?.message?.includes('does not exist')) {
      console.warn('Database column missing, using fallback:', error.message);
      return fallbackValue;
    }
    // Пробрасываем другие ошибки
    throw error;
  }
}

/**
 * Создает безопасный Prisma запрос с обработкой shareCount
 */
export function createSafeBusinessQuery(businessId: number) {
  return safeQuery(
    () => prisma.business.findUnique({
      where: { id: businessId },
      include: {
        category: true,
        city: { include: { state: true } },
        photos: { orderBy: { order: 'asc' } },
        reviews: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: { reviews: true, favorites: true }
        }
      }
    }),
    null
  );
}

/**
 * Создает безопасный Prisma запрос для чатов с обработкой shareCount
 */
export function createSafeChatQuery(chatId: number) {
  return safeQuery(
    () => prisma.telegramChat.findUnique({
      where: {
        id: chatId,
        status: 'ACTIVE',
        isActive: true,
      },
      include: {
        city: { select: { name: true } },
        state: { select: { name: true, id: true } },
        _count: { select: { favorites: true } }
      },
    }),
    null
  );
}
