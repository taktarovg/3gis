// src/app/tg/businesses/page.tsx
import React from 'react';
import { BusinessList } from '@/components/businesses/BusinessList';
import { SearchBox } from '@/components/search/SearchBox';
import { FilterChips } from '@/components/filters/FilterChips';
import { prisma } from '@/lib/prisma';

interface BusinessesPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    filter?: string;
    city?: string;
  }>;
}

async function getBusinesses(params: {
  category?: string;
  search?: string;
  filter?: string;
  city?: string;
}) {
  try {
    const where: any = {
      status: 'ACTIVE'
    };

    // Filter by category
    if (params.category) {
      where.category = {
        slug: params.category
      };
    }

    // Search filter
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { nameEn: { contains: params.search, mode: 'insensitive' } }
      ];
    }

    // Russian language filter
    if (params.filter === 'russian') {
      where.languages = {
        has: 'ru'
      };
    }

    // City filter (default to New York for now)
    const cityName = params.city || 'New York';
    where.city = {
      name: cityName
    };

    const businesses = await prisma.business.findMany({
      where,
      include: {
        category: true,
        city: true,
        photos: {
          take: 1,
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            reviews: true,
            favorites: true
          }
        }
      },
      orderBy: [
        { premiumTier: 'desc' }, // Premium first
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 50 // Limit to 50 results for now
    });

    return businesses;
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
  if (categoryName) {
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
        
        {/* Filters */}
        <div className="bg-gray-50 py-2">
          <FilterChips />
        </div>
        
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