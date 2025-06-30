# 🔧 КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ ОШИБОК 3GIS

## ✅ ЧТО БЫЛО ИСПРАВЛЕНО:

### 1. 🚨 Event handlers cannot be passed to Client Component props
**Проблема**: Next.js 15 запрещает передавать onClick handlers в Server Components
**Решение**: 
- ✅ ShareButton уже помечен как `'use client'`
- ✅ Добавлены проверки `typeof window !== 'undefined'` для browser APIs
- ✅ Добавлены проверки `typeof navigator !== 'undefined'` для navigator APIs

### 2. 🗄️ Prisma Database Schema Mismatch
**Проблема**: API использовал snake_case, а Prisma схема - camelCase
**Решение**:
- ✅ Исправлены поля в `/api/analytics/share/route.ts`:
  - `entity_type` → `entityType`
  - `entity_id` → `entityId`
  - `share_count` → `shareCount`
  - `telegramChats` → `telegramChat`

### 3. 📊 ShareAnalytics Missing Columns
**Проблема**: База данных не синхронизирована с Prisma схемой
**Решение**: Нужно выполнить команды синхронизации

---

## 🚀 КОМАНДЫ ДЛЯ ИСПРАВЛЕНИЯ (ВЫПОЛНИТЕ ПО ПОРЯДКУ):

```bash
# 1. Обновить Prisma Client
npx prisma generate

# 2. Синхронизировать схему с базой данных
npx prisma db push

# 3. Перезапустить сервер разработки
npm run dev
```

## 🔍 ПРОВЕРКА ИСПРАВЛЕНИЙ:

После выполнения команд:

1. **Откройте приложение**: http://localhost:3000/tg
2. **Перейдите к любому заведению**: /tg/business/1
3. **Нажмите кнопку "Поделиться"** → должна открыться модал без ошибок ✅
4. **Проверьте логи в консоли** → не должно быть ошибок Prisma ✅

---

## 📝 ДЕТАЛИ ИСПРАВЛЕНИЙ:

### ShareButton.tsx:
```typescript
// ✅ ИСПРАВЛЕНО: Добавлены проверки браузера
if (typeof navigator !== 'undefined' && navigator.share) {
  // Только в браузере
}

if (typeof window !== 'undefined') {
  window.open(url, '_blank');
}

// ✅ ИСПРАВЛЕНО: Правильный вызов SDK v3.x
if (openTelegramLink.isAvailable()) {
  openTelegramLink(tmaUrl);
}
```

### Analytics API:
```typescript
// ✅ ИСПРАВЛЕНО: Правильные поля Prisma
const analyticsData = {
  entityType: entityType as 'BUSINESS' | 'CHAT',  // вместо entity_type
  entityId: parseInt(entityId),                   // вместо entity_id
  businessId: parseInt(entityId),                 // вместо business_id
  // ...
};

// ✅ ИСПРАВЛЕНО: Правильная модель
await prisma.telegramChat.update({              // вместо telegramChats
  data: { shareCount: { increment: 1 } }        // вместо share_count
});
```

---

## ⚠️ ЕСЛИ ОСТАЛИСЬ ОШИБКИ:

### Prisma ошибки:
```bash
# Сброс базы данных (только для development!)
npx prisma migrate reset

# Создание новой миграции
npx prisma migrate dev --name fix_share_analytics
```

### Browser APIs ошибки:
- Убедитесь, что все компоненты с event handlers помечены `'use client'`
- Проверьте, что нет Server Components, которые передают onClick handlers

---

## 🎯 РЕЗУЛЬТАТ:

После исправлений должно работать:
- ✅ Система шеринга без ошибок
- ✅ Модал шеринга открывается корректно  
- ✅ Аналитика записывается в базу данных
- ✅ Счетчики shareCount обновляются
- ✅ Никаких ошибок в логах Vercel

## 🔗 Тестирование:

1. **Local**: http://localhost:3000/tg/business/1
2. **Share URL**: http://localhost:3000/b/1
3. **Analytics API**: GET /api/analytics/share?entityType=BUSINESS&entityId=1

---

**📞 Если нужна помощь** - пишите, предоставлю дополнительные инструкции!
