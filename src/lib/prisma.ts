// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Предотвращаем создание множественных экземпляров в development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Создать Prisma клиент с настроенным контекстом пользователя для RLS
 * Используется для операций, требующих авторизации
 */
export async function createPrismaWithUser(telegramId: string): Promise<PrismaClient> {
  const client = new PrismaClient();
  
  try {
    // Устанавливаем telegram_id текущего пользователя для RLS политик
    await client.$executeRaw`SELECT public.set_current_user_telegram_id(${telegramId})`;
    return client;
  } catch (error) {
    console.error('Failed to set user context in Prisma:', error);
    // Возвращаем обычный клиент если не удалось установить контекст
    return client;
  }
}

/**
 * Выполнить операцию с контекстом пользователя
 */
export async function withUserContext<T>(
  telegramId: string, 
  operation: (client: PrismaClient) => Promise<T>
): Promise<T> {
  const client = await createPrismaWithUser(telegramId);
  
  try {
    return await operation(client);
  } finally {
    await client.$disconnect();
  }
}