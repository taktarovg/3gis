import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';
import type { BusinessFormData } from '@/app/tg/add-business/page';

interface State {
  id: string;
  name: string;
  region: string;
}

interface City {
  id: number;
  name: string;
  stateId: string;
  state?: {
    name: string;
  };
}

interface AddressStepProps {
  formData: BusinessFormData;
  setFormData: (data: BusinessFormData) => void;
}

export function AddressStep({ formData, setFormData }: AddressStepProps) {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Load states on mount
  useEffect(() => {
    const fetchStates = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/states');
        const statesData = await response.json();
        setStates(statesData);
      } catch (err) {
        console.error('Error loading states:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  // Load cities when state is selected
  useEffect(() => {
    if (selectedState) {
      setCitiesLoading(true);
      const fetchCities = async () => {
        try {
          const response = await fetch(`/api/cities?state=${selectedState}`);
          const citiesData = await response.json();
          setCities(citiesData);
        } catch (err) {
          console.error('Error loading cities:', err);
        } finally {
          setCitiesLoading(false);
        }
      };
      
      fetchCities();
    } else {
      setCities([]);
      setCitiesLoading(false);
    }
  }, [selectedState]);

  // Initialize state/city from formData if available
  useEffect(() => {
    if (formData.city && cities.length > 0) {
      const city = cities.find(c => c.name === formData.city);
      if (city) {
        setSelectedCityId(city.id.toString());
        if (!selectedState) {
          setSelectedState(city.stateId);
        }
      }
    }
  }, [cities, formData.city, selectedState]);

  // Handle state selection
  const handleStateChange = (stateId: string) => {
    setCities([]); // Clear cities immediately
    setSelectedState(stateId);
    setSelectedCityId('');
    // Clear city in form data
    setFormData({...formData, city: ''});
  };

  // Handle city selection
  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    const selectedCity = cities.find(c => c.id.toString() === cityId);
    if (selectedCity) {
      setFormData({...formData, city: selectedCity.name});
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Адрес и контакты
        </CardTitle>
        <CardDescription>
          Где находится заведение
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="address">Полный адрес *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="1273 Brighton Beach Ave, Brooklyn, NY 11235"
            className="mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="state">Штат *</Label>
          <Select value={selectedState} onValueChange={handleStateChange} disabled={loading}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder={loading ? "Загружаем штаты..." : "Сначала выберите штат"} />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {states.map((state) => (
                <SelectItem key={state.id} value={state.id}>
                  {state.name} ({state.region})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedState && (
          <div>
            <Label htmlFor="city">Город *</Label>
            <Select value={selectedCityId} onValueChange={handleCityChange} disabled={citiesLoading}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={citiesLoading ? "Загружаем города..." : "Выберите город"} />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {citiesLoading ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Загружаем...
                    </div>
                  </SelectItem>
                ) : (
                  cities.map((city) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Города в штате {states.find(s => s.id === selectedState)?.name}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="(718) 555-0123"
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="website">Веб-сайт</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              placeholder="https://example.com"
              className="mt-2"
            />
          </div>
        </div>

        {/* Additional features */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3">
            Дополнительные возможности
          </Label>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {[
              { key: 'parking', label: '🅿️ Парковка' },
              { key: 'wifi', label: '📶 Wi-Fi' },
              { key: 'delivery', label: '🚚 Доставка' },
              { key: 'takeout', label: '🥡 На вынос' },
              { key: 'cards', label: '💳 Принимаем карты' },
              { key: 'accessible', label: '♿ Доступность' }
            ].map((feature) => (
              <label key={feature.key} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.features.includes(feature.key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        features: [...formData.features, feature.key]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        features: formData.features.filter((f: string) => f !== feature.key)
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{feature.label}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
