'use server';

import { PREMIUM_PLANS, DONATION_OPTIONS } from '@/lib/telegram-stars/plans';

interface CreateInvoiceParams {
  businessId?: number;
  plan?: string;
  donationId?: string;
  donationType?: string;
  starsAmount: number;
  title: string;
  description: string;
  userId: string;
}

/**
 * Создание ссылки на счет через Telegram Bot API
 */
export async function createTelegramInvoice(params: CreateInvoiceParams): Promise<string> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN не настроен');
  }

  const payload = JSON.stringify({
    type: params.businessId ? 'subscription' : 'donation',
    businessId: params.businessId,
    subscriptionId: params.businessId, // будет обновлено после создания в БД
    donationId: params.donationId,
    plan: params.plan,
    donationType: params.donationType,
    timestamp: Date.now(),
    userId: params.userId
  });

  const invoiceData = {
    title: params.title,
    description: params.description,
    payload: payload,
    provider_token: '', // Пустой для Telegram Stars
    currency: 'XTR', // Telegram Stars
    prices: [{
      label: params.title,
      amount: params.starsAmount
    }],
    max_tip_amount: 0,
    suggested_tip_amounts: [],
    start_parameter: 'threegis_payment',
    photo_url: 'https://3gis.vercel.app/logo-512.png', // Логотип 3GIS
    photo_size: 512,
    photo_width: 512,
    photo_height: 512,
    need_name: false,
    need_phone_number: false,
    need_email: false,
    need_shipping_address: false,
    send_phone_number_to_provider: false,
    send_email_to_provider: false,
    is_flexible: false
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
      console.error('Telegram API Error:', result);
      throw new Error(`Telegram API Error: ${result.description}`);
    }

    return result.result; // URL счета
  } catch (error) {
    console.error('Error creating Telegram invoice:', error);
    throw new Error('Не удалось создать счет через Telegram Bot API');
  }
}

/**
 * Проверка валидности подписи webhook'а от Telegram
 */
export async function verifyTelegramWebhook(body: string, signature: string): Promise<boolean> {
  if (!process.env.TELEGRAM_WEBHOOK_SECRET) {
    console.warn('TELEGRAM_WEBHOOK_SECRET не настроен, пропускаем проверку подписи');
    return true; // В development режиме
  }

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', process.env.TELEGRAM_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Отправка ответа на pre_checkout_query
 */
export async function answerPreCheckoutQuery(queryId: string, ok: boolean, errorMessage?: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN не настроен');
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pre_checkout_query_id: queryId,
      ok: ok,
      error_message: errorMessage
    })
  });

  const result = await response.json();
  
  if (!result.ok) {
    console.error('Error answering pre-checkout query:', result);
    throw new Error(`Failed to answer pre-checkout query: ${result.description}`);
  }

  return result;
}
