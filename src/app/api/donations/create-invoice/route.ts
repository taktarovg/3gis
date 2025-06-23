import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { DONATION_OPTIONS, DonationType } from '@/lib/telegram-stars/plans';

const CreateDonationSchema = z.object({
  type: z.enum(['coffee', 'lunch', 'support', 'custom']),
  starsAmount: z.number().optional(),
  message: z.string().optional(),
  telegramUserId: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, starsAmount, message, telegramUserId } = CreateDonationSchema.parse(body);
    
    // Определяем сумму stars
    let finalStarsAmount: number;
    
    if (type === 'custom') {
      if (!starsAmount || starsAmount <= 0) {
        return NextResponse.json(
          { error: 'Для кастомного доната необходимо указать сумму Stars' },
          { status: 400 }
        );
      }
      finalStarsAmount = starsAmount;
    } else {
      const donationConfig = DONATION_OPTIONS[type];
      if (!donationConfig.starsAmount) {
        return NextResponse.json(
          { error: 'Неверный тип доната' },
          { status: 400 }
        );
      }
      finalStarsAmount = donationConfig.starsAmount;
    }
    
    // Создаем запись доната
    const donation = await prisma.donation.create({
      data: {
        type,
        starsAmount: finalStarsAmount,
        message: message || `Донат: ${DONATION_OPTIONS[type as DonationType].name}`,
        telegramUserId,
        status: 'PENDING'
      }
    });
    
    // Создаем ссылку на оплату через Telegram Bot API
    const invoiceLink = await createDonationInvoiceLink({
      donationId: donation.id,
      type,
      starsAmount: finalStarsAmount,
      message: donation.message || '',
      telegramUserId
    });
    
    // Обновляем донат с invoiceId
    await prisma.donation.update({
      where: { id: donation.id },
      data: { telegramInvoiceId: invoiceLink }
    });
    
    return NextResponse.json({
      success: true,
      invoiceLink,
      donationId: donation.id,
      donationDetails: {
        type,
        name: DONATION_OPTIONS[type as DonationType].name,
        starsAmount: finalStarsAmount,
        message: donation.message
      }
    });
    
  } catch (error) {
    console.error('Create donation invoice error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные параметры запроса', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Ошибка создания доната' },
      { status: 500 }
    );
  }
}

async function createDonationInvoiceLink(params: {
  donationId: string;
  type: string;
  starsAmount: number;
  message: string;
  telegramUserId: string;
}): Promise<string> {
  const { donationId, type, starsAmount, message, telegramUserId } = params;
  
  // Формируем payload для счета
  const payload = JSON.stringify({
    type: 'donation',
    donationId,
    telegramUserId,
    timestamp: Date.now()
  });
  
  // Создаем счет через Telegram Bot API
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN не настроен');
  }
  
  const donationConfig = DONATION_OPTIONS[type as DonationType];
  
  const invoiceData = {
    title: `💝 ${donationConfig.name}`,
    description: message,
    payload: payload,
    currency: 'XTR', // Telegram Stars
    prices: [
      {
        label: donationConfig.name,
        amount: starsAmount
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
    throw new Error('Не удалось создать счет для доната');
  }
}
