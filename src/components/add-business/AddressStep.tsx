import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import type { BusinessFormData } from '@/app/tg/add-business/page';

interface AddressStepProps {
  formData: BusinessFormData;
  setFormData: (data: BusinessFormData) => void;
}

export function AddressStep({ formData, setFormData }: AddressStepProps) {
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Полный адрес *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1273 Brighton Beach Ave, Brooklyn, NY 11235"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Город *
          </label>
          <select 
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Выберите город</option>
            <option value="New York">Нью-Йорк</option>
            <option value="Los Angeles">Лос-Анджелес</option>
            <option value="Chicago">Чикаго</option>
            <option value="Miami">Майами</option>
            <option value="San Francisco">Сан-Франциско</option>
            <option value="Boston">Бостон</option>
            <option value="Seattle">Сиэтл</option>
            <option value="Philadelphia">Филадельфия</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Телефон
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="(718) 555-0123"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Веб-сайт
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({...formData, website: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com"
          />
        </div>

        {/* Additional features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Дополнительные удобства
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'parking', label: '🅿️ Парковка' },
              { key: 'wifi', label: '📶 Wi-Fi' },
              { key: 'delivery', label: '🚚 Доставка' },
              { key: 'takeout', label: '🥡 На вынос' },
              { key: 'cards', label: '💳 Карты' },
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