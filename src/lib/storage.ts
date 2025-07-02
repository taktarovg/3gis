// lib/storage.ts - Safe storage wrapper для Next.js 15.3.3
'use client';

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

// Mock storage для SSR окружения
class MockStorage implements StorageAdapter {
  private storage = new Map<string, string>();
  
  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }
  
  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }
  
  removeItem(key: string): void {
    this.storage.delete(key);
  }
  
  clear(): void {
    this.storage.clear();
  }
}

// Safe storage wrapper с проверкой SSR
class SafeStorage implements StorageAdapter {
  private storage: StorageAdapter;
  
  constructor() {
    // Проверяем доступность localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    } else {
      console.warn('Using mock storage since localStorage is not available');
      this.storage = new MockStorage();
    }
  }
  
  getItem(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }
  
  setItem(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  }
  
  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  }
  
  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }
}

// Создаем единственный экземпляр
export const safeStorage = new SafeStorage();

// Утилиты для работы с типизированными данными
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = safeStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error parsing storage item "${key}":`, error);
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    safeStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting storage item "${key}":`, error);
  }
}

export function removeStorageItem(key: string): void {
  safeStorage.removeItem(key);
}

// Специальные хуки для React
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State для хранения нашего значения
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  
  // Загружаем значение из storage после hydration
  useEffect(() => {
    try {
      const item = getStorageItem(key, initialValue);
      setStoredValue(item);
    } catch (error) {
      console.error(`Error loading storage item "${key}":`, error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);
  
  // Функция для обновления значения
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      setStorageItem(key, value);
    } catch (error) {
      console.error(`Error setting storage item "${key}":`, error);
    }
  };
  
  return [storedValue, setValue];
}

// Хук для проверки доступности localStorage
export function useStorageAvailable(): boolean {
  const [isAvailable, setIsAvailable] = useState(false);
  
  useEffect(() => {
    setIsAvailable(typeof window !== 'undefined' && !!window.localStorage);
  }, []);
  
  return isAvailable;
}
