'use client';

import { useState, useCallback } from 'react';

interface UseDebounceReturn<T> {
  debouncedValue: T;
  setDebouncedValue: (value: T) => void;
  isDebouncing: boolean;
}

/**
 * Хук для debounce значений (например, для поиска)
 */
export function useDebounce<T>(
  initialValue: T,
  delay: number = 300
): UseDebounceReturn<T> {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const setDebouncedValueWithDelay = useCallback((newValue: T) => {
    setValue(newValue);
    setIsDebouncing(true);

    const timeoutId = setTimeout(() => {
      setDebouncedValue(newValue);
      setIsDebouncing(false);
    }, delay);

    // Cleanup function
    return () => clearTimeout(timeoutId);
  }, [delay]);

  return {
    debouncedValue,
    setDebouncedValue: setDebouncedValueWithDelay,
    isDebouncing
  };
}

/**
 * Простая версия debounce для строк
 */
export function useSimpleDebounce(initialValue: string = '', delay: number = 300) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  const updateValue = useCallback((newValue: string) => {
    setValue(newValue);
    
    const timeoutId = setTimeout(() => {
      setDebouncedValue(newValue);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [delay]);

  return {
    value,
    debouncedValue,
    setValue: updateValue
  };
}
