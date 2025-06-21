// src/app/tg/page.tsx
import React from 'react';
import { CategoryGrid } from '@/components/categories/CategoryGrid';
import { SearchBox } from '@/components/search/SearchBox';
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
        {/* Поиск */}
        <div className="px-4 mb-6 mt-6">
          <SearchBox placeholder="Поиск ресторанов, врачей, услуг..." />
        </div>
        
        {/* Кнопка "Рядом со мной" */}
        <div className="px-4 mb-6">
          <NearbyButton className="w-full" />
        </div>
        
        {/* Сетка категорий */}
        <div className="px-4">
          <CategoryGrid categories={categories} />
        </div>
      </div>
      
      {/* Debug информация */}
      <PlatformDebug />
    </div>
  );
}