// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Глобальный singleton для Prisma клиента
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Настройки подключения для Supabase с ограничением пула
const prismaConfig = {
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Настройки для предотвращения исчерпания подключений
  __internal: {
    engine: {
      // Ограничиваем количество подключений для Vercel Serverless
      connection_limit: 5,
      pool_timeout: 10, // 10 секунд таймаут
    },
  },
} as const;

// Создаем единственный экземпляр Prisma
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// В development сохраняем в глобальной переменной для Hot Reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown при завершении процесса
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    console.log('🔌 Disconnecting Prisma...');
    await prisma.$disconnect();
  });

  process.on('SIGINT', async () => {
    console.log('🔌 SIGINT received, disconnecting Prisma...');
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('🔌 SIGTERM received, disconnecting Prisma...');
    await prisma.$disconnect();
    process.exit(0);
  });
}

/**
 * Создать временный Prisma клиент с настроенным контекстом пользователя для RLS
 * ВАЖНО: Всегда вызывайте $disconnect() после использования!
 */
export async function createPrismaWithUser(telegramId: string): Promise<PrismaClient> {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
    // Используем отдельное подключение с минимальным пулом
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  
  try {
    // Устанавливаем telegram_id текущего пользователя для RLS политик
    await client.$executeRaw`SELECT public.set_current_user_telegram_id(${telegramId})`;
    return client;
  } catch (error) {
    console.error('Failed to set user context in Prisma:', error);
    // Закрываем подключение при ошибке
    await client.$disconnect();
    // Возвращаем основной клиент если не удалось установить контекст
    return prisma;
  }
}

/**
 * Выполнить операцию с контекстом пользователя
 * Автоматически управляет подключением и закрытием
 */
export async function withUserContext<T>(
  telegramId: string, 
  operation: (client: PrismaClient) => Promise<T>
): Promise<T> {
  let client: PrismaClient | null = null;
  
  try {
    client = await createPrismaWithUser(telegramId);
    return await operation(client);
  } finally {
    // ВСЕГДА закрываем подключение
    if (client && client !== prisma) {
      await client.$disconnect();
    }
  }
}

/**
 * Проверить статус подключения к базе данных
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Получить статистику подключений (для мониторинга)
 */
export async function getConnectionStats() {
  try {
    const [activeConnections, totalConnections, maxConnections] = await Promise.all([
      prisma.$queryRaw<[{ active_connections: number }]>`
        SELECT count(*) as active_connections 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `,
      prisma.$queryRaw<[{ total_connections: number }]>`
        SELECT count(*) as total_connections 
        FROM pg_stat_activity
      `,
      prisma.$queryRaw<[{ max_connections: string }]>`
        SHOW max_connections
      `
    ]);

    return {
      active: activeConnections[0].active_connections,
      total: totalConnections[0].total_connections,
      max: parseInt(maxConnections[0].max_connections),
      usage: (totalConnections[0].total_connections / parseInt(maxConnections[0].max_connections)) * 100
    };
  } catch (error) {
    console.error('Failed to get connection stats:', error);
    return null;
  }
}

/**
 * Middleware для проверки состояния БД в API routes
 */
export async function ensureDatabaseConnection() {
  try {
    // Быстрая проверка подключения
    await prisma.$queryRaw`SELECT 1`;
    
    // Опционально: логируем статистику в development
    if (process.env.NODE_ENV === 'development') {
      const stats = await getConnectionStats();
      if (stats && stats.usage > 80) {
        console.warn(`⚠️ High DB connection usage: ${stats.usage.toFixed(1)}% (${stats.total}/${stats.max})`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw new Error('Database unavailable');
  }
}

// Экспорт для удобства
export default prisma;