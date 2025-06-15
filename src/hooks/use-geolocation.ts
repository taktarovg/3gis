'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentPosition, isGeolocationSupported } from '@/lib/maps/google-maps';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
  isSupported: boolean;
}

interface UseGeolocationReturn extends GeolocationState {
  requestLocation: () => Promise<void>;
  hasLocation: boolean;
  clearError: () => void;
}

/**
 * Хук для работы с геолокацией пользователя
 */
export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isLoading: false,
    isSupported: isGeolocationSupported(),
  });

  const requestLocation = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Геолокация не поддерживается вашим браузером'
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const position = await getCurrentPosition();
      
      setState(prev => ({
        ...prev,
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        isLoading: false,
        error: null,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Не удалось определить местоположение',
      }));
    }
  }, [state.isSupported]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Автоматический запрос локации при первой загрузке (опционально)
  useEffect(() => {
    // Раскомментируйте для автоматического запроса локации
    // if (state.isSupported && !state.latitude && !state.error && !state.isLoading) {
    //   requestLocation();
    // }
  }, []);

  return {
    ...state,
    requestLocation,
    hasLocation: state.latitude !== null && state.longitude !== null,
    clearError,
  };
}
