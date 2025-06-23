# 🌟 Настройка Telegram Stars для 3GIS

## 📋 Пошаговая инструкция

### 1. Настройка бота через @BotFather

1. **Откройте @BotFather** в Telegram
2. **Обновите настройки бота**:
   ```
   /mybots
   Выберите: ThreeGIS_bot
   ```

3. **Настройте меню бота**:
   ```
   Bot Settings → Menu Button
   URL: https://3gis.biz/tg
   Текст кнопки: Открыть 3GIS
   ```

4. **Включите платежи** (если еще не включены):
   ```
   Bot Settings → Payments
   Provider: Telegram Stars
   ```

### 2. Переменные окружения

Добавьте в `.env` файл:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_WEBHOOK_SECRET=your_secure_random_string

# App URL (для продакшена)
NEXT_PUBLIC_APP_URL=https://3gis.biz
```

**Генерация webhook secret:**
```bash
# Linux/macOS
openssl rand -hex 32

# или просто строка 64 символа
echo "3gis_webhook_secret_$(date +%s)_$(openssl rand -hex 16)"
```

### 3. Настройка webhook

**Автоматически:**
```bash
npm run setup:webhook
```

**Вручную через curl:**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://3gis.biz/api/payments/webhook",
    "allowed_updates": ["message", "pre_checkout_query"],
    "secret_token": "your_webhook_secret",
    "drop_pending_updates": true
  }'
```

### 4. Проверка настройки

**Проверить webhook:**
```bash
npm run setup:webhook info
```

**Или вручную:**
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

### 5. Тестирование в Telegram

1. **Откройте бота** @ThreeGIS_bot
2. **Нажмите "Start"**
3. **Откройте Mini App**
4. **Перейдите на тестовую страницу**: `/tg/test-payments`
5. **Попробуйте тестовый платеж**

---

## 🔧 Устранение неполадок

### Webhook не работает

1. **Проверьте URL webhook:**
   ```bash
   curl https://3gis.biz/api/payments/webhook
   # Должен вернуть 405 Method Not Allowed (это нормально)
   ```

2. **Проверьте SSL сертификат:**
   ```bash
   curl -I https://3gis.biz
   # Должен быть валидный HTTPS
   ```

3. **Проверьте переменные окружения в Vercel:**
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_WEBHOOK_SECRET`

### Платежи не проходят

1. **Проверьте Telegram Stars в боте:**
   - У пользователя должны быть Stars для тестирования
   - Купить можно через @PremiumBot

2. **Проверьте логи в Vercel:**
   ```bash
   vercel logs
   ```

3. **Проверьте статус webhook:**
   ```bash
   npm run setup:webhook info
   ```

### Ошибки авторизации

1. **Проверьте Telegram SDK:**
   - Mini App должен быть открыт в Telegram
   - `useLaunchParams()` должен возвращать данные пользователя

2. **Проверьте переменные окружения:**
   ```bash
   # В development
   SKIP_TELEGRAM_VALIDATION=true
   
   # В production
   SKIP_TELEGRAM_VALIDATION=false
   ```

---

## 📊 Мониторинг и аналитика

### Логи платежей

**Webhook логи в Vercel:**
```bash
vercel logs --filter "payments/webhook"
```

**Проверка статуса подписок:**
```sql
SELECT 
  b.name as business_name,
  bs.tier,
  bs.status,
  bs.starsAmount,
  bs.createdAt
FROM business_subscriptions bs
JOIN businesses b ON bs.businessId = b.id
ORDER BY bs.createdAt DESC
LIMIT 10;
```

### Аналитика в админке

1. **Откройте админку**: `/admin/payments`
2. **Проверьте статистику:**
   - Общее количество подписок
   - Заработанные Stars
   - Последние транзакции

### Экспорт данных

**CSV экспорт подписок:**
```sql
COPY (
  SELECT 
    b.name,
    bs.tier,
    bs.starsAmount,
    bs.status,
    bs.createdAt,
    u.firstName || ' ' || u.lastName as owner_name
  FROM business_subscriptions bs
  JOIN businesses b ON bs.businessId = b.id
  JOIN users u ON b.ownerId = u.id
  ORDER BY bs.createdAt DESC
) TO '/tmp/subscriptions.csv' WITH CSV HEADER;
```

---

## 🚀 Production Deployment

### 1. Environment Variables в Vercel

```bash
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_APP_URL
```

### 2. Deploy и настройка webhook

```bash
# Deploy приложения
vercel --prod

# Настроить webhook
npm run setup:webhook
```

### 3. Проверка production

1. **Откройте бота в Telegram**
2. **Протестируйте платежи**
3. **Проверьте логи:** `vercel logs`
4. **Мониторинг админки:** `/admin/payments`

---

## 💡 Дополнительные функции

### Отправка уведомлений о платежах

```javascript
// В webhook после успешного платежа
async function sendPaymentNotification(telegramUserId, paymentData) {
  const message = `✅ Платеж успешно обработан!\n\n` +
    `💫 Сумма: ${paymentData.starsAmount} Stars\n` +
    `📋 Тип: ${paymentData.type}\n` +
    `🕐 Время: ${new Date().toLocaleString('ru-RU')}`;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: telegramUserId,
      text: message,
      parse_mode: 'HTML'
    })
  });
}
```

### Автоматическое продление подписок

```sql
-- Cron job для проверки истекающих подписок
SELECT * FROM business_subscriptions 
WHERE status = 'ACTIVE' 
AND endDate < NOW() + INTERVAL '7 days'
AND endDate > NOW();
```

### Статистика для владельцев бизнеса

Добавить в BusinessDetail:
- График просмотров после активации премиум
- Количество звонков и маршрутов
- Сравнение с обычными заведениями

---

## 📞 Поддержка

При возникновении проблем:

1. **Проверьте документацию**: `npm run setup:webhook`
2. **Логи Vercel**: `vercel logs`
3. **Telegram Bot API**: https://core.telegram.org/bots/api
4. **Telegram Stars**: https://core.telegram.org/bots/payments-stars

**Ready для production! 🚀**
