// src/app/tg/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { useTelegram } from '@/components/providers/TelegramProvider';
import dynamic from 'next/dynamic';

// ✅ Динамические импорты компонентов
const DonationWidget = dynamic(
  () => import('@/components/donations/DonationWidget').then(mod => ({ default: mod.DonationWidget })),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-gray-100 rounded-xl p-4 animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    )
  }
);

const SearchBox = dynamic(
  () => import('@/components/search/SearchBox').then(mod => ({ default: mod.SearchBox })), 
  { ssr: false }
);

const NearbyButton = dynamic(
  () => import('@/components/location/NearbyButton').then(mod => ({ default: mod.NearbyButton })), 
  { ssr: false }
);

const CategoryGrid = dynamic(
  () => import('@/components/categories/CategoryGrid').then(mod => ({ default: mod.CategoryGrid })), 
  { ssr: false }
);

const TelegramDebugStatus = dynamic(
  () => import('@/components/providers/TelegramProvider').then(mod => ({ default: mod.TelegramDebugStatus })), 
  { ssr: false }
);

// ✅ Типизация для категорий
interface Category {
  id: number;
  name: string;
  nameEn: string;
  slug: string;
  icon: string;
  order: number;
}

// ✅ Хук для получения категорий на клиенте
function useCategories() {
  const [categories, setCategories] = React.useState<Category[]>([]); 
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data: Category[] = await response.json();
          setCategories(data);
        } else {
          setCategories(getFallbackCategories());
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(getFallbackCategories());
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
}

function getFallbackCategories(): Category[] {
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

export default function ThreeGISHomePage() {
  const router = useRouter();
  const { categories, loading } = useCategories();
  
  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Безопасное использование Telegram Provider
  const { launchParams, isReady, isTelegramEnvironment } = useTelegram();
  
  // ✅ ИСПРАВЛЕНО: Обработка start параметров без бесконечных редиректов
  useEffect(() => {
    // ✅ Только если мы в настоящем Telegram окружении и данные готовы
    if (!isReady || !isTelegramEnvironment || !launchParams) {
      console.log('🔄 Waiting for Telegram data or not in Telegram environment');
      return;
    }
    
    // ✅ ИСПРАВЛЕНО: SDK v3.x правильное получение start параметра
    let startParam: string | undefined;
    
    // Проверяем различные места где может быть startParam в SDK v3.x
    if (launchParams.tgWebAppStartParam) {
      startParam = launchParams.tgWebAppStartParam;
    } else if (launchParams.startParam) {
      startParam = launchParams.startParam;
    } else if (launchParams.tgWebAppData?.start_param) {
      startParam = launchParams.tgWebAppData.start_param;
    }
    
    if (startParam && typeof startParam === 'string') {
      console.log('🚀 Processing start param:', startParam);
      
      // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Добавляем флаг для предотвращения повторных редиректов
      const hasRedirected = sessionStorage.getItem('3gis_has_redirected');
      if (hasRedirected) {
        console.log('⏭️ Already redirected, skipping...');
        return;
      }
      
      try {
        // Отдельные заведения: business_123
        if (startParam.startsWith('business_')) {
          const businessId = startParam.replace('business_', '');
          if (businessId && /^\d+$/.test(businessId)) {
            console.log('🏢 Redirecting to business:', businessId);
            sessionStorage.setItem('3gis_has_redirected', 'true');
            router.push(`/tg/business/${businessId}`);
            return;
          }
        }
        
        // Отдельные чаты: chat_123
        if (startParam.startsWith('chat_')) {
          const chatId = startParam.replace('chat_', '');
          if (chatId && /^\d+$/.test(chatId)) {
            console.log('💬 Redirecting to chat:', chatId);
            sessionStorage.setItem('3gis_has_redirected', 'true');
            router.push(`/tg/chats/${chatId}`);
            return;
          }
        }
        
        // Список заведений с категорией: businesses_restaurants
        if (startParam.startsWith('businesses_')) {
          const category = startParam.replace('businesses_', '');
          if (category && category !== 'businesses') {
            console.log('🏪 Redirecting to businesses with category:', category);
            sessionStorage.setItem('3gis_has_redirected', 'true');
            router.push(`/tg/businesses?category=${category}`);
            return;
          }
        }
        
        // Другие параметры...
        if (startParam === 'businesses') {
          console.log('🏪 Redirecting to all businesses');
          sessionStorage.setItem('3gis_has_redirected', 'true');
          router.push('/tg/businesses');
          return;
        }
        
        if (startParam === 'chats') {
          console.log('💬 Redirecting to chats');
          sessionStorage.setItem('3gis_has_redirected', 'true');
          router.push('/tg/chats');
          return;
        }
        
        if (startParam === 'favorites') {
          console.log('⭐ Redirecting to favorites');
          sessionStorage.setItem('3gis_has_redirected', 'true');
          router.push('/tg/favorites');
          return;
        }
        
        if (startParam === 'profile') {
          console.log('👤 Redirecting to profile');
          sessionStorage.setItem('3gis_has_redirected', 'true');
          router.push('/tg/profile');
          return;
        }
        
        if (startParam === 'add_business') {
          console.log('➕ Redirecting to add business');
          sessionStorage.setItem('3gis_has_redirected', 'true');
          router.push('/tg/add-business');
          return;
        }
        
        console.log('❓ Unknown start param:', startParam);
        
      } catch (error) {
        console.error('Error processing start param:', error);
      }
    } else {
      console.log('ℹ️ No start parameter found');
    }
  }, [launchParams, isReady, isTelegramEnvironment, router]);
  
  // ✅ Сброс флага редиректа при размонтировании компонента
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('3gis_has_redirected');
    };
  }, []);
  
  // ✅ Показываем лоадер пока загружаются данные
  if (loading || !isReady) {
    return (
      <div className="threegis-app-container" data-scrollable>
        <div className="threegis-app-main">
          <div className="px-4 mb-6 mt-6">
            <div className="bg-gray-200 animate-pulse rounded-lg h-12"></div>
          </div>
          <div className="px-4 mb-6">
            <div className="bg-gray-200 animate-pulse rounded-lg h-12"></div>
          </div>
          <div className="px-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-20"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
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
      <TelegramDebugStatus />
    </div>
  );
}
