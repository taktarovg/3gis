import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    
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
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const response = await fetch(`https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pre_checkout_query_id: queryId,
        ok: isValid,
        error_message: isValid ? undefined : 'Заказ недействителен'
      })
    });
    
    const result = await response.json();
    console.log('Pre-checkout response:', result);
    
  } catch (error) {
    console.error('Pre-checkout error:', error);
    
    // В случае ошибки отклоняем платеж
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    await fetch(`https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pre_checkout_query_id: preCheckoutQuery.id,
        ok: false,
        error_message: 'Ошибка валидации заказа'
      })
    });
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
    
    if (payload.type === 'subscription') {
      await activateBusinessSubscription({
        subscriptionId: payload.subscriptionId,
        businessId: payload.businessId,
        telegramPaymentId: telegram_payment_charge_id,
        starsAmount: total_amount
      });
    } else if (payload.type === 'donation') {
      await processDonation({
        donationId: payload.donationId,
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
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    if (payload.timestamp < tenMinutesAgo) {
      console.log('Order is too old:', payload.timestamp);
      return false;
    }
    
    if (payload.type === 'subscription') {
      // Проверяем существование подписки и заведения
      const subscription = await prisma.businessSubscription.findUnique({
        where: { id: payload.subscriptionId },
        include: { business: true }
      });
      
      if (!subscription || subscription.status !== 'PENDING') {
        console.log('Invalid subscription:', payload.subscriptionId);
        return false;
      }
      
      return true;
    }
    
    if (payload.type === 'donation') {
      // Проверяем существование доната
      const donation = await prisma.donation.findUnique({
        where: { id: payload.donationId }
      });
      
      if (!donation || donation.status !== 'PENDING') {
        console.log('Invalid donation:', payload.donationId);
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
