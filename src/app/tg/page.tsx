// src/app/tg/page.tsx
import React from 'react';
import { CategoryGrid } from '@/components/categories/CategoryGrid';
import { SearchBox } from '@/components/search/SearchBox';
import { FilterChips } from '@/components/filters/FilterChips';
import { NearbyButton } from '@/components/location/NearbyButton';
import { PlatformDebug } from '@/components/debug/PlatformDebug';

async function getCategories() {
  try {
    // В режиме разработки используем localhost
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_APP_URL;
    
    const response = await fetch(`${baseUrl}/api/categories`, {
      cache: 'force-cache',
      next: { revalidate: 3600 } // 1 hour
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Возвращаем fallback данные если API недоступен
    return [
      { id: 1, name: "Рестораны и кафе", nameEn: "Restaurants", slug: "restaurants", icon: "🍽️", order: 1 },
      { id: 2, name: "Медицина", nameEn: "Healthcare", slug: "healthcare", icon: "⚕️", order: 2 },
      { id: 3, name: "Юридические услуги", nameEn: "Legal Services", slug: "legal", icon: "⚖️", order: 3 },
      { id: 4, name: "Красота и здоровье", nameEn: "Beauty & Health", slug: "beauty", icon: "💄", order: 4 },
      { id: 5, name: "Автосервисы", nameEn: "Auto Services", slug: "auto", icon: "🔧", order: 5 },
      { id: 6, name: "Финансовые услуги", nameEn: "Financial Services", slug: "finance", icon: "🏦", order: 6 },
      { id: 7, name: "Образование", nameEn: "Education", slug: "education", icon: "🎓", order: 7 },
      { id: 8, name: "Недвижимость", nameEn: "Real Estate", slug: "realestate", icon: "🏠", order: 8 }
    ];
  }
}

export default async function ThreeGISHomePage() {
  const categories = await getCategories();
  
  return (
    <div className="threegis-app-container">
      <div className="threegis-app-main">
        {/* Header с логотипом 3GIS */}
        <div className="text-center py-6 px-4">
          <h1 className="text-3xl font-bold text-threegis-text">
            3<span className="text-threegis-accent">GIS</span>
          </h1>
          <p className="text-threegis-secondary text-sm mt-2">
            Твой проводник в Америке
          </p>
        </div>
        
        {/* Поиск */}
        <div className="px-4 mb-6">
          <SearchBox placeholder="Поиск ресторанов, врачей, услуг..." />
        </div>
        
        {/* Быстрые фильтры + кнопка геолокации */}
        <div className="mb-6">
          <div className="px-4 mb-4">
            <FilterChips />
          </div>
          
          {/* Кнопка "Рядом со мной" */}
          <div className="px-4">
            <NearbyButton className="w-full" />
          </div>
        </div>
        
        {/* Сетка категорий */}
        <div className="px-4">
          <CategoryGrid categories={categories} />
        </div>
        
        {/* Статистика */}
        <div className="px-4 mt-8 text-center">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-threegis-text mb-2">
              🇺🇸 Русскоязычная Америка
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-threegis-accent">5.5M</div>
                <div className="text-threegis-secondary">Русскоговорящих</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-threegis-accent">{categories?.length || 8}</div>
                <div className="text-threegis-secondary">Категорий услуг</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Популярные города */}
        <div className="px-4 mt-6">
          <h3 className="text-lg font-semibold text-threegis-text mb-3">
            🏙️ Популярные города
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco'].map((city) => (
              <div key={city} className="flex-shrink-0 bg-white border rounded-lg px-3 py-2 text-sm">
                {city}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Debug информация */}
      <PlatformDebug />
    </div>
  );
}