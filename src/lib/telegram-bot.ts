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

  // Создаем короткий payload (до 128 байт)
  const payloadData = {
    t: params.businessId ? 'sub' : 'don', // type (сокращенно)
    bid: params.businessId,               // businessId
    did: params.donationId,               // donationId  
    p: params.plan,                       // plan
    dt: params.donationType,              // donationType
    ts: Math.floor(Date.now() / 1000),    // timestamp (в секундах)
    uid: params.userId                    // userId
  };
  
  const payload = JSON.stringify(payloadData);
  
  // Проверяем длину payload (должен быть до 128 байт)
  if (payload.length > 128) {
    throw new Error(`Payload слишком длинный: ${payload.length} байт (максимум 128)`);
  }

  // Для Telegram Stars используем минимальный набор параметров
  const invoiceData: any = {
    title: params.title,
    description: params.description,
    payload: payload,
    currency: 'XTR', // Telegram Stars
    prices: [{
      label: params.title,
      amount: params.starsAmount
    }]
  };
  
  // НЕ добавляем provider_token вообще - даже как пустую строку!

  console.log('Creating Telegram invoice with data:', {
    title: invoiceData.title,
    description: invoiceData.description,
    currency: invoiceData.currency,
    amount: invoiceData.prices[0].amount,
    payloadLength: payload.length,
    payload: payload
  });
  
  console.log('Full invoice data being sent to Telegram:', JSON.stringify(invoiceData, null, 2));

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData)
    });

    const result = await response.json();
    
    console.log('Telegram API response:', {
      ok: result.ok,
      description: result.description,
      error_code: result.error_code
    });
    
    if (!result.ok) {
      console.error('Telegram API Error:', result);
      throw new Error(`Telegram API Error: ${result.description}`);
    }

    console.log('Invoice created successfully:', result.result);
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
