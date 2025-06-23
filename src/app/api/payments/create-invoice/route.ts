import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PREMIUM_PLANS, getPlanConfig, validateStarsAmount } from '@/lib/telegram-stars/plans';
import { z } from 'zod';

const CreateInvoiceSchema = z.object({
  businessId: z.number(),
  plan: z.enum(['basic', 'standard', 'premium']),
  telegramUserId: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, plan, telegramUserId } = CreateInvoiceSchema.parse(body);
    
    // Проверяем права пользователя на заведение
    const user = await prisma.user.findUnique({
      where: { telegramId: telegramUserId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: user.id
      }
    });
    
    if (!business) {
      return NextResponse.json(
        { error: 'Заведение не найдено или у вас нет доступа' },
        { status: 404 }
      );
    }

    const planConfig = getPlanConfig(plan);
    
    // Создаем запись подписки
    const subscription = await prisma.businessSubscription.create({
      data: {
        businessId,
        tier: plan.toUpperCase() as any,
        endDate: new Date(Date.now() + planConfig.duration * 24 * 60 * 60 * 1000),
        starsAmount: planConfig.starsAmount,
        dollarPrice: planConfig.dollarPrice * 100, // в центах
        status: 'PENDING'
      }
    });

    // Создаем счет через Telegram Bot API
    const { createTelegramInvoice } = await import('@/lib/telegram-bot');
    
    const invoiceLink = await createTelegramInvoice({
      businessId,
      plan,
      starsAmount: planConfig.starsAmount,
      title: `3GIS ${planConfig.name} подписка`,
      description: `Премиум размещение заведения на ${planConfig.duration} дней`,
      userId: telegramUserId
    });
    
    // Обновляем подписку с ID счета
    await prisma.businessSubscription.update({
      where: { id: subscription.id },
      data: {
        invoiceId: invoiceLink
      }
    });
    
    return NextResponse.json({
      success: true,
      invoiceLink,
      subscriptionId: subscription.id,
      starsAmount: planConfig.starsAmount,
      plan: {
        name: planConfig.name,
        features: planConfig.features,
        duration: planConfig.duration
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
