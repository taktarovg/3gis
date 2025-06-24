# 🗄️ База данных и API для каталога Telegram-чатов

## 1. Обновления Prisma Schema

### Добавить в `prisma/schema.prisma`:

```prisma
model TelegramChat {
  id            Int            @id @default(autoincrement())
  title         String         // "NYC Russian Community"
  description   String?        // Описание группы
  username      String?        // nyc_russian (без @)
  inviteLink    String?        // https://t.me/+xxxxx или https://t.me/username
  
  // Тип чата
  type          ChatType       @default(GROUP)
  
  // Локация
  city          City?          @relation(fields: [cityId], references: [id])
  cityId        Int?
  state         State?         @relation(fields: [stateId], references: [id])
  stateId       String?
  
  // Простая тематика
  topic         String?        // "Общение", "Работа", "Недвижимость"
  
  // Метаданные
  memberCount   Int            @default(0)
  isVerified    Boolean        @default(false)
  isActive      Boolean        @default(true)
  
  // Статистика
  viewCount     Int            @default(0)
  joinCount     Int            @default(0)
  
  // Модерация
  status        ChatStatus     @default(PENDING)
  moderatedBy   User?          @relation(fields: [moderatedById], references: [id])
  moderatedById Int?
  moderationNote String?       // Заметки модератора
  
  // Связи
  favorites     ChatFavorite[]
  
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  @@map("telegram_chats")
}

model ChatFavorite {
  id        Int            @id @default(autoincrement())
  chat      TelegramChat   @relation(fields: [chatId], references: [id])
  chatId    Int
  user      User           @relation(fields: [userId], references: [id])
  userId    Int
  createdAt DateTime       @default(now())
  
  @@unique([chatId, userId])
  @@map("chat_favorites")
}

enum ChatType {
  GROUP     // Группы
  CHAT      // Чаты
  CHANNEL   // Каналы
}

enum ChatStatus {
  PENDING   // На модерации
  ACTIVE    // Одобрен
  REJECTED  // Отклонен
}

// Обновить существующие модели
model User {
  // ... существующие поля
  chatFavorites ChatFavorite[]
  moderatedChats TelegramChat[] @relation("ChatModerator")
}

model City {
  // ... существующие поля
  telegramChats TelegramChat[]
}

model State {
  // ... существующие поля
  telegramChats TelegramChat[]
}
```

## 2. Миграция базы данных

### Создать файл миграции:

```sql
-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('GROUP', 'CHAT', 'CHANNEL');
CREATE TYPE "ChatStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED');

-- CreateTable
CREATE TABLE "telegram_chats" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "username" TEXT,
    "inviteLink" TEXT,
    "type" "ChatType" NOT NULL DEFAULT 'GROUP',
    "cityId" INTEGER,
    "stateId" TEXT,
    "topic" TEXT,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "joinCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ChatStatus" NOT NULL DEFAULT 'PENDING',
    "moderatedById" INTEGER,
    "moderationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_favorites" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_favorites_chatId_userId_key" ON "chat_favorites"("chatId", "userId");

-- AddForeignKey
ALTER TABLE "telegram_chats" ADD CONSTRAINT "telegram_chats_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_chats" ADD CONSTRAINT "telegram_chats_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_chats" ADD CONSTRAINT "telegram_chats_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_favorites" ADD CONSTRAINT "chat_favorites_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "telegram_chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_favorites" ADD CONSTRAINT "chat_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

## 3. API Endpoints

### `src/app/api/chats/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ChatsQuerySchema = z.object({
  type: z.enum(['GROUP', 'CHAT', 'CHANNEL']).optional(),
  stateId: z.string().optional(),
  cityId: z.string().optional(),
  search: z.string().optional(),
  page: z.string().default('1'),
  limit: z.string().default('20'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = ChatsQuerySchema.parse({
      type: searchParams.get('type'),
      stateId: searchParams.get('stateId'),
      cityId: searchParams.get('cityId'),
      search: searchParams.get('search'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    const page = parseInt(query.page);
    const limit = parseInt(query.limit);
    const skip = (page - 1) * limit;

    // Построение WHERE условий
    const where: any = {
      status: 'ACTIVE',
      isActive: true,
    };

    if (query.type) {
      where.type = query.type;
    }

    if (query.stateId) {
      where.stateId = query.stateId;
    }

    if (query.cityId) {
      where.cityId = parseInt(query.cityId);
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { topic: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Получение чатов с подсчетом
    const [chats, total, counts] = await Promise.all([
      prisma.telegramChat.findMany({
        where,
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
        orderBy: [
          { memberCount: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      prisma.telegramChat.count({ where }),
      
      // Подсчет по типам для селекторов
      prisma.telegramChat.groupBy({
        by: ['type'],
        where: {
          status: 'ACTIVE',
          isActive: true,
          ...(query.stateId && { stateId: query.stateId }),
          ...(query.cityId && { cityId: parseInt(query.cityId) }),
        },
        _count: true,
      }),
    ]);

    return NextResponse.json({
      chats,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      counts: counts.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<string, number>),
    });

  } catch (error) {
    console.error('Chats API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении чатов' },
      { status: 500 }
    );
  }
}
```

### `src/app/api/chats/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = parseInt(params.id);

    if (isNaN(chatId)) {
      return NextResponse.json(
        { error: 'Некорректный ID чата' },
        { status: 400 }
      );
    }

    // Увеличиваем счетчик просмотров
    const chat = await prisma.telegramChat.update({
      where: {
        id: chatId,
        status: 'ACTIVE',
        isActive: true,
      },
      data: {
        viewCount: { increment: 1 },
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

    return NextResponse.json(chat);

  } catch (error) {
    console.error('Chat detail error:', error);
    return NextResponse.json(
      { error: 'Чат не найден' },
      { status: 404 }
    );
  }
}
```

### `src/app/api/chats/[id]/join/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatId = parseInt(params.id);

    if (isNaN(chatId)) {
      return NextResponse.json(
        { error: 'Некорректный ID чата' },
        { status: 400 }
      );
    }

    // Увеличиваем счетчик переходов
    await prisma.telegramChat.update({
      where: {
        id: chatId,
        status: 'ACTIVE',
        isActive: true,
      },
      data: {
        joinCount: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Chat join tracking error:', error);
    return NextResponse.json(
      { error: 'Ошибка при отслеживании перехода' },
      { status: 500 }
    );
  }
}
```

## 4. Seed данные для тестирования

### `prisma/seed-chats.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testChats = [
  {
    title: 'NYC Russian Community',
    description: 'Главный чат русскоговорящих в Нью-Йорке. Общение, знакомства, взаимопомощь.',
    type: 'GROUP',
    username: 'nyc_russian',
    memberCount: 15234,
    topic: 'Общение',
    isVerified: true,
    status: 'ACTIVE',
    stateId: 'NY',
    cityId: 1, // NYC
  },
  {
    title: 'LA Russian Housing',
    description: 'Аренда и покупка недвижимости для русскоговорящих в Лос-Анджелесе.',
    type: 'GROUP',
    username: 'la_russian_housing',
    memberCount: 8756,
    topic: 'Недвижимость',
    isVerified: true,
    status: 'ACTIVE',
    stateId: 'CA',
    cityId: 2, // LA
  },
  {
    title: 'Chicago Russian Jobs',
    description: 'Вакансии и поиск работы для русскоговорящих в Чикаго.',
    type: 'CHAT',
    memberCount: 3421,
    topic: 'Работа',
    status: 'ACTIVE',
    stateId: 'IL',
    cityId: 3, // Chicago
  },
  {
    title: 'Miami Russian News',
    description: 'Новости и события русскоязычного сообщества Майами.',
    type: 'CHANNEL',
    memberCount: 5632,
    topic: 'Новости',
    isVerified: true,
    status: 'ACTIVE',
    stateId: 'FL',
    cityId: 4, // Miami
  },
  // Добавить еще 10-15 тестовых чатов
];

async function seedChats() {
  console.log('Seeding telegram chats...');
  
  for (const chat of testChats) {
    await prisma.telegramChat.upsert({
      where: { title: chat.title },
      update: {},
      create: chat,
    });
  }
  
  console.log('Telegram chats seeded successfully!');
}

export { seedChats };
```

## 5. Команды для выполнения

```bash
# 1. Обновить схему базы данных
npx prisma db push

# 2. Сгенерировать Prisma client
npx prisma generate

# 3. Запустить seed (если создали)
npx tsx prisma/seed-chats.ts
```

Эта часть содержит всю backend инфраструктуру для каталога чатов. Следующий артефакт будет с UI компонентами.
