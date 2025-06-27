// src/components/filters/LocationFilters.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, MapPin, X } from 'lucide-react';
// ✅ Telegram SDK v3.x - haptic feedback
import { hapticFeedbackImpactOccurred, hapticFeedbackSelectionChanged } from '@telegram-apps/sdk';

interface State {
  id: number;
  name: string;
  fullName: string;
  region: string;
  _count?: {
    cities: number;
  };
}

interface City {
  id: number;
  name: string;
  state: {
    id: number;
    name: string;
    fullName: string;
  };
  population: number;
}

/**
 * ✅ КАСКАДНЫЕ ФИЛЬТРЫ ШТАТ → ГОРОД
 * - Сначала выбирается штат, затем город
 * - Расположены в одну строку под поисковой строкой
 * - Haptic feedback при выборе (SDK v3.x)
 * - Автоматическое применение фильтров через URL
 */
export function LocationFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Текущие значения из URL
  const currentStateId = searchParams.get('stateId');
  const currentCityId = searchParams.get('cityId');
  
  // Состояние компонента
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [statesLoading, setStatesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Загрузка штатов при монтировании
  useEffect(() => {
    loadStates();
  }, []);

  // Загрузка городов при выборе штата
  useEffect(() => {
    if (selectedState) {
      loadCities(selectedState);
    } else {
      setCities([]);
      setSelectedCity('');
    }
  }, [selectedState]);

  // Синхронизация с URL параметрами
  useEffect(() => {
    if (currentStateId && currentStateId !== selectedState) {
      setSelectedState(currentStateId);
    }
    if (currentCityId && currentCityId !== selectedCity) {
      setSelectedCity(currentCityId);
    }
  }, [currentStateId, currentCityId, selectedState, selectedCity]);

  /**
   * Загрузка списка штатов
   */
  const loadStates = async () => {
    try {
      setStatesLoading(true);
      const response = await fetch('/api/states');
      const data = await response.json();
      
      if (data.success) {
        setStates(data.states || []);
      } else {
        console.error('States API error:', data.error);
        setStates([]);
      }
    } catch (error) {
      console.error('Error loading states:', error);
      setStates([]);
    } finally {
      setStatesLoading(false);
    }
  };

  /**
   * Загрузка городов для выбранного штата
   */
  const loadCities = async (stateId: string) => {
    try {
      setCitiesLoading(true);
      const response = await fetch(`/api/cities?stateId=${stateId}`);
      const data = await response.json();
      
      if (data.success) {
        setCities(data.cities || []);
      } else {
        console.error('Cities API error:', data.error);
        setCities([]);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  };

  /**
   * Обработчик выбора штата
   */
  const handleStateChange = async (stateId: string) => {
    try {
      // ✅ Haptic feedback для изменения выбора (SDK v3.x)
      if (hapticFeedbackSelectionChanged.isAvailable()) {
        hapticFeedbackSelectionChanged();
      }
      
      setSelectedState(stateId);
      setSelectedCity(''); // Сброс города при смене штата
      
      // Обновляем URL
      updateURL({ stateId, cityId: undefined });
    } catch (error) {
      console.error('State selection error:', error);
      setSelectedState(stateId);
      setSelectedCity('');
      updateURL({ stateId, cityId: undefined });
    }
  };

  /**
   * Обработчик выбора города
   */
  const handleCityChange = async (cityId: string) => {
    try {
      // ✅ Haptic feedback для изменения выбора (SDK v3.x)
      if (hapticFeedbackSelectionChanged.isAvailable()) {
        hapticFeedbackSelectionChanged();
      }
      
      setSelectedCity(cityId);
      
      // Обновляем URL
      updateURL({ stateId: selectedState, cityId });
    } catch (error) {
      console.error('City selection error:', error);
      setSelectedCity(cityId);
      updateURL({ stateId: selectedState, cityId });
    }
  };

  /**
   * Сброс фильтров
   */
  const handleReset = async () => {
    try {
      // ✅ Haptic feedback для действия сброса (SDK v3.x)
      if (hapticFeedbackImpactOccurred.isAvailable()) {
        hapticFeedbackImpactOccurred('light');
      }
      
      setSelectedState('');
      setSelectedCity('');
      setCities([]);
      
      // Очищаем URL от location фильтров
      updateURL({ stateId: undefined, cityId: undefined });
    } catch (error) {
      console.error('Reset error:', error);
      // Fallback без haptic feedback
      setSelectedState('');
      setSelectedCity('');
      setCities([]);
      updateURL({ stateId: undefined, cityId: undefined });
    }
  };

  /**
   * Обновление URL с сохранением других параметров
   */
  const updateURL = ({ stateId, cityId }: { stateId?: string; cityId?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Удаляем старые location параметры
    params.delete('stateId');
    params.delete('cityId');
    
    // Добавляем новые если есть
    if (stateId) {
      params.set('stateId', stateId);
    }
    if (cityId) {
      params.set('cityId', cityId);
    }
    
    // Навигация с сохранением других параметров (category, search и т.д.)
    const newUrl = `/tg/businesses${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl);
  };

  /**
   * Получение названия выбранного штата
   */
  const getSelectedStateName = (): string => {
    if (!selectedState) return 'Выберите штат';
    const state = states.find(s => s.id.toString() === selectedState);
    return state ? state.name : 'Выберите штат';
  };

  /**
   * Получение названия выбранного города
   */
  const getSelectedCityName = (): string => {
    if (!selectedCity) return 'Выберите город';
    const city = cities.find(c => c.id.toString() === selectedCity);
    return city ? city.name : 'Выберите город';
  };

  return (
    <div className="bg-white px-4 py-3 border-b">
      {/* Заголовок с кнопкой сброса */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Местоположение</span>
        </div>
        
        {(selectedState || selectedCity) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            <X className="w-3 h-3" />
            Сброс
          </button>
        )}
      </div>

      {/* Каскадные селекты в одну строку */}
      <div className="flex gap-3">
        {/* Выбор штата */}
        <div className="flex-1 relative">
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            disabled={statesLoading}
            className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {statesLoading ? 'Загрузка...' : 'Выберите штат'}
            </option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name} ({state.fullName})
                {state._count?.cities && ` - ${state._count.cities} городов`}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {/* Выбор города */}
        <div className="flex-1 relative">
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={!selectedState || citiesLoading}
            className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {!selectedState 
                ? 'Сначала выберите штат'
                : citiesLoading 
                  ? 'Загрузка...' 
                  : 'Выберите город'}
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
                {city.population > 100000 && (
                  ` (${Math.round(city.population / 1000)}k жителей)`
                )}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Индикатор активных фильтров */}
      {(selectedState || selectedCity) && (
        <div className="mt-3 text-xs text-gray-600">
          <span>Фильтр: </span>
          {selectedState && (
            <span className="text-blue-600">
              {getSelectedStateName()}
              {selectedCity && ` → ${getSelectedCityName()}`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}