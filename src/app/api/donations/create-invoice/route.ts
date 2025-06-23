import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DONATION_OPTIONS, getDonationConfig, validateStarsAmount } from '@/lib/telegram-stars/plans';
import { z } from 'zod';

const CreateDonationInvoiceSchema = z.object({
  type: z.enum(['coffee', 'lunch', 'support', 'custom']),
  starsAmount: z.number().min(1).max(10000),
  message: z.string().optional(),
  telegramUserId: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, starsAmount, message, telegramUserId } = CreateDonationInvoiceSchema.parse(body);
    
    // Валидируем сумму Stars
    if (!validateStarsAmount(starsAmount)) {
      return NextResponse.json(
        { error: 'Неверная сумма Stars (от 1 до 10,000)' },
        { status: 400 }
      );
    }

    const donationConfig = getDonationConfig(type);
    
    // Для кастомного типа используем введенную сумму
    const finalStarsAmount = type === 'custom' ? starsAmount : (donationConfig.starsAmount || starsAmount);
    
    // Создаем запись доната
    const donation = await prisma.donation.create({
      data: {
        type,
        starsAmount: finalStarsAmount,
        message: message || donationConfig.description,
        telegramUserId,
        status: 'PENDING'
      }
    });

    // Создаем счет через Telegram Bot API
    const { createTelegramInvoice } = await import('@/lib/telegram-bot');
    
    const invoiceLink = await createTelegramInvoice({
      donationId: donation.id,
      donationType: type,
      starsAmount: finalStarsAmount,
      title: donationConfig.name,
      description: message || donationConfig.description,
      userId: telegramUserId
    });
    
    return NextResponse.json({
      success: true,
      invoiceLink,
      donationId: donation.id,
      starsAmount: finalStarsAmount,
      donation: {
        type,
        name: donationConfig.name,
        icon: donationConfig.icon,
        description: donationConfig.description
      }
    });
    
  } catch (error) {
    console.error('Donation invoice error:', error);
    
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
