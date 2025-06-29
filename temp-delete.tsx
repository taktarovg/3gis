import ChatsPageClient from './ChatsPageClient';
import { Metadata } from 'next';

export default function ChatsPage() {
  return <ChatsPageClient />;
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
