#!/usr/bin/env node
/**
 * Скрипт для настройки Telegram Bot webhook для 3GIS
 * Использование: npm run setup:webhook
 */

const { config } = require('dotenv');
const fetch = require('node-fetch');

// Загружаем переменные окружения
config();

// Полифилл для fetch в Node.js < 18
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`
  : 'https://3gis.biz/api/payments/webhook';
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

async function setupWebhook() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN не найден в .env файле');
    process.exit(1);
  }

  if (!WEBHOOK_SECRET) {
    console.error('❌ TELEGRAM_WEBHOOK_SECRET не найден в .env файле');
    process.exit(1);
  }

  console.log('🔧 Настройка Telegram Bot webhook...');
  console.log(`📡 Webhook URL: ${WEBHOOK_URL}`);

  try {
    // Устанавливаем webhook
    const setWebhookUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
    const webhookData = {
      url: WEBHOOK_URL,
      allowed_updates: ['message', 'pre_checkout_query'],
      secret_token: WEBHOOK_SECRET,
      drop_pending_updates: true
    };

    const response = await fetch(setWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookData)
    });

    const result = await response.json();

    if (result.ok) {
      console.log('✅ Webhook успешно настроен!');
      console.log(`📄 Описание: ${result.description}`);
      
      // Проверяем информацию о webhook
      await checkWebhookInfo();
    } else {
      console.error('❌ Ошибка настройки webhook:', result);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Ошибка при настройке webhook:', error);
    process.exit(1);
  }
}

async function checkWebhookInfo() {
  try {
    const infoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`;
    const response = await fetch(infoUrl);
    const result = await response.json();

    if (result.ok) {
      console.log('\n📊 Информация о webhook:');
      console.log(`🔗 URL: ${result.result.url}`);
      console.log(`✅ Имеет SSL сертификат: ${result.result.has_custom_certificate ? 'Да' : 'Нет'}`);
      console.log(`📊 Ожидающих обновлений: ${result.result.pending_update_count}`);
      
      if (result.result.last_error_date) {
        console.log(`⚠️ Последняя ошибка: ${new Date(result.result.last_error_date * 1000).toISOString()}`);
        console.log(`📝 Сообщение ошибки: ${result.result.last_error_message}`);
      } else {
        console.log('✅ Ошибок нет');
      }
    }
  } catch (error) {
    console.warn('⚠️ Не удалось получить информацию о webhook:', error);
  }
}

async function deleteWebhook() {
  try {
    console.log('🗑️ Удаление webhook...');
    const deleteUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`;
    
    const response = await fetch(deleteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        drop_pending_updates: true
      })
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Webhook успешно удален!');
    } else {
      console.error('❌ Ошибка удаления webhook:', result);
    }
  } catch (error) {
    console.error('❌ Ошибка при удалении webhook:', error);
  }
}

// Обработка аргументов командной строки
const command = process.argv[2];

async function main() {
  switch (command) {
    case 'setup':
    case undefined:
      await setupWebhook();
      break;
    
    case 'info':
      await checkWebhookInfo();
      break;
    
    case 'delete':
      await deleteWebhook();
      break;
    
    default:
      console.log(`
🤖 Telegram Bot Webhook Manager для 3GIS

Использование:
  npm run setup:webhook        - Настроить webhook
  npm run setup:webhook info   - Проверить статус webhook
  npm run setup:webhook delete - Удалить webhook

Переменные окружения:
  TELEGRAM_BOT_TOKEN     - Токен бота от @BotFather
  TELEGRAM_WEBHOOK_SECRET - Секретный ключ для webhook
  NEXT_PUBLIC_APP_URL    - URL приложения для webhook
      `);
      break;
  }
}

main().catch(console.error);
