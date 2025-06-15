// src/lib/api-client.ts
'use client';

import { TokenRefreshService } from '@/services/token-refresh-service';
import { AUTH_CONSTANTS } from '@/lib/auth';
import { logger } from '@/utils/logger';

interface ApiClientOptions {
  baseURL?: string;
  timeout?: number;
  retryAttempts?: number;
  autoRefresh?: boolean;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
  skipAutoRefresh?: boolean;
}

/**
 * HTTP клиент для 3GIS с автоматическим обновлением токенов
 * Интегрирован с TokenRefreshService для seamless UX
 */
export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;
  private autoRefresh: boolean;

  constructor(options: ApiClientOptions = {}) {
    this.baseURL = options.baseURL || '';
    this.timeout = options.timeout || 10000; // 10 секунд
    this.retryAttempts = options.retryAttempts || 2;
    this.autoRefresh = options.autoRefresh ?? true;
  }

  /**
   * Основной метод для выполнения HTTP запросов
   */
  async request<T = any>(
    url: string, 
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      timeout = this.timeout,
      skipAuth = false,
      skipAutoRefresh = false,
      ...fetchOptions
    } = options;

    const fullURL = this._buildURL(url);
    let currentToken = this._getCurrentToken();

    // Подготовка заголовков
    const headers = new Headers(fetchOptions.headers);
    
    // Добавляем авторизацию если требуется
    if (!skipAuth && currentToken) {
      headers.set('Authorization', `Bearer ${currentToken}`);
    }

    // Устанавливаем Content-Type по умолчанию
    if (!headers.has('Content-Type') && (fetchOptions.method === 'POST' || fetchOptions.method === 'PUT' || fetchOptions.method === 'PATCH')) {
      headers.set('Content-Type', 'application/json');
    }

    // Создаем AbortController для timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Выполняем запрос
      let response = await fetch(fullURL, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Если получили 401 и включено автообновление токенов
      if (response.status === 401 && this.autoRefresh && !skipAutoRefresh && !skipAuth) {
        logger.logAuth('Received 401, attempting token refresh');
        
        const newToken = await this._handleTokenRefresh();
        
        if (newToken) {
          // Повторяем запрос с новым токеном
          headers.set('Authorization', `Bearer ${newToken}`);
          
          response = await fetch(fullURL, {
            ...fetchOptions,
            headers,
            signal: AbortSignal.timeout(timeout),
          });
          
          logger.logAuth('Request retried with new token');
        }
      }

      // Проверяем статус ответа
      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          await this._safeResponseText(response)
        );
      }

      // Парсим ответ
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as unknown as T;
      }

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'Request timed out');
      }
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        0,
        String(error)
      );
    }
  }

  /**
   * GET запрос
   */
  async get<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * POST запрос
   */
  async post<T = any>(
    url: string, 
    data?: any, 
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT запрос
   */
  async put<T = any>(
    url: string, 
    data?: any, 
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH запрос
   */
  async patch<T = any>(
    url: string, 
    data?: any, 
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE запрос
   */
  async delete<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * Обработка обновления токена
   */
  private async _handleTokenRefresh(): Promise<string | null> {
    try {
      const newToken = await TokenRefreshService.refreshToken({
        retryAttempts: this.retryAttempts,
      });

      if (newToken) {
        // Сохраняем новый токен
        if (typeof window !== 'undefined') {
          localStorage.setItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY, newToken);
        }
        return newToken;
      }

      return null;
    } catch (error) {
      logger.error('Token refresh failed:', error);
      return null;
    }
  }

  /**
   * Получение текущего токена
   */
  private _getCurrentToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY);
  }

  /**
   * Построение полного URL
   */
  private _buildURL(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    return `${this.baseURL}${url.startsWith('/') ? url : `/${url}`}`;
  }

  /**
   * Безопасное получение текста ответа
   */
  private async _safeResponseText(response: Response): Promise<string> {
    try {
      return await response.text();
    } catch {
      return 'Unable to read response body';
    }
  }
}

/**
 * Класс для API ошибок
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isTimeoutError(): boolean {
    return this.status === 408;
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }
}

/**
 * Глобальный экземпляр API клиента для 3GIS
 */
export const apiClient = new ApiClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || '',
  timeout: 15000, // 15 секунд для 3GIS
  retryAttempts: 2,
  autoRefresh: true,
});

/**
 * Хуки для React Query интеграции
 */
export const ApiClientHooks = {
  /**
   * Обертка для React Query
   */
  createQueryFn: <T>(url: string, options?: RequestOptions) => {
    return async (): Promise<T> => {
      return apiClient.get<T>(url, options);
    };
  },

  /**
   * Обертка для мутаций
   */
  createMutationFn: <TData, TVariables>(
    url: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
  ) => {
    return async (variables: TVariables): Promise<TData> => {
      switch (method) {
        case 'POST':
          return apiClient.post<TData>(url, variables);
        case 'PUT':
          return apiClient.put<TData>(url, variables);
        case 'PATCH':
          return apiClient.patch<TData>(url, variables);
        case 'DELETE':
          return apiClient.delete<TData>(url);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    };
  },
};

/**
 * Утилиты для работы с API
 */
export const ApiUtils = {
  /**
   * Проверка доступности API
   */
  async healthCheck(): Promise<boolean> {
    try {
      await apiClient.get('/api/health', { 
        skipAuth: true, 
        timeout: 5000,
        skipAutoRefresh: true,
      });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Ручная проверка и обновление токена
   */
  async refreshTokenIfNeeded(): Promise<boolean> {
    const currentToken = apiClient['_getCurrentToken']();
    
    if (TokenRefreshService.shouldRefreshToken(currentToken)) {
      const newToken = await TokenRefreshService.refreshToken();
      return !!newToken;
    }
    
    return true;
  },

  /**
   * Очистка всех токенов и сброс состояния
   */
  clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_CONSTANTS.TOKEN_REFRESH_KEY);
    }
    TokenRefreshService.reset();
  },
};
