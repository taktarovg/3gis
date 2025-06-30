import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';
import Image from 'next/image';
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Star,
  Share2,
  MessageCircle,
  Navigation 
} from 'lucide-react';

import { getBusinessBySlug } from '@/lib/slug-generator';
import { generateShareMetadata } from '@/components/share/ShareMetaTags';
import { ShareButton } from '@/components/share/ShareButton';
import { TelegramRedirect } from '@/components/share/TelegramRedirect';
import { MapButton } from '@/components/share/MapButton';

interface BusinessSharePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Функция для записи аналитики просмотра
async function incrementViewCount(businessId: number, referrer?: string) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analytics/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'BUSINESS',
        entityId: businessId,
        action: 'LINK_CLICKED',
        utmParams: {},
        referrer
      })
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

export async function generateMetadata({ params }: BusinessSharePageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  
  if (!business) {
    return {
      title: 'Заведение не найдено | 3GIS',
      description: 'Это заведение не найдено в справочнике 3GIS'
    };
  }
  
  const title = business.ogTitle || `${business.name} | ${business.category.name} | 3GIS`;
  const description = business.ogDescription || 
    `${business.name} - ${business.category.name} в ${business.city.name}. Найдите контакты, отзывы и часы работы в справочнике 3GIS.`;
  const image = business.ogImage || business.photos[0]?.url;
  const url = `https://3gis.biz/b/${business.slug}`;
  
  return generateShareMetadata({
    title,
    description,
    image,
    url,
    type: 'business'
  });
}

export default async function BusinessSharePage({ 
  params, 
  searchParams 
}: BusinessSharePageProps) {
  const { slug } = await params;
  const search = await searchParams;
  
  const business = await getBusinessBySlug(slug);
  
  if (!business) {
    return notFound();
  }
  
  // Записываем аналитику просмотра
  await incrementViewCount(business.id, search.ref as string);
  
  // Если открыто в Telegram Web App, перенаправляем в TMA
  const userAgent = search.tgWebAppPlatform as string;
  if (userAgent || search.tgWebAppVersion) {
    redirect(`/tg/businesses/${business.id}`);
  }
  
  const shareUrl = `https://3gis.biz/b/${business.slug}`;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header с брендингом */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">3G</span>
              </div>
              <span className="font-semibold text-gray-900">3GIS</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Suspense fallback={
                <div className="p-2 text-gray-600 rounded-lg w-10 h-10 bg-gray-100 animate-pulse" />
              }>
                <ShareButton 
                  type="business"
                  entity={{
                    id: business.id,
                    name: business.name,
                    slug: business.slug || undefined,
                    description: business.description || undefined
                  }}
                  variant="icon"
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                />
              </Suspense>
              <TelegramRedirect 
                url={`/tg/businesses/${business.id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Открыть в Telegram
              </TelegramRedirect>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Hero секция */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {business.photos.length > 0 && (
            <div className="aspect-video w-full bg-gray-200 relative">
              <Image
                src={business.photos[0].url}
                alt={business.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
              {business.premiumTier !== 'FREE' && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-yellow-900 px-2 py-1 rounded-md text-xs font-medium">
                  ⭐ Премиум
                </div>
              )}
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {business.name}
                </h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <span className="text-lg mr-2">{business.category.icon}</span>
                  <span>{business.category.name}</span>
                </div>
                {business.rating > 0 && (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="ml-1 text-sm font-medium">
                      {business.rating.toFixed(1)}
                    </span>
                    <span className="ml-1 text-sm text-gray-500">
                      ({business.reviewCount} отзывов)
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {business.description && (
              <p className="text-gray-700 mb-4">{business.description}</p>
            )}
            
            {/* Действия */}
            <div className="flex flex-wrap gap-3">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Позвонить
                </a>
              )}
              
              <MapButton
                address={business.address}
                cityName={business.city.name}
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              />
              
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Сайт
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Информация о заведении */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Контакты и адрес */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Контакты и адрес
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-gray-900">{business.address}</p>
                  <p className="text-gray-600 text-sm">
                    {business.city.name}, {business.stateId}
                    {business.zipCode && ` ${business.zipCode}`}
                  </p>
                </div>
              </div>
              
              {business.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <a 
                    href={`tel:${business.phone}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {business.phone}
                  </a>
                </div>
              )}
              
              {business.website && (
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-3" />
                  <a 
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 truncate"
                  >
                    {business.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* Дополнительная информация */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Дополнительно
            </h2>
            
            <div className="space-y-3">
              {business.languages.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Языки:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {business.languages.map((lang) => (
                      <span 
                        key={lang}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                      >
                        {lang === 'ru' ? '🇷🇺 Русский' : lang === 'en' ? '🇺🇸 English' : lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Особенности */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {business.hasParking && (
                  <div className="flex items-center text-green-600">
                    <span className="mr-2">✅</span>
                    Парковка
                  </div>
                )}
                {business.hasWiFi && (
                  <div className="flex items-center text-green-600">
                    <span className="mr-2">✅</span>
                    Wi-Fi
                  </div>
                )}
                {business.acceptsCrypto && (
                  <div className="flex items-center text-green-600">
                    <span className="mr-2">✅</span>
                    Криптовалюты
                  </div>
                )}
                {business.hasDelivery && (
                  <div className="flex items-center text-green-600">
                    <span className="mr-2">✅</span>
                    Доставка
                  </div>
                )}
                {business.isAccessible && (
                  <div className="flex items-center text-green-600">
                    <span className="mr-2">✅</span>
                    Доступная среда
                  </div>
                )}
                {business.acceptsCards && (
                  <div className="flex items-center text-green-600">
                    <span className="mr-2">✅</span>
                    Карты
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Откройте 3GIS в Telegram для полного функционала
          </h3>
          <p className="text-blue-700 mb-4">
            Добавляйте в избранное, оставляйте отзывы и находите еще больше русскоязычных заведений
          </p>
          <TelegramRedirect 
            url={`/tg/businesses/${business.id}`}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Открыть в Telegram
          </TelegramRedirect>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">3G</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">3GIS</div>
                <div className="text-sm text-gray-600">Русскоязычный справочник в США</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 text-center md:text-right">
              <p>Найдите больше заведений в нашем</p>
              <TelegramRedirect 
                url="/tg"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Telegram приложении
              </TelegramRedirect>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}