// src/app/page.tsx - лендинг страница 3GIS
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { CategoriesSection } from '@/components/landing/CategoriesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { Footer } from '@/components/layout/Footer';

export const metadata = {
  title: '3GIS - Русскоязычный справочник организаций в США',
  description: 'Находите рестораны, врачей, юристов, салоны красоты и другие услуги на русском языке по всей Америке. Более 5.5 миллионов русскоговорящих доверяют 3GIS.',
  keywords: 'русский справочник США, русскоговорящие услуги Америка, рестораны русские, врачи русские, юристы иммиграционные',
  openGraph: {
    title: '3GIS - Твой проводник в Америке',
    description: 'Справочник русскоязычных организаций в США. Рестораны, врачи, юристы и другие услуги.',
    url: 'https://3gis.vercel.app',
    siteName: '3GIS',
    images: [
      {
        url: 'https://3gis.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: '3GIS - Русскоязычный справочник США',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '3GIS - Русскоязычный справочник США',
    description: 'Находите русскоговорящие услуги по всей Америке',
    images: ['https://3gis.vercel.app/og-image.png'],
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero секция с главным CTA и встроенным Header */}
      <HeroSection />
      
      {/* Статистика сообщества */}
      <StatsSection />
      
      {/* Основные возможности */}
      <FeaturesSection />
      
      {/* Категории услуг */}
      <CategoriesSection />
      
      {/* Отзывы пользователей */}
      <TestimonialsSection />
      
      {/* Footer с контактами */}
      <Footer />
    </main>
  );
}