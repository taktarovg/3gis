// src/services/token-refresh-service.ts
'use client';

import { retrieveLaunchParams } from '@telegram-apps/sdk';
import { logger } from '@/utils/logger';

interface RefreshTokenResponse {
  user: any;
  token: string;
}

interface RefreshTokenOptions {
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Сервис для автоматического обновления JWT токенов в 3GIS
 * Использует актуальные initData от Telegram для получения нового токена
 */
export class TokenRefreshService {
  private static isRefreshing = false;
  private static refreshPromise: Promise<string | null> | null = null;

  /**
   * Обновление токена через Telegram initData
   * Использует современный API @telegram-apps/sdk v3.x
   */
  static async refreshToken(options: RefreshTokenOptions = {}): Promise<string | null> {
    const { retryAttempts = 3, retryDelay = 1000 } = options;

    // Предотвращаем множественные одновременные обновления
    if (this.isRefreshing && this.refreshPromise) {
      logger.logAuth('Token refresh already in progress, waiting...');
      return await this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this._performRefresh(retryAttempts, retryDelay);

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Внутренний метод для выполнения обновления
   */
  private static async _performRefresh(
    retryAttempts: number, 
    retryDelay: number
  ): Promise<string | null> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        logger.logAuth(`Token refresh attempt ${attempt}/${retryAttempts}`);

        // Получаем актуальные launch parameters
        const launchParams = this._getLaunchParams();
        if (!launchParams) {
          throw new Error('Unable to retrieve launch parameters');
        }

        // Выполняем запрос на обновление токена
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData: launchParams.initDataRaw,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data: RefreshTokenResponse = await response.json();
        
        if (!data.token) {
          throw new Error('No token received from server');
        }

        logger.logAuth('Token refreshed successfully');
        return data.token;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.error(`Token refresh attempt ${attempt} failed:`, lastError);

        // Если это не последняя попытка, ждем перед повтором
        if (attempt < retryAttempts) {
          await this._delay(retryDelay * attempt); // Увеличиваем задержку с каждой попыткой
        }
      }
    }

    // Все попытки неудачны
    logger.error('All token refresh attempts failed:', lastError);
    return null;
  }

  /**
   * Получение launch parameters с обработкой ошибок
   */
  private static _getLaunchParams(): { initDataRaw: string } | null {
    try {
      // Используем современный API v3.x
      const params = retrieveLaunchParams();
      
      // В v3.x структура изменилась, данные находятся в tgWebAppData
      if (params.tgWebAppData) {
        // Преобразуем объект обратно в строку initData
        const initDataRaw = this._serializeInitData(params.tgWebAppData);
        return { initDataRaw };
      }
      
      logger.error('No tgWebAppData found in launch parameters');
      return null;
    } catch (error) {
      logger.error('Error retrieving launch parameters:', error);
      
      // Fallback для разработки или особых случаев
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Using development mode - creating mock initData');
        return this._createMockInitData();
      }
      
      return null;
    }
  }

  /**
   * Сериализация tgWebAppData обратно в формат initData
   */
  private static _serializeInitData(webAppData: any): string {
    const params = new URLSearchParams();
    
    // Преобразуем объект в формат initData строки
    Object.entries(webAppData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, String(value));
        }
      }
    });
    
    return params.toString();
  }

  /**
   * Создание mock initData для разработки
   */
  private static _createMockInitData(): { initDataRaw: string } | null {
    try {
      const mockData = new URLSearchParams([
        ['user', JSON.stringify({
          id: Date.now(),
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser3gis',
          language_code: 'ru',
          is_premium: false,
          allows_write_to_pm: true,
        })],
        ['auth_date', Math.floor(Date.now() / 1000).toString()],
        ['query_id', `test_${Date.now()}`],
        ['hash', 'mock_hash_for_development'],
      ]).toString();

      return { initDataRaw: mockData };
    } catch (error) {
      logger.error('Error creating mock initData:', error);
      return null;
    }
  }

  /**
   * Проверка необходимости обновления токена
   */
  static shouldRefreshToken(token: string | null): boolean {
    if (!token) return true;

    try {
      // Простая проверка JWT структуры
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      // Декодируем payload
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      // Проверяем истечение
      if (payload.exp && payload.exp <= now) {
        return true;
      }

      // Проверяем приближение истечения (за 2 часа)
      if (payload.exp && (payload.exp - now) <= 7200) {
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error checking token expiry:', error);
      return true;
    }
  }

  /**
   * Проактивное обновление токена
   */
  static async proactiveRefresh(currentToken: string | null): Promise<string | null> {
    if (!this.shouldRefreshToken(currentToken)) {
      logger.logAuth('Token refresh not needed');
      return currentToken;
    }

    logger.logAuth('Proactive token refresh initiated');
    return await this.refreshToken();
  }

  /**
   * Вспомогательный метод для задержки
   */
  private static _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Очистка состояния сервиса
   */
  static reset(): void {
    this.isRefreshing = false;
    this.refreshPromise = null;
    logger.logAuth('Token refresh service reset');
  }
}

/**
 * Экспорт основных методов для удобства использования
 */
export const {
  refreshToken,
  shouldRefreshToken,
  proactiveRefresh,
  reset: resetTokenRefreshService,
} = TokenRefreshService;
