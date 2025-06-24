'use client';

import { useState, useEffect } from 'react';

interface State {
  id: string;
  name: string;
  fullName: string;
  region: string;
}

interface City {
  id: number;
  name: string;
  stateId: string;
}

interface LocationSelectorsProps {
  selectedStateId?: string;
  selectedCityId?: number;
  onStateChange: (stateId?: string) => void;
  onCityChange: (cityId?: number) => void;
}

export function LocationSelectors({
  selectedStateId,
  selectedCityId,
  onStateChange,
  onCityChange,
}: LocationSelectorsProps) {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  // Загрузка штатов при монтировании
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoadingStates(true);
        const response = await fetch('/api/states');
        const data = await response.json();
        
        if (data.success) {
          setStates(data.data || []);
        } else {
          console.error('Error fetching states:', data.error);
        }
      } catch (error) {
        console.error('Error fetching states:', error);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();
  }, []);

  // Загрузка городов при выборе штата
  useEffect(() => {
    if (selectedStateId) {
      const fetchCities = async () => {
        try {
          setLoadingCities(true);
          const response = await fetch(`/api/cities?stateId=${selectedStateId}`);
          const data = await response.json();
          
          if (data.success) {
            setCities(data.cities || []);
          } else {
            console.error('Error fetching cities:', data.error);
            setCities([]);
          }
        } catch (error) {
          console.error('Error fetching cities:', error);
          setCities([]);
        } finally {
          setLoadingCities(false);
        }
      };

      fetchCities();
    } else {
      setCities([]);
      onCityChange(undefined);
    }
  }, [selectedStateId, onCityChange]);

  return (
    <div className="flex gap-3">
      {/* Селектор штатов */}
      <div className="flex-1">
        <select
          value={selectedStateId || ''}
          onChange={(e) => onStateChange(e.target.value || undefined)}
          disabled={loadingStates}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">
            {loadingStates ? 'Загрузка штатов...' : 'Все штаты'}
          </option>
          {states.map((state) => (
            <option key={state.id} value={state.id}>
              {state.name} ({state.fullName})
            </option>
          ))}
        </select>
      </div>

      {/* Селектор городов */}
      <div className="flex-1">
        <select
          value={selectedCityId?.toString() || ''}
          onChange={(e) => onCityChange(e.target.value ? parseInt(e.target.value) : undefined)}
          disabled={!selectedStateId || loadingCities}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">
            {loadingCities ? 'Загрузка...' : selectedStateId ? 'Все города' : 'Выберите штат'}
          </option>
          {cities.map((city) => (
            <option key={city.id} value={city.id.toString()}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
