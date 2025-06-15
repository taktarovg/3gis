// src/hooks/use-token-manager.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { verifyToken, AUTH_CONSTANTS, type AuthPayload } from '@/lib/auth';
import { logger } from '@/utils/logger';

interface TokenManagerState {
  token: string | null;
  payload: AuthPayload | null;
  isValid: boolean;
  isExpiring: boolean;
  needsRefresh: boolean;
  lastRefresh: number | null;
}

interface TokenManagerActions {
  setToken: (token: string) => void;
  clearToken: () => void;
  checkTokenValidity: () => boolean;
  shouldRefreshToken: () => boolean;
  markRefreshTime: () => void;
}

/**
 * Хук для управления JWT токенами в 3GIS
 * Автоматически проверяет валидность и определяет необходимость обновления
 */
export function useTokenManager(): TokenManagerState & TokenManagerActions {
  const [state, setState] = useState<TokenManagerState>({
    token: null,
    payload: null,
    isValid: false,
    isExpiring: false,
    needsRefresh: false,
    lastRefresh: null,
  });

  /**
   * Проверка токена и обновление состояния
   */
  const checkToken = useCallback((token: string | null): boolean => {
    if (!token) {
      setState(prev => ({
        ...prev,
        token: null,
        payload: null,
        isValid: false,
        isExpiring: false,
        needsRefresh: false,
      }));
      return false;
    }

    try {
      const payload = verifyToken(token);
      
      if (!payload) {
        setState(prev => ({
          ...prev,
          token: null,
          payload: null,
          isValid: false,
          isExpiring: false,
          needsRefresh: true, // Токен невалидный, нужно обновить
        }));
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - now;
      const isExpiring = timeUntilExpiry <= AUTH_CONSTANTS.REFRESH_THRESHOLD;
      const needsRefresh = isExpiring || timeUntilExpiry <= 0;

      setState(prev => ({
        ...prev,
        token,
        payload,
        isValid: timeUntilExpiry > 0,
        isExpiring,
        needsRefresh,
      }));

      logger.logAuth(`Token checked: valid=${timeUntilExpiry > 0}, expires in ${timeUntilExpiry}s`);
      return timeUntilExpiry > 0;
    } catch (error) {
      logger.error('Token verification error:', error);
      setState(prev => ({
        ...prev,
        token: null,
        payload: null,
        isValid: false,
        isExpiring: false,
        needsRefresh: true,
      }));
      return false;
    }
  }, []);

  /**
   * Загрузка токена из localStorage при инициализации
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY);
    const lastRefreshStr = localStorage.getItem(AUTH_CONSTANTS.TOKEN_REFRESH_KEY);
    const lastRefresh = lastRefreshStr ? parseInt(lastRefreshStr, 10) : null;

    setState(prev => ({ ...prev, lastRefresh }));
    
    if (storedToken) {
      checkToken(storedToken);
    }
  }, [checkToken]);

  /**
   * Сохранение нового токена
   */
  const setToken = useCallback((token: string) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY, token);
    checkToken(token);
    
    logger.logAuth('Token saved to localStorage');
  }, [checkToken]);

  /**
   * Очистка токена
   */
  const clearToken = useCallback(() => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_CONSTANTS.TOKEN_REFRESH_KEY);
    
    setState({
      token: null,
      payload: null,
      isValid: false,
      isExpiring: false,
      needsRefresh: false,
      lastRefresh: null,
    });
    
    logger.logAuth('Token cleared from localStorage');
  }, []);

  /**
   * Проверка валидности текущего токена
   */
  const checkTokenValidity = useCallback((): boolean => {
    return checkToken(state.token);
  }, [checkToken, state.token]);

  /**
   * Определение необходимости обновления токена
   */
  const shouldRefreshToken = useCallback((): boolean => {
    // Если токена нет или он невалидный
    if (!state.token || !state.isValid) {
      return true;
    }

    // Если токен скоро истечет
    if (state.isExpiring || state.needsRefresh) {
      return true;
    }

    // Если прошло много времени с последнего обновления
    if (state.lastRefresh) {
      const timeSinceRefresh = Date.now() - state.lastRefresh;
      const maxRefreshInterval = 12 * 60 * 60 * 1000; // 12 часов
      
      if (timeSinceRefresh > maxRefreshInterval) {
        return true;
      }
    }

    return false;
  }, [state]);

  /**
   * Отметка времени последнего обновления
   */
  const markRefreshTime = useCallback(() => {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    localStorage.setItem(AUTH_CONSTANTS.TOKEN_REFRESH_KEY, now.toString());
    setState(prev => ({ ...prev, lastRefresh: now }));
    
    logger.logAuth('Token refresh time marked');
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    setToken,
    clearToken,
    checkTokenValidity,
    shouldRefreshToken,
    markRefreshTime,
  };
}

/**
 * Утилиты для работы с токенами
 */
export const TokenUtils = {
  /**
   * Получение токена из localStorage
   */
  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY);
  },

  /**
   * Проверка истечения токена без состояния
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = verifyToken(token);
      if (!payload) return true;
      
      const now = Math.floor(Date.now() / 1000);
      return payload.exp <= now;
    } catch {
      return true;
    }
  },

  /**
   * Получение времени до истечения токена
   */
  getTimeUntilExpiry(token: string): number {
    try {
      const payload = verifyToken(token);
      if (!payload) return 0;
      
      const now = Math.floor(Date.now() / 1000);
      return Math.max(0, payload.exp - now);
    } catch {
      return 0;
    }
  },

  /**
   * Форматирование времени истечения токена
   */
  formatExpiryTime(token: string): string {
    try {
      const payload = verifyToken(token);
      if (!payload) return 'Недействительный токен';
      
      const expiryTime = new Date(payload.exp * 1000);
      return expiryTime.toLocaleString('ru-RU');
    } catch {
      return 'Ошибка чтения токена';
    }
  },
};
