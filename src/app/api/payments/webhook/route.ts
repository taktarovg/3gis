import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Проверяем подпись webhook'а
    const signature = request.headers.get('x-telegram-bot-api-secret-token');
    const body = await request.text();
    
    const { verifyTelegramWebhook } = await import('@/lib/telegram-bot');
    const isValidSignature = await verifyTelegramWebhook(body, signature || '');
    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }
    
    const update = JSON.parse(body);
    
    // Логируем для отладки
    console.log('Telegram webhook update:', JSON.stringify(update, null, 2));
    
    // Обработка successful_payment
    if (update.message?.successful_payment) {
      await handleSuccessfulPayment(update.message.successful_payment);
    }
    
    // Обработка pre_checkout_query
    if (update.pre_checkout_query) {
      await handlePreCheckoutQuery(update.pre_checkout_query);
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing error' }, 
      { status: 500 }
    );
  }
}

async function handlePreCheckoutQuery(preCheckoutQuery: any) {
  const { id: queryId, invoice_payload } = preCheckoutQuery;
  
  try {
    const payload = JSON.parse(invoice_payload);
    console.log('Pre-checkout payload:', payload);
    
    // Валидация заказа
    const isValid = await validateOrder(payload);
    
    // Отвечаем Telegram Bot API
    const { answerPreCheckoutQuery } = await import('@/lib/telegram-bot');
    const result = await answerPreCheckoutQuery(
      queryId, 
      isValid, 
      isValid ? undefined : 'Заказ недействителен'
    );
    
    console.log('Pre-checkout response:', result);
    
  } catch (error) {
    console.error('Pre-checkout error:', error);
    
    // В случае ошибки отклоняем платеж
    const { answerPreCheckoutQuery } = await import('@/lib/telegram-bot');
    await answerPreCheckoutQuery(
      preCheckoutQuery.id,
      false,
      'Ошибка валидации заказа'
    );
  }
}

async function handleSuccessfulPayment(payment: any) {
  try {
    const { 
      currency, 
      total_amount, 
      invoice_payload, 
      telegram_payment_charge_id 
    } = payment;
    
    console.log('Successful payment:', {
      currency,
      total_amount,
      charge_id: telegram_payment_charge_id,
      payload: invoice_payload
    });
    
    const payload = JSON.parse(invoice_payload);
    
    if (payload.t === 'sub') { // subscription
      // Находим последнюю pending подписку для бизнеса
      const subscription = await prisma.businessSubscription.findFirst({
        where: {
          businessId: payload.bid,
          status: 'PENDING'
        },
        orderBy: { createdAt: 'desc' }
      });
      
      if (!subscription) {
        console.error('No pending subscription found for business:', payload.bid);
        return;
      }
      
      await activateBusinessSubscription({
        subscriptionId: subscription.id,
        businessId: payload.bid,
        telegramPaymentId: telegram_payment_charge_id,
        starsAmount: total_amount
      });
    } else if (payload.t === 'don') { // donation
      await processDonation({
        donationId: payload.did, // donationId теперь в did
        telegramPaymentId: telegram_payment_charge_id,
        starsAmount: total_amount
      });
    }
    
  } catch (error) {
    console.error('Error processing successful payment:', error);
    throw error;
  }
}

async function validateOrder(payload: any): Promise<boolean> {
  try {
    // Проверяем что заказ не старше 10 минут
    const tenMinutesAgo = Math.floor(Date.now() / 1000) - (10 * 60); // в секундах
    if (payload.ts < tenMinutesAgo) {
      console.log('Order is too old:', payload.ts);
      return false;
    }
    
    if (payload.t === 'sub') { // subscription
      // Проверяем существование заведения по businessId
      if (!payload.bid) {
        console.log('Missing businessId in payload:', payload);
        return false;
      }
      
      const business = await prisma.business.findUnique({
        where: { id: payload.bid },
        include: { subscriptions: { where: { status: 'PENDING' } } }
      });
      
      if (!business) {
        console.log('Business not found:', payload.bid);
        return false;
      }
      
      // Проверяем, что есть ожидающая подписка
      if (business.subscriptions.length === 0) {
        console.log('No pending subscriptions for business:', payload.bid);
        return false;
      }
      
      return true;
    }
    
    if (payload.t === 'don') { // donation
      // Проверяем существование доната
      const donation = await prisma.donation.findUnique({
        where: { id: payload.did } // donationId теперь в did
      });
      
      if (!donation || donation.status !== 'PENDING') {
        console.log('Invalid donation:', payload.did);
        return false;
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Order validation error:', error);
    return false;
  }
}

async function activateBusinessSubscription(params: {
  subscriptionId: number;
  businessId: number;
  telegramPaymentId: string;
  starsAmount: number;
}) {
  const { subscriptionId, businessId, telegramPaymentId, starsAmount } = params;
  
  try {
    // Начинаем транзакцию
    await prisma.$transaction(async (tx) => {
      // Обновляем подписку
      const subscription = await tx.businessSubscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'ACTIVE',
          paymentStatus: 'PAID'
        }
      });
      
      // Создаем запись транзакции
      await tx.paymentTransaction.create({
        data: {
          subscriptionId: subscriptionId,
          telegramPaymentId: telegramPaymentId,
          starsAmount: starsAmount,
          status: 'PAID',
          paidAt: new Date(),
          telegramUserId: 'webhook', // TODO: получить из платежа
          metadata: {
            source: 'telegram_webhook',
            processedAt: new Date().toISOString()
          }
        }
      });
      
      // Обновляем статус заведения
      await tx.business.update({
        where: { id: businessId },
        data: {
          premiumTier: subscription.tier,
          premiumUntil: subscription.endDate
        }
      });
    });
    
    console.log(`Subscription ${subscriptionId} activated successfully`);
    
  } catch (error) {
    console.error('Error activating subscription:', error);
    throw error;
  }
}

async function processDonation(params: {
  donationId: string;
  telegramPaymentId: string;
  starsAmount: number;
}) {
  const { donationId, telegramPaymentId, starsAmount } = params;
  
  try {
    // Обновляем донат
    await prisma.$transaction(async (tx) => {
      // Обновляем статус доната
      await tx.donation.update({
        where: { id: donationId },
        data: {
          status: 'PAID',
          paidAt: new Date()
        }
      });
      
      // Создаем запись транзакции
      await tx.paymentTransaction.create({
        data: {
          donationId: donationId,
          telegramPaymentId: telegramPaymentId,
          starsAmount: starsAmount,
          status: 'PAID',
          paidAt: new Date(),
          telegramUserId: 'webhook', // TODO: получить из платежа
          metadata: {
            source: 'telegram_webhook',
            processedAt: new Date().toISOString()
          }
        }
      });
    });
    
    console.log(`Donation ${donationId} processed successfully`);
    
  } catch (error) {
    console.error('Error processing donation:', error);
    throw error;
  }
}
