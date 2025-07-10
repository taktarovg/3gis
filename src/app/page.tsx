// src/app/page.tsx - лендинг страница 3GIS
'use client';

import dynamic from 'next/dynamic';

// ✅ ИСПРАВЛЕНИЕ Next.js 15: Все компоненты загружаются динамически
const HeroSectionDynamic = dynamic(
  () => import('@/components/landing/HeroSection').then(mod => ({ default: mod.HeroSection })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }
);

const FeaturesSectionDynamic = dynamic(
  () => import('@/components/landing/FeaturesSection').then(mod => ({ default: mod.FeaturesSection })),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-50 animate-pulse"></div>
  }
);

const StatsSectionDynamic = dynamic(
  () => import('@/components/landing/StatsSection').then(mod => ({ default: mod.StatsSection })),
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-white animate-pulse"></div>
  }
);

const CategoriesSectionDynamic = dynamic(
  () => import('@/components/landing/CategoriesSection').then(mod => ({ default: mod.CategoriesSection })),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-50 animate-pulse"></div>
  }
);

const TestimonialsSectionDynamic = dynamic(
  () => import('@/components/landing/TestimonialsSection').then(mod => ({ default: mod.TestimonialsSection })),
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-white animate-pulse"></div>
  }
);

const FooterDynamic = dynamic(
  () => import('@/components/layout/Footer').then(mod => ({ default: mod.Footer })),
  { 
    ssr: false,
    loading: () => <div className="h-32 bg-gray-900 animate-pulse"></div>
  }
);

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero секция с главным CTA и встроенным Header */}
      <HeroSectionDynamic />
      
      {/* Статистика сообщества */}
      <StatsSectionDynamic />
      
      {/* Основные возможности */}
      <FeaturesSectionDynamic />
      
      {/* Категории услуг */}
      <CategoriesSectionDynamic />
      
      {/* Отзывы пользователей */}
      <TestimonialsSectionDynamic />
      
      {/* Footer с контактами */}
      <FooterDynamic />
    </main>
  );
}
