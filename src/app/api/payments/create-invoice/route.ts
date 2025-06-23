import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { PREMIUM_PLANS } from '@/lib/telegram-stars/plans';

const CreateInvoiceSchema = z.object({
  businessId: z.number(),
  plan: z.enum(['basic', 'standard', 'premium']),
  telegramUserId: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, plan, telegramUserId } = CreateInvoiceSchema.parse(body);
    
    // Получаем план
    const planConfig = PREMIUM_PLANS[plan];
    
    // Проверяем права пользователя на заведение
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        owner: {
          telegramId: telegramUserId
        }
      },
      include: {
        owner: true
      }
    });
    
    if (!business) {
      return NextResponse.json(
        { error: 'Заведение не найдено или у вас нет доступа' },
        { status: 404 }
      );
    }
    
    // Создаем запись подписки
    const subscription = await prisma.businessSubscription.create({
      data: {
        businessId,
        tier: plan.toUpperCase() as 'BASIC' | 'STANDARD' | 'PREMIUM',
        endDate: new Date(Date.now() + planConfig.duration * 24 * 60 * 60 * 1000),
        starsAmount: planConfig.starsAmount,
        dollarPrice: planConfig.dollarPrice * 100, // в центах
        status: 'PENDING'
      }
    });
    
    // Создаем ссылку на оплату через Telegram Bot API
    const invoiceLink = await createTelegramInvoiceLink({
      businessId,
      subscriptionId: subscription.id,
      plan: planConfig,
      telegramUserId
    });
    
    // Обновляем подписку с invoiceId
    await prisma.businessSubscription.update({
      where: { id: subscription.id },
      data: { invoiceId: invoiceLink }
    });
    
    return NextResponse.json({
      success: true,
      invoiceLink,
      subscriptionId: subscription.id,
      planDetails: {
        name: planConfig.name,
        starsAmount: planConfig.starsAmount,
        features: planConfig.features
      }
    });
    
  } catch (error) {
    console.error('Create invoice error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные параметры запроса', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Ошибка создания счета' },
      { status: 500 }
    );
  }
}

async function createTelegramInvoiceLink(params: {
  businessId: number;
  subscriptionId: number;
  plan: typeof PREMIUM_PLANS[keyof typeof PREMIUM_PLANS];
  telegramUserId: string;
}): Promise<string> {
  const { businessId, subscriptionId, plan, telegramUserId } = params;
  
  // Формируем payload для счета
  const payload = JSON.stringify({
    type: 'subscription',
    businessId,
    subscriptionId,
    telegramUserId,
    timestamp: Date.now()
  });
  
  // Создаем счет через Telegram Bot API
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN не настроен');
  }
  
  const invoiceData = {
    title: `3GIS ${plan.name} подписка`,
    description: `Премиум размещение заведения на ${plan.duration} дней`,
    payload: payload,
    currency: 'XTR', // Telegram Stars
    prices: [
      {
        label: `${plan.name} план`,
        amount: plan.starsAmount
      }
    ]
  };
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData)
    });
    
    const result = await response.json();
    
    if (!result.ok) {
      throw new Error(`Telegram API error: ${result.description}`);
    }
    
    return result.result;
  } catch (error) {
    console.error('Telegram API error:', error);
    throw new Error('Не удалось создать счет для оплаты');
  }
}
