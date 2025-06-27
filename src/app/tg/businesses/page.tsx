// src/app/tg/businesses/page.tsx
import React from 'react';
import { BusinessList } from '@/components/businesses/BusinessList';
import { SearchBox } from '@/components/search/SearchBox';
import { LocationFilters } from '@/components/filters/LocationFilters';
import { prisma } from '@/lib/prisma';

interface BusinessesPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    filter?: string;
    city?: string;
    stateId?: string;
    cityId?: string;
    lat?: string;
    lng?: string;
    radius?: string;
  }>;
}

async function getBusinesses(params: {
  category?: string;
  search?: string;
  filter?: string;
  city?: string;
  stateId?: string;
  cityId?: string;
  lat?: string;
  lng?: string;
  radius?: string;
}) {
  try {
    // Используем API endpoint для унифицированной логики
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_APP_URL;
    
    const searchParams = new URLSearchParams();
    
    if (params.category) searchParams.set('category', params.category);
    if (params.search) searchParams.set('search', params.search);
    if (params.filter) searchParams.set('filter', params.filter);
    if (params.city) searchParams.set('city', params.city);
    if (params.stateId) searchParams.set('stateId', params.stateId);
    if (params.cityId) searchParams.set('cityId', params.cityId);
    if (params.lat) searchParams.set('lat', params.lat);
    if (params.lng) searchParams.set('lng', params.lng);
    if (params.radius) searchParams.set('radius', params.radius);
    
    const response = await fetch(`${baseUrl}/api/businesses?${searchParams.toString()}`, {
      cache: 'no-store' // Не кэшируем геолокационные запросы
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch businesses');
    }
    
    const data = await response.json();
    return data.businesses || [];
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }
}

async function getCategoryName(slug?: string) {
  if (!slug) return null;
  
  try {
    const category = await prisma.businessCategory.findUnique({
      where: { slug }
    });
    return category?.name || null;
  } catch (error) {
    return null;
  }
}

export default async function BusinessesPage({ searchParams }: BusinessesPageProps) {
  // Await searchParams для Next.js 15
  const params = await searchParams;
  
  const businesses = await getBusinesses(params);
  const categoryName = await getCategoryName(params.category);
  
  // Build page title
  let pageTitle = 'Заведения';
  if (params.lat && params.lng) {
    pageTitle = 'Рядом со мной';
  } else if (categoryName) {
    pageTitle = categoryName;
  } else if (params.search) {
    pageTitle = `Поиск: ${params.search}`;
  }

  return (
    <div className="threegis-app-container">
      <div className="threegis-app-main">
        {/* Header */}
        <div className="px-4 py-4 bg-white border-b">
          <h1 className="text-xl font-bold text-threegis-text mb-3">
            {pageTitle}
          </h1>
          
          {/* Search */}
          <SearchBox 
            placeholder="Поиск заведений..."
            defaultValue={params.search}
          />
        </div>
        
        {/* ✅ Location Filters: Штат → Город */}
        <LocationFilters />
        
        {/* Results count */}
        <div className="px-4 py-3 bg-white border-b">
          <p className="text-sm text-threegis-secondary">
            Найдено {businesses.length} {businesses.length === 1 ? 'место' : 'мест'}
          </p>
        </div>
        
        {/* Business list */}
        <div className="px-4 py-4">
          {businesses.length > 0 ? (
            <BusinessList businesses={businesses} />
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-threegis-text mb-2">
                Ничего не найдено
              </h3>
              <p className="text-threegis-secondary mb-4">
                Попробуйте изменить параметры поиска
              </p>
              <div className="space-y-2 text-sm text-threegis-secondary">
                <p>• Проверьте правильность написания</p>
                <p>• Используйте более общие термины</p>
                <p>• Попробуйте другую категорию</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}