// src/app/tg/page.tsx
import React from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { CategoryGrid } from '@/components/categories/CategoryGrid';
import { SearchBox } from '@/components/search/SearchBox';
import { NearbyButton } from '@/components/location/NearbyButton';
import { DonationWidget } from '@/components/donations/DonationWidget';
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
    <div className="threegis-app-container" data-scrollable>
      <div className="threegis-app-main">
        {/* Поиск */}
        <div className="px-4 mb-6 mt-6">
          <SearchBox placeholder="Поиск ресторанов, врачей, услуг..." />
        </div>
        
        {/* Кнопка "Рядом со мной" */}
        <div className="px-4 mb-6">
          <NearbyButton className="w-full" />
        </div>
        
        {/* Каталог русских чатов */}
        <div className="px-4 mb-6">
          <Link
            href="/tg/chats"
            className="block bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Русские чаты и группы</h3>
                  <p className="text-sm opacity-90">Найдите свое сообщество в США</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">18+</div>
                <div className="text-xs opacity-90">групп</div>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Сетка категорий */}
        <div className="px-4 mb-6">
          <CategoryGrid categories={categories} />
        </div>

        {/* Виджет донатов */}
        <div className="px-4 mb-6">
          <DonationWidget />
        </div>

        {/* Дополнительная информация о проекте */}
        <div className="px-4 mb-6 text-center">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              О проекте 3GIS
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Первый современный справочник русскоязычных организаций и сообществ в США.
              Помогаем найти врачей, юристов, рестораны, чаты и другие услуги на родном языке.
            </p>
            <div className="mt-3 flex items-center justify-center text-xs text-gray-500">
              <span className="mr-4">🏢 {categories.length} категорий</span>
              <span className="mr-4">💬 Каталог чатов</span>
              <span className="mr-4">🌎 По всей Америке</span>
              <span>🇷🇺 На русском языке</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug информация */}
      <PlatformDebug />
    </div>
  );
}
