// src/lib/auth.ts (обновлено для 3GIS с @telegram-apps/sdk v3.x)

import jwt from 'jsonwebtoken';
import { validateTelegramAuth, parseTelegramAuthData, type TelegramUserData } from './telegram';
import { logger } from '@/utils/logger';

// Интерфейс для JWT payload
interface JWTPayload {
  userId: number;
  telegramId: string;
  username?: string;
  firstName: string;
  lastName?: string;
  isPremium?: boolean;
  language?: string;
  iat: number;
  exp: number;
}

// Интерфейс для создания JWT
interface CreateTokenParams {
  user: {
    id: number;
    telegramId: string;
    username?: string | null;
    firstName: string;
    lastName?: string | null;
    isPremium?: boolean;
    language?: string;
  };
  expiresIn?: string;
}

/**
 * Создание JWT токена для пользователя 3GIS
 * @param params - Параметры для создания токена
 * @returns JWT токен
 */
export function createToken({ user, expiresIn = '7d' }: CreateTokenParams): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET не настроен в переменных окружения');
  }

  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    telegramId: user.telegramId,
    username: user.username || undefined,
    firstName: user.firstName,
    lastName: user.lastName || undefined,
    isPremium: user.isPremium || false,
    language: user.language || 'ru',
  };

  const token = jwt.sign(payload, secret, {
    expiresIn,
    issuer: '3gis-app',
    audience: '3gis-users',
  });

  logger.logAuth(`JWT token created for user ${user.telegramId}`);
  return token;
}

/**
 * Верификация JWT токена
 * @param token - JWT токен для проверки
 * @returns Декодированный payload или null
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      logger.error('JWT_SECRET не настроен');
      return null;
    }

    const decoded = jwt.verify(token, secret, {
      issuer: '3gis-app',
      audience: '3gis-users',
    }) as JWTPayload;

    logger.logAuth(`JWT token verified for user ${decoded.telegramId}`);
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('JWT token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token');
    } else {
      logger.error('JWT verification error:', error);
    }
    return null;
  }
}

/**
 * Валидация Telegram initData и создание пользователя
 * Использует современный алгоритм валидации HMAC-SHA256 согласно документации v3.x
 * @param initData - Строка initData от Telegram WebApp
 * @returns Объект с данными пользователя или null
 */
export async function validateAndParseInitData(initData: string): Promise<TelegramUserData | null> {
  try {
    // Проверяем валидность подписи Telegram
    const isValid = await validateTelegramAuth(initData);
    
    if (!isValid) {
      logger.error('3GIS Telegram initData validation failed');
      return null;
    }

    // Парсим данные пользователя
    const userData = parseTelegramAuthData(initData);
    
    if (!userData) {
      logger.error('3GIS Failed to parse user data from initData');
      return null;
    }

    logger.logAuth(`3GIS initData validated for user ${userData.telegramId}`);
    return userData;
  } catch (error) {
    logger.error('3GIS Error validating initData:', error);
    return null;
  }
}

/**
 * Извлечение токена из заголовка Authorization
 * @param authHeader - Заголовок Authorization
 * @returns JWT токен или null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  // Поддерживаем форматы: "Bearer TOKEN" и "TOKEN"
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Простая проверка что это JWT (должен содержать точки)
  if (authHeader.includes('.')) {
    return authHeader;
  }

  return null;
}

/**
 * Middleware для проверки авторизации в API routes
 * @param token - JWT токен
 * @returns Декодированный payload или throws error
 */
export function requireAuth(token: string | null): JWTPayload {
  if (!token) {
    throw new Error('Токен авторизации отсутствует');
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    throw new Error('Недействительный или истекший токен');
  }

  return payload;
}

/**
 * Проверка прав доступа пользователя
 * @param payload - JWT payload
 * @param requiredRole - Требуемая роль (если есть)
 * @returns true если доступ разрешен
 */
export function checkPermissions(
  payload: JWTPayload, 
  requiredRole?: 'USER' | 'BUSINESS_OWNER' | 'ADMIN'
): boolean {
  // Базовая проверка - пользователь должен быть аутентифицирован
  if (!payload.userId || !payload.telegramId) {
    return false;
  }

  // В будущем здесь можно добавить проверку ролей
  // if (requiredRole && payload.role !== requiredRole) {
  //   return false;
  // }

  return true;
}

/**
 * Генерация уникального идентификатора сессии
 * @returns Уникальный идентификатор
 */
export function generateSessionId(): string {
  return `3gis_${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

/**
 * Хеширование пароля (на будущее, если потребуется)
 * @param password - Пароль для хеширования
 * @returns Хешированный пароль
 */
export async function hashPassword(password: string): Promise<string> {
  // В браузере используем Web Crypto API
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // В Node.js используем crypto
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Проверка соответствия пароля хешу
 * @param password - Пароль для проверки
 * @param hash - Хеш для сравнения
 * @returns true если пароли совпадают
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
}

/**
 * Создание токена для сброса пароля
 * @param userId - ID пользователя
 * @returns Токен для сброса
 */
export function createResetToken(userId: number): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET не настроен');
  }

  return jwt.sign(
    { userId, type: 'reset' },
    secret,
    { expiresIn: '1h' } // Токен сброса действует 1 час
  );
}

/**
 * Проверка токена сброса пароля
 * @param token - Токен для проверки
 * @returns ID пользователя или null
 */
export function verifyResetToken(token: string): number | null {
  try {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      return null;
    }

    const decoded = jwt.verify(token, secret) as any;
    
    if (decoded.type === 'reset' && decoded.userId) {
      return decoded.userId;
    }
    
    return null;
  } catch (error) {
    logger.error('Reset token verification error:', error);
    return null;
  }
}

/**
 * Константы для аутентификации
 */
export const AUTH_CONSTANTS = {
  // Сократили срок JWT для безопасности
  TOKEN_EXPIRY: '24h',              // Вместо 7 дней
  RESET_TOKEN_EXPIRY: '1h',
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_COOLDOWN: 15 * 60 * 1000,   // 15 минут в миллисекундах
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 часа в миллисекундах
  
  // Новые константы для управления токенами
  REFRESH_THRESHOLD: 2 * 60 * 60,   // Обновлять за 2 часа до истечения
  INIT_DATA_EXPIRY: 24 * 60 * 60,   // 24 часа для initData
  TOKEN_STORAGE_KEY: '3gis_auth_token',
  TOKEN_REFRESH_KEY: '3gis_token_refresh_time',
} as const;

/**
 * Типы для использования в приложении
 */
export type AuthPayload = JWTPayload;
export type TokenData = CreateTokenParams;

/**
 * Утилитарные функции для работы с аутентификацией
 */
export const AuthUtils = {
  /**
   * Проверка истечения токена
   */
  isTokenExpired(payload: JWTPayload): boolean {
    return Date.now() >= payload.exp * 1000;
  },

  /**
   * Получение времени до истечения токена
   */
  getTokenExpiryTime(payload: JWTPayload): number {
    return payload.exp * 1000 - Date.now();
  },

  /**
   * Форматирование времени истечения
   */
  formatExpiryTime(payload: JWTPayload): string {
    const expiryTime = new Date(payload.exp * 1000);
    return expiryTime.toLocaleString('ru-RU');
  },

  /**
   * Проверка является ли пользователь премиум
   */
  isPremiumUser(payload: JWTPayload): boolean {
    return payload.isPremium || false;
  },

  /**
   * Получение предпочитаемого языка
   */
  getUserLanguage(payload: JWTPayload): string {
    return payload.language || 'ru';
  },
} as const;
