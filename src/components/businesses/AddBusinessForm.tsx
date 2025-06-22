'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/upload/ImageUpload';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/store/auth-store';
import { ArrowLeft, MapPin, Phone, Globe, Clock } from 'lucide-react';

interface AddBusinessFormProps {
  onSuccess?: (businessId: number) => void;
  onCancel?: () => void;
}

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

interface Category {
  id: number;
  name: string;
  nameEn: string;
  slug: string;
  icon: string;
}

interface BusinessFormData {
  name: string;
  nameEn: string;
  description: string;
  categoryId: string;
  address: string;
  cityId: string;
  stateId: string;
  phone: string;
  website: string;
  email: string;
  languages: string[];
  hasParking: boolean;
  hasWiFi: boolean;
  acceptsCrypto: boolean;
  businessHours: Record<string, { open: string; close: string; closed: boolean }>;
}



const DAYS_OF_WEEK = [
  { key: 'mon', name: 'Понедельник' },
  { key: 'tue', name: 'Вторник' },
  { key: 'wed', name: 'Среда' },
  { key: 'thu', name: 'Четверг' },
  { key: 'fri', name: 'Пятница' },
  { key: 'sat', name: 'Суббота' },
  { key: 'sun', name: 'Воскресенье' }
];

export function AddBusinessForm({ onSuccess, onCancel }: AddBusinessFormProps) {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  
  // Data from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    nameEn: '',
    description: '',
    categoryId: '',
    address: '',
    cityId: '',
    stateId: '',
    phone: '',
    website: '',
    email: '',
    languages: ['ru', 'en'],
    hasParking: false,
    hasWiFi: false,
    acceptsCrypto: false,
    businessHours: {
      mon: { open: '09:00', close: '18:00', closed: false },
      tue: { open: '09:00', close: '18:00', closed: false },
      wed: { open: '09:00', close: '18:00', closed: false },
      thu: { open: '09:00', close: '18:00', closed: false },
      fri: { open: '09:00', close: '18:00', closed: false },
      sat: { open: '10:00', close: '16:00', closed: false },
      sun: { open: '10:00', close: '16:00', closed: true }
    }
  });

  // Load categories and states on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesRes, statesRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/states')
        ]);

        const categoriesData = await categoriesRes.json();
        const statesData = await statesRes.json();

        setCategories(categoriesData);
        setStates(statesData);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load cities when state is selected
  useEffect(() => {
    if (selectedState) {
      const fetchCities = async () => {
        try {
          const response = await fetch(`/api/cities?state=${selectedState}`);
          const citiesData = await response.json();
          setCities(citiesData);
        } catch (err) {
          console.error('Error loading cities:', err);
        }
      };
      
      fetchCities();
    } else {
      setCities([]);
    }
  }, [selectedState]);

  const updateFormData = (field: keyof BusinessFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle state selection
  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setFormData(prev => ({ 
      ...prev, 
      stateId,
      cityId: '' // Reset city when state changes
    }));
  };

  // Handle city selection
  const handleCityChange = (cityId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      cityId
    }));
  };

  const updateBusinessHours = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const handlePhotoUpload = (imageUrl: string) => {
    setUploadedPhotos(prev => [...prev, imageUrl]);
  };

  const removePhoto = (indexToRemove: number) => {
    setUploadedPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Создаем заведение
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ownerId: user.id,
          photos: uploadedPhotos
        })
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при создании заведения');
      }
      
      const business = await response.json();
      onSuccess?.(business.id);
      
    } catch (error) {
      console.error('Error creating business:', error);
      alert('Ошибка при создании заведения. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === parseInt(formData.categoryId));

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold">Добавить заведение</h1>
            <p className="text-sm text-gray-600">Шаг {currentStep} из 4</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Основная информация</h2>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Название заведения *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Ресторан Русский дом"
              />
            </div>

            <div>
              <Label htmlFor="nameEn">Название на английском</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => updateFormData('nameEn', e.target.value)}
                placeholder="Russian House Restaurant"
              />
            </div>

            <div>
              <Label htmlFor="category">Категория *</Label>
              <Select value={formData.categoryId} onValueChange={(value) => updateFormData('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Расскажите о вашем заведении..."
                rows={3}
              />
            </div>
          </div>

          <Button 
            onClick={() => setCurrentStep(2)}
            disabled={!formData.name || !formData.categoryId}
            className="w-full"
          >
            Далее →
          </Button>
        </div>
      )}

      {/* Step 2: Location & Contact */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Адрес и контакты
          </h2>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="address">Полный адрес *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                placeholder="1273 Brighton Beach Ave, Brooklyn, NY 11235"
              />
            </div>

            <div>
              <Label htmlFor="state">Штат *</Label>
              <Select value={selectedState} onValueChange={handleStateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Сначала выберите штат" />
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
                <Select value={formData.cityId} onValueChange={handleCityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите город" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Города в штате {states.find(s => s.id === selectedState)?.name}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="phone">Телефон</Label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="(718) 555-0123"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Веб-сайт</Label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => updateFormData('website', e.target.value)}
                    placeholder="www.example.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email для связи</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="info@restaurant.com"
              />
            </div>

            {/* Languages and Features */}
            <div className="space-y-3">
              <Label>Особенности заведения</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.languages.includes('ru')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFormData('languages', [...formData.languages, 'ru']);
                      } else {
                        updateFormData('languages', formData.languages.filter(lang => lang !== 'ru'));
                      }
                    }}
                  />
                  <Label>🇷🇺 Русский язык</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.hasParking}
                    onCheckedChange={(checked) => updateFormData('hasParking', checked)}
                  />
                  <Label>🅿️ Парковка</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.hasWiFi}
                    onCheckedChange={(checked) => updateFormData('hasWiFi', checked)}
                  />
                  <Label>📶 WiFi</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.acceptsCrypto}
                    onCheckedChange={(checked) => updateFormData('acceptsCrypto', checked)}
                  />
                  <Label>₿ Принимаем криптовалюту</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
              ← Назад
            </Button>
            <Button 
              onClick={() => setCurrentStep(3)}
              disabled={!formData.address || !formData.cityId || !selectedState}
              className="flex-1"
            >
              Далее →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Photos */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Фотографии заведения</h2>
          <p className="text-sm text-gray-600">
            Добавьте фотографии, чтобы привлечь больше клиентов. Все изображения автоматически конвертируются в WebP для оптимальной загрузки.
          </p>
          
          {selectedCategory && (
            <ImageUpload
              type="business"
              category={selectedCategory.slug}
              onUpload={handlePhotoUpload}
              maxFiles={10}
              currentImages={uploadedPhotos}
            />
          )}

          {/* Preview uploaded photos */}
          {uploadedPhotos.length > 0 && (
            <div className="space-y-2">
              <Label>Загруженные фотографии ({uploadedPhotos.length})</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={photo}
                      alt={`Фото ${index + 1}`}
                      width={96}
                      height={96}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
              ← Назад
            </Button>
            <Button onClick={() => setCurrentStep(4)} className="flex-1">
              Далее →
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Business Hours */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Часы работы
          </h2>
          
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.key} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-20 text-sm font-medium">
                  {day.name}
                </div>
                
                <div className="flex items-center space-x-2 flex-1">
                  <Checkbox
                    checked={!formData.businessHours[day.key].closed}
                    onCheckedChange={(checked) => updateBusinessHours(day.key, 'closed', !checked)}
                  />
                  
                  {!formData.businessHours[day.key].closed ? (
                    <>
                      <Input
                        type="time"
                        value={formData.businessHours[day.key].open}
                        onChange={(e) => updateBusinessHours(day.key, 'open', e.target.value)}
                        className="w-24"
                      />
                      <span className="text-gray-500">-</span>
                      <Input
                        type="time"
                        value={formData.businessHours[day.key].close}
                        onChange={(e) => updateBusinessHours(day.key, 'close', e.target.value)}
                        className="w-24"
                      />
                    </>
                  ) : (
                    <span className="text-gray-500 italic">Закрыто</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex-1">
              ← Назад
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Создаем...' : '🚀 Создать заведение'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
