import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { 
  Users, 
  MapPin, 
  MessageCircle,
  Share2,
  ExternalLink,
  CheckCircle,
  Eye,
  TrendingUp 
} from 'lucide-react';

import { getChatBySlug } from '@/lib/slug-generator';
import { generateShareMetadata } from '@/components/share/ShareMetaTags';
import { ShareButton } from '@/components/share/ShareButton';
import { TelegramRedirect } from '@/components/share/TelegramRedirect';

interface ChatSharePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Функция для записи аналитики просмотра
async function incrementViewCount(chatId: number, referrer?: string) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analytics/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'CHAT',
        entityId: chatId,
        action: 'LINK_CLICKED',
        utmParams: {},
        referrer
      })
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
}

export async function generateMetadata({ params }: ChatSharePageProps): Promise<Metadata> {
  const { slug } = await params;
  const chat = await getChatBySlug(slug);
  
  if (!chat) {
    return {
      title: 'Чат не найден | 3GIS',
      description: 'Этот Telegram чат не найден в справочнике 3GIS'
    };
  }
  
  const title = chat.ogTitle || `${chat.title} | Telegram чат | 3GIS`;
  const description = chat.ogDescription || 
    `${chat.title} - русскоязычное сообщество в Telegram. ${chat.memberCount.toLocaleString()} участников.`;
  const url = `https://3gis.biz/c/${chat.slug}`;
  
  return generateShareMetadata({
    title,
    description,
    image: chat.ogImage,
    url,
    type: 'chat'
  });
}

export default async function ChatSharePage({ 
  params, 
  searchParams 
}: ChatSharePageProps) {
  const { slug } = await params;
  const search = await searchParams;
  
  const chat = await getChatBySlug(slug);
  
  if (!chat) {
    return notFound();
  }
  
  // Записываем аналитику просмотра
  await incrementViewCount(chat.id, search.ref as string);
  
  // Если открыто в Telegram Web App, перенаправляем в TMA
  const userAgent = search.tgWebAppPlatform as string;
  if (userAgent || search.tgWebAppVersion) {
    redirect(`/tg/chats/${chat.id}`);
  }
  
  const shareUrl = `https://3gis.biz/c/${chat.slug}`;
  
  // Форматирование типа чата
  const chatTypeLabel = {
    'GROUP': 'Группа',
    'CHANNEL': 'Канал',
    'CHAT': 'Чат'
  }[chat.type] || 'Сообщество';
  
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
              <ShareButton 
                type="chat"
                entity={chat}
                variant="icon"
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              />
              <TelegramRedirect 
                url={`/tg/chats/${chat.id}`}
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
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 mr-3">
                    {chat.title}
                  </h1>
                  {chat.isVerified && (
                    <CheckCircle className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <span>{chatTypeLabel}</span>
                  {chat.city && (
                    <>
                      <span className="mx-2">•</span>
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{chat.city.name}</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{chat.memberCount.toLocaleString()} участников</span>
                  {chat.topic && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                        {chat.topic}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {chat.description && (
              <p className="text-gray-700 mb-4">{chat.description}</p>
            )}
            
            {/* Действия */}
            <div className="flex flex-wrap gap-3">
              {chat.inviteLink && (
                <a
                  href={chat.inviteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    // Записываем клик по ссылке
                    fetch('/api/analytics/share', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        entityType: 'CHAT',
                        entityId: chat.id,
                        action: 'APP_OPENED'
                      })
                    }).catch(console.error);
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Присоединиться к чату
                </a>
              )}
              
              {chat.username && (
                <a
                  href={`https://t.me/${chat.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  @{chat.username}
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Информация о сообществе */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Статистика */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Статистика сообщества
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="text-gray-700">Участники</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {chat.memberCount.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Просмотры</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {chat.viewCount.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-purple-500 mr-3" />
                  <span className="text-gray-700">Присоединения</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {chat.joinCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          {/* О сообществе */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              О сообществе
            </h2>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Тип:</span>
                <div className="mt-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
                    {chatTypeLabel}
                  </span>
                </div>
              </div>
              
              {chat.city && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Город:</span>
                  <div className="mt-1 flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-gray-900">{chat.city.name}</span>
                  </div>
                </div>
              )}
              
              {chat.topic && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Тематика:</span>
                  <div className="mt-1">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md">
                      {chat.topic}
                    </span>
                  </div>
                </div>
              )}
              
              <div>
                <span className="text-sm font-medium text-gray-700">Статус:</span>
                <div className="mt-1 flex items-center">
                  {chat.isActive ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-green-600 text-sm">Активное</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      <span className="text-gray-600 text-sm">Неактивное</span>
                    </>
                  )}
                  {chat.isVerified && (
                    <CheckCircle className="w-4 h-4 text-blue-500 ml-2" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Найдите больше русскоязычных сообществ
          </h3>
          <p className="text-blue-700 mb-4">
            Откройте 3GIS в Telegram чтобы найти сообщества по интересам в вашем городе
          </p>
          <TelegramRedirect 
            url={`/tg/chats`}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Все сообщества в Telegram
          </TelegramRedirect>
        </div>
        
        {/* Связанные чаты */}
        {chat.city && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Другие сообщества в {chat.city.name}
            </h3>
            <p className="text-gray-600 text-center py-8">
              Загрузка связанных сообществ...
            </p>
          </div>
        )}
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
                <div className="text-sm text-gray-600">Русскоязычные сообщества в США</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 text-center md:text-right">
              <p>Найдите больше сообществ в нашем</p>
              <TelegramRedirect 
                url="/tg/chats"
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