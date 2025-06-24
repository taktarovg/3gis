// src/lib/database-retry.ts
import { prisma } from './prisma';

interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

/**
 * Выполнить операцию с базой данных с повторными попытками
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoffMultiplier = 1.5
  } = options;

  let lastError: Error | null = null;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Попытка выполнить операцию
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Проверяем, стоит ли повторять
      const shouldRetry = isRetryableError(lastError) && attempt < maxRetries;
      
      if (!shouldRetry) {
        throw lastError;
      }
      
      console.warn(`🔄 Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${currentDelay}ms:`, lastError.message);
      
      // Ждем перед следующей попыткой
      await delay(currentDelay);
      currentDelay *= backoffMultiplier;
    }
  }
  
  throw lastError;
}

/**
 * Проверить, можно ли повторить операцию при данной ошибке
 */
function isRetryableError(error: Error): boolean {
  const errorMessage = error.message.toLowerCase();
  
  // Ошибки подключения к БД, которые можно повторить
  const retryableErrors = [
    'max client connections reached',
    'connection terminated',
    'connection reset',
    'timeout',
    'connection refused',
    'network error',
    'econnreset',
    'econnrefused',
    'etimedout',
    'database unavailable'
  ];
  
  return retryableErrors.some(retryableError => 
    errorMessage.includes(retryableError)
  );
}

/**
 * Задержка в миллисекундах
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Безопасное выполнение операции с пользователем
 */
export async function safeUserOperation<T>(
  telegramId: string,
  operation: (user: any) => Promise<T>
): Promise<T> {
  return withDatabaseRetry(async () => {
    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId },
      select: {
        id: true,
        telegramId: true,
        firstName: true,
        lastName: true,
        username: true,
        avatar: true,
        role: true,
        isPremium: true
      }
    });
    
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    return await operation(user);
  }, {
    maxRetries: 3,
    delayMs: 500,
    backoffMultiplier: 2
  });
}

/**
 * Создать соединение с ограничением времени
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 10000
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
}