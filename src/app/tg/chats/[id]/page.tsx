import { notFound } from 'next/navigation';
import { ChatDetail } from '@/components/chats/ChatDetail';
import { prisma } from '@/lib/prisma';

// ✅ Next.js 15: params теперь является Promise
interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getChat(id: string) {
  try {
    const chatId = parseInt(id);
    
    if (isNaN(chatId)) {
      return null;
    }

    const chat = await prisma.telegramChat.findUnique({
      where: {
        id: chatId,
        status: 'ACTIVE',
        isActive: true,
      },
      include: {
        city: {
          select: { name: true }
        },
        state: {
          select: { name: true, id: true }
        },
        _count: {
          select: { favorites: true }
        }
      },
    });

    return chat;
  } catch (error) {
    console.error('Error fetching chat:', error);
    return null;
  }
}

// ✅ Next.js 15: await params перед использованием
export default async function ChatDetailPage({ params }: ChatPageProps) {
  const { id } = await params;
  const chat = await getChat(id);

  if (!chat) {
    notFound();
  }

  return <ChatDetail chat={{
    ...chat,
    description: chat.description ?? undefined,
    username: chat.username ?? undefined,
    topic: chat.topic ?? undefined,
    city: chat.city ?? undefined,
    state: chat.state ?? undefined
  }} />;
}

// ✅ Next.js 15: await params в generateMetadata
export async function generateMetadata({ params }: ChatPageProps) {
  const { id } = await params;
  const chat = await getChat(id);
  
  if (!chat) {
    return {
      title: 'Чат не найден | 3GIS'
    };
  }

  const locationText = chat.city?.name 
    ? `в ${chat.city.name}${chat.state?.name ? `, ${chat.state.name}` : ''}`
    : chat.state?.name 
    ? `в штате ${chat.state.name}`
    : 'в США';

  return {
    title: `${chat.title} | 3GIS`,
    description: chat.description || `${chat.title} - русскоязычное сообщество ${locationText}. ${chat.memberCount} участников.`,
    keywords: `${chat.title}, ${chat.topic || 'русский чат'}, telegram, ${chat.city?.name || ''}, ${chat.state?.name || ''}`,
    openGraph: {
      title: chat.title,
      description: chat.description || `Русскоязычное сообщество ${locationText}`,
      type: 'website',
    },
  };
}

// Генерация статических страниц для популярных чатов
export async function generateStaticParams() {
  try {
    const popularChats = await prisma.telegramChat.findMany({
      where: {
        status: 'ACTIVE',
        isActive: true,
        memberCount: {
          gte: 1000, // Только чаты с 1000+ участников
        },
      },
      select: {
        id: true,
      },
      orderBy: {
        memberCount: 'desc',
      },
      take: 50, // Первые 50 популярных чатов
    });

    return popularChats.map((chat) => ({
      id: chat.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}
