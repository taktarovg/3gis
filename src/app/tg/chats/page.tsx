import { ChatsList } from '@/components/chats/ChatsList';
import { InfiniteLoopTester } from '@/components/debug/InfiniteLoopTester';
import { Metadata } from 'next';

export default function ChatsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">
          💬 Русские чаты в США
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Найдите свое сообщество среди русскоговорящих
        </p>
      </div>
      
      <div className="p-4">
        <ChatsList />
      </div>
      
      {/* ✅ Тестер бесконечного цикла (только в dev режиме) */}
      {process.env.NODE_ENV === 'development' && <InfiniteLoopTester />}
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Русские чаты в США | 3GIS',
  description: 'Каталог русскоязычных Telegram-групп, чатов и каналов по городам США. Найдите свое сообщество для общения, работы, недвижимости и развлечений.',
  keywords: 'русские чаты, telegram группы, русскоговорящие США, сообщества',
  openGraph: {
    title: 'Русские чаты в США | 3GIS',
    description: 'Каталог русскоязычных Telegram-групп по городам США',
    type: 'website',
  },
};
