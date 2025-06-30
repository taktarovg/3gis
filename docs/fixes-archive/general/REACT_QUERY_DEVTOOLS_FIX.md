# 🔧 Исправление ошибки React Query DevTools для Vercel

## ❌ Проблема
```
Module not found: Can't resolve '@tanstack/react-query-devtools'
```

## ✅ Решение

### 1. Добавлен пакет в devDependencies
```json
"devDependencies": {
  "@tanstack/react-query-devtools": "^5.18.1",
  "prettier": "^3.2.5", 
  "tsx": "^4.7.0"
}
```

### 2. Обновлен ReactQueryProvider для Next.js
- ✅ Динамический импорт devtools только в development
- ✅ SSR-safe импорт с `ssr: false`
- ✅ Правильная инициализация только на клиенте

### 3. Зачем devDependency?
- В production devtools автоматически исключаются из сборки
- Next.js App Router требует установку как devDependency
- Dynamic import предотвращает SSR ошибки

## 🚀 Готово к деплою
Теперь билд пройдет успешно в Vercel!

## 📱 Кнопки избранного должны появиться:
- ❤️ На карточках заведений в списке
- ❤️ На странице заведения (правый верхний угол)
- ❤️ С haptic feedback в Telegram
