'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface AddressAutocompleteProps {
  onAddressSelect: (address: string) => void;
  placeholder?: string;
  className?: string;
}

interface AddressSuggestion {
  address: string;
  city: string;
  state: string;
}

/**
 * Простой хук debounce для этого компонента
 */
function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Автокомплит адресов на основе нашей БД заведений (избегаем дорогой Places API)
 */
export function AddressAutocomplete({ 
  onAddressSelect,
  placeholder = "Введите адрес или район...",
  className = ""
}: AddressAutocompleteProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedInput = useDebounce(input, 300);

  // Поиск адресов в нашей БД
  useEffect(() => {
    if (debouncedInput.length >= 2) {
      searchAddresses(debouncedInput);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [debouncedInput]);

  const searchAddresses = async (query: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/addresses/search?q=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const addresses = await response.json();
        setSuggestions(addresses);
        setShowDropdown(addresses.length > 0);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    const fullAddress = `${suggestion.address}, ${suggestion.city}, ${suggestion.state}`;
    setInput(fullAddress);
    onAddressSelect(fullAddress);
    setShowDropdown(false);
  };

  // Популярные районы для быстрого доступа
  const popularAreas = [
    'Brighton Beach, Brooklyn',
    'Sheepshead Bay, Brooklyn', 
    'Midtown Manhattan',
    'Forest Hills, Queens',
    'West Hollywood, Los Angeles'
  ];

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown с предложениями */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Найденные адреса */}
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">{suggestion.address}</div>
                  <div className="text-sm text-gray-500">{suggestion.city}, {suggestion.state}</div>
                </div>
              </div>
            </button>
          ))}
          
          {/* Если нет результатов, показываем популярные районы */}
          {suggestions.length === 0 && !isLoading && debouncedInput.length >= 2 && (
            <div className="px-4 py-2">
              <div className="text-sm text-gray-500 mb-2">Популярные районы:</div>
              {popularAreas.map((area, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(area);
                    onAddressSelect(area);
                    setShowDropdown(false);
                  }}
                  className="w-full px-2 py-1 text-left text-sm text-gray-600 hover:bg-gray-50 rounded"
                >
                  📍 {area}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
