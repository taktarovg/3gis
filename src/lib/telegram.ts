// src/lib/telegram.ts (обновлено для 3GIS согласно SDK v3.x)

import { createHmac, createHash } from 'crypto';

/**
 * Интерфейс для представления данных пользователя из Telegram для 3GIS
 */
export interface TelegramUserData {
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  isPremium?: boolean;
  language?: string;
}

/**
 * Проверка валидности данных аутентификации от Telegram
 * Использует современный алгоритм валидации HMAC-SHA256
 * @param initData - Строка initData от Telegram WebApp
 * @returns Promise<boolean> - Промис с результатом валидации
 */
export const validateTelegramAuth = async (initData: string): Promise<boolean> => {
  try {
    // В режиме разработки можно пропустить валидацию
    if (process.env.NODE_ENV === 'development' || process.env.SKIP_TELEGRAM_VALIDATION === 'true') {
      console.warn('3GIS Telegram auth validation skipped in development mode');
      return true;
    }

    // Получаем bot token
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN не настроен');
      return false;
    }

    // Создаем secret key для проверки согласно новой документации
    // Используем HMAC-SHA256 с константой "WebAppData"
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Создаем параметры из initData
    const params = new URLSearchParams(initData);
    
    // Получаем hash для проверки
    const hash = params.get('hash');
    if (!hash) {
      console.error('Hash отсутствует в initData');
      return false;
    }
    
    // Удаляем hash из параметров для проверки
    params.delete('hash');
    
    // Создаем строку для проверки, сортируя параметры по алфавиту
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Вычисляем HMAC-SHA-256 для проверки согласно документации
    const computedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Проверяем совпадение хэшей
    if (computedHash !== hash) {
      console.error('Invalid hash in Telegram initData');
      return false;
    }
    
    // Проверяем срок действия auth_date (24 часа)
    const authDate = parseInt(params.get('auth_date') || '0');
    const now = Math.floor(Date.now() / 1000);
    
    // Проверка на устаревшие данные - 24 часа
    const MAX_AUTH_AGE = 24 * 60 * 60;
    if (now - authDate > MAX_AUTH_AGE) {
      console.error('Telegram initData is expired', {
        authDate,
        now,
        diff: now - authDate,
        maxAge: MAX_AUTH_AGE
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating Telegram auth:', error);
    return false;
  }
};

/**
 * Парсинг данных пользователя из Telegram initData
 * Поддерживает современный формат SDK v3.x
 * @param initData - Строка initData от Telegram WebApp
 * @returns Объект с данными пользователя или null в случае ошибки
 */
export const parseTelegramAuthData = (initData: string): TelegramUserData | null => {
  try {
    // Разбираем initData как URL параметры
    const params = new URLSearchParams(initData);
    
    // Получаем строку с пользователем и разбираем её
    const userStr = params.get('user');
    if (!userStr) {
      // Пытаемся получить ID из параметров
      const id = params.get('id');
      if (id) {
        return {
          telegramId: id,
          firstName: 'Unknown',
        };
      }
      
      // В режиме разработки, создаем тестовые данные если нет пользователя
      if (process.env.NODE_ENV === 'development' || process.env.SKIP_TELEGRAM_VALIDATION === 'true') {
        console.log('3GIS Development mode: using test user data');
        return {
          telegramId: '12345678',
          firstName: 'Test User',
          lastName: '3GIS',
          username: 'testuser3gis',
          language: 'ru',
        };
      }
      
      console.error('No user data found in initData');
      return null;
    }
    
    // Декодируем и парсим JSON данные пользователя
    try {
      const userJson = decodeURIComponent(userStr.replace(/\+/g, ' '));
      const user = JSON.parse(userJson);
      
      // Проверяем наличие обязательного поля id
      if (!user.id) {
        console.error('Invalid user data: no id field', user);
        return null;
      }
      
      // Формируем объект с данными пользователя согласно новому API
      const userData = {
        telegramId: user.id.toString(),
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        username: user.username || '',
        photoUrl: user.photo_url || '',
        isPremium: user.is_premium || false,
        language: user.language_code || 'ru'
      };
      
      // Логируем детали для отладки
      console.log('3GIS Telegram Auth: Parsed user data details:', {
        telegramId: userData.telegramId,
        firstName: userData.firstName,
        hasPhotoUrl: !!userData.photoUrl,
        photoUrl: userData.photoUrl,
        rawPhotoUrl: user.photo_url
      });
      
      return userData;
    } catch (parseError) {
      console.error('Error parsing user JSON:', parseError, { userStr });
      return null;
    }
  } catch (error) {
    console.error('Error parsing Telegram user data:', error);
    return null;
  }
};

/**
 * Извлечение initData из объекта, если он был передан в виде объекта, а не строки
 * @param data - Строка или объект initData
 * @returns Строка initData
 */
export const extractInitDataString = (data: string | any): string => {
  if (typeof data === 'string') {
    return data;
  }
  
  try {
    // Если это объект инициализации, преобразуем его в строку запроса
    if (data && typeof data === 'object') {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'user' || key === 'chat' || key === 'receiver') {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, String(value));
        }
      });
      return params.toString();
    }
    
    // Если пустые данные и режим разработки, создаем фиктивные данные
    if (process.env.NODE_ENV === 'development' || process.env.SKIP_TELEGRAM_VALIDATION === 'true') {
      console.warn('Creating mock initData for 3GIS development');
      const mockData = new URLSearchParams();
      mockData.append('auth_date', Math.floor(Date.now() / 1000).toString());
      mockData.append('hash', 'test_hash_3gis');
      mockData.append('user', JSON.stringify({
        id: 12345678,
        first_name: 'Test User',
        last_name: '3GIS',
        username: 'testuser3gis',
        language_code: 'ru'
      }));
      return mockData.toString();
    }
    
    console.warn('Invalid initData format:', data);
    return '';
  } catch (error) {
    console.error('Error extracting initData string:', error);
    return '';
  }
};

/**
 * Проверка, запущено ли приложение внутри Telegram WebApp
 * @returns true, если приложение запущено в Telegram WebApp
 */
export const isTelegramWebAppEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!window.Telegram?.WebApp;
};

/**
 * Получение hash из URL для Telegram WebApp
 * @returns Строка с данными инициализации или пустая строка
 */
export const getHashFromUrl = (): string => {
  if (typeof window === 'undefined') return '';
  
  const hash = window.location.hash.slice(1);
  if (!hash) return '';
  
  try {
    // Создаем URLSearchParams из хеша
    const hashParams = new URLSearchParams(hash);
    
    // Если в хеше есть прямые параметры Telegram
    if (hashParams.has('tgWebAppData')) {
      return hashParams.get('tgWebAppData') || '';
    }
    
    // Если в хеше есть параметры Telegram
    if (hashParams.has('user') || hashParams.has('auth_date') || hashParams.has('hash')) {
      // Преобразуем сам хеш в initData строку
      return hash;
    }
    
    // Обрабатываем хэш как набор параметров, разделенных &
    if (hash.includes('tgWebAppData=')) {
      const hashParts = hash.split('&');
      for (const part of hashParts) {
        if (part.startsWith('tgWebAppData=')) {
          return decodeURIComponent(part.replace('tgWebAppData=', ''));
        }
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error parsing hash from URL:', error);
    return '';
  }
};

/**
 * Разбор всех параметров из хэша URL
 * @returns Объект с разобранными параметрами
 */
export const parseHashParameters = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  
  try {
    const hash = window.location.hash.slice(1);
    if (!hash) return {};
    
    const params: Record<string, string> = {};
    const hashParts = hash.split('&');
    
    for (const part of hashParts) {
      const [key, value] = part.split('=');
      if (key && value) {
        params[key] = decodeURIComponent(value);
      }
    }
    
    return params;
  } catch (error) {
    console.error('Error parsing hash parameters:', error);
    return {};
  }
};

/**
 * Получение данных инициализации из localStorage
 * @returns Строка initData или пустая строка
 */
export const getInitDataFromStorage = (): string => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return '';
  
  try {
    return localStorage.getItem('telegramInitData') || '';
  } catch (error) {
    console.error('Error getting initData from localStorage:', error);
    return '';
  }
};

/**
 * Сохранение данных инициализации в localStorage
 * @param initData - Данные инициализации для сохранения
 * @returns true, если данные успешно сохранены
 */
export const saveInitDataToStorage = (initData: string): boolean => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined' || !initData) return false;
  
  try {
    localStorage.setItem('telegramInitData', initData);
    return true;
  } catch (error) {
    console.error('Error saving initData to localStorage:', error);
    return false;
  }
};
