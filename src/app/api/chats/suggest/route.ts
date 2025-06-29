import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Схема валидации для предложения чата
const SuggestChatSchema = z.object({
  inviteLink: z.string().url('Введите корректную ссылку')
    .refine(url => url.startsWith('https://t.me/'), {
      message: 'Ссылка должна начинаться с https://t.me/'
    }),
  comment: z.string().min(1, 'Комментарий обязателен').max(500, 'Комментарий не должен превышать 500 символов'),
  telegramUserId: z.string().min(1, 'Пользователь не определен')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inviteLink, comment, telegramUserId } = SuggestChatSchema.parse(body);

    // Проверяем, существует ли пользователь в нашей БД
    let user = await prisma.user.findFirst({
      where: { telegramId: telegramUserId }
    });

    // Если пользователя нет, создаем его
    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: telegramUserId,
          firstName: 'Telegram User',
          role: 'USER'
        }
      });
    }

    // Проверяем, не предложен ли уже этот чат
    const existingChat = await prisma.telegramChat.findFirst({
      where: {
        OR: [
          { inviteLink: inviteLink },
          { username: extractUsernameFromLink(inviteLink) }
        ]
      }
    });

    if (existingChat) {
      return NextResponse.json(
        { error: 'Этот чат уже есть в каталоге или на модерации' },
        { status: 400 }
      );
    }

    // Создаем новое предложение чата
    const suggestedChat = await prisma.telegramChat.create({
      data: {
        title: 'Предложенный чат', // Будет обновлено при модерации
        inviteLink: inviteLink,
        username: extractUsernameFromLink(inviteLink),
        description: comment,
        type: 'GROUP',
        status: 'PENDING',
        isActive: false,
        submittedById: user.id,
        submissionNote: comment,
        topic: 'Общение' // По умолчанию
      }
    });

    // Отправляем уведомление админу (@taktarovgv)
    await notifyAdmin(inviteLink, comment, telegramUserId);

    return NextResponse.json({
      success: true,
      message: 'Ваш чат отправлен на модерацию. Спасибо за участие!',
      chatId: suggestedChat.id
    });

  } catch (error) {
    console.error('Error suggesting chat:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Произошла ошибка при отправке предложения' },
      { status: 500 }
    );
  }
}

// Функция для извлечения username из ссылки
function extractUsernameFromLink(link: string): string | null {
  try {
    const url = new URL(link);
    const pathname = url.pathname;
    
    // Извлекаем username из пути /joinchat/... или /+... или просто /username
    if (pathname.startsWith('/joinchat/') || pathname.startsWith('/+')) {
      return null; // Приватные ссылки-приглашения не имеют username
    }
    
    const username = pathname.replace('/', '');
    return username || null;
  } catch {
    return null;
  }
}

// Функция отправки уведомления админу
async function notifyAdmin(chatLink: string, comment: string, userId: string) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn('TELEGRAM_BOT_TOKEN not found, admin notification skipped');
      return;
    }

    // Находим админа @taktarovgv в БД
    const admin = await prisma.user.findFirst({
      where: { username: 'taktarovgv' }
    });

    if (!admin?.telegramId) {
      console.warn('Admin @taktarovgv not found in database');
      return;
    }

    const message = `🔔 *Новое предложение чата в 3GIS*

📎 *Ссылка:* ${chatLink}
💬 *Комментарий:* ${comment}
👤 *От пользователя:* ${userId}

🛠️ Для модерации перейдите в админ-панель 3GIS`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: admin.telegramId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });

    console.log(`Admin notification sent to @taktarovgv (${admin.telegramId})`);
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    // Не прерываем выполнение основной функции при ошибке уведомления
  }
}
