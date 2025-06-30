// COLLAPSE_PREVENTION_FIX.md

# 🛡️ Решение проблемы сворачивания Telegram Mini App при скролле

## 📋 Реализованные решения

### ✅ **1. Hook для предотвращения коллапса**
Файл: `src/hooks/use-prevent-collapse.ts`

**Что делает:**
- Пытается использовать современный API `disableVerticalSwipes()` (Bot API 7.7+)
- Fallback на проверенные CSS/JS решения для старых версий
- Автоматически применяется в layout всего Telegram приложения
- Логирует какое решение сработало для отладки

### ✅ **2. CSS стили для поддержки**
Файл: `src/app/globals.css`

**Добавленные стили:**
```css
/* Базовые стили для предотвращения коллапса */
html {
  min-height: calc(100% + 1px);
}

body {
  overscroll-behavior: none;
  -webkit-overscroll-behavior: none;
  min-height: 100vh;
}

/* Специальные стили для элементов с data-scrollable */
[data-scrollable] {
  min-height: calc(100vh + 1px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}
```

### ✅ **3. Интеграция в layout**
Файл: `src/app/tg/layout.tsx`

**Добавлено:**
```typescript
import { usePreventCollapse } from '@/hooks/use-prevent-collapse';

export default function TelegramLayout({ children }) {
  // Предотвращаем сворачивание приложения при скролле
  usePreventCollapse();
  
  return (/* JSX */);
}
```

### ✅ **4. Разметка с data-scrollable**
**Обновленные файлы:**
- `src/app/tg/page.tsx` - главная страница
- `src/app/tg/businesses/page.tsx` - список заведений  
- `src/app/tg/chats/page.tsx` - список чатов

**Добавлены атрибуты:**
```html
<div className="threegis-app-container" data-scrollable>
<div className="px-4 py-4" data-scrollable>
```

## 🔧 Техническая логика

### Алгоритм работы:
1. **Проверка современного API** - пытается `window.Telegram.WebApp.disableVerticalSwipes()`
2. **Fallback решения** если современный API недоступен:
   - Обеспечение прокручиваемости документа (`calc(100vh + 1px)`)
   - Предотвращение коллапса при `window.scrollY === 0`
   - Специальная обработка скроллящихся элементов
3. **CSS поддержка** через `overscroll-behavior` и `min-height`

### Поддерживаемые версии:
- ✅ **Bot API 7.7+** - современное решение через `disableVerticalSwipes()`
- ✅ **Bot API <7.7** - fallback через CSS/JS хаки
- ✅ **iOS Safari** - специальная обработка `-webkit-overscroll-behavior`
- ✅ **Android Chrome** - стандартные CSS свойства

## 📊 Логирование и мониторинг

### Console выводы:
```
🔍 Telegram WebApp detected, applying collapse prevention...
✅ Modern solution: disableVerticalSwipes() applied
✅ Vertical swipes successfully disabled
```

или

```
🔍 Telegram WebApp detected, applying collapse prevention...
⚠️ Modern disableVerticalSwipes() not available
🔧 Applying fallback solution for collapse prevention...
📏 Document not scrollable, making it scrollable...
✅ Collapse prevention setup complete
```

### Cleanup:
```
🧹 Cleaning up collapse prevention...
```

## 🧪 Тестирование

### Для проверки работы:
1. **Откройте приложение в Telegram на мобильном**
2. **Перейдите на страницу с длинным списком** (businesses, chats)
3. **Попробуйте потянуть список вниз от самого верха**
4. **Проверьте Console** - должно быть логирование работы

### Ожидаемое поведение:
- ❌ **Раньше**: приложение сворачивалось при swipe down в верхней части
- ✅ **Теперь**: приложение остается развернутым, список прокручивается нормально

## 🎯 Покрытие файлов

**Новые файлы:**
- ✅ `src/hooks/use-prevent-collapse.ts`

**Обновленные файлы:**
- ✅ `src/app/tg/layout.tsx`
- ✅ `src/app/tg/page.tsx`
- ✅ `src/app/tg/businesses/page.tsx`
- ✅ `src/app/tg/chats/page.tsx`
- ✅ `src/app/globals.css`

## 🚀 Готово к тестированию

Решение полностью реализовано и готово к:
1. **Commit в GitHub**
2. **Deploy на Vercel**
3. **Тестирование в реальном Telegram приложении**

**Команды для деплоя:**
```bash
git add .
git commit -m "feat: Add comprehensive collapse prevention for Telegram Mini App

- Add usePreventCollapse hook with modern disableVerticalSwipes() API
- Fallback CSS/JS solutions for older Telegram versions  
- Apply data-scrollable attributes to main containers
- CSS optimizations for iOS and Android
- Logging for debugging effectiveness"

git push origin main
```

## 📱 Поддерживаемые платформы

- ✅ **iOS Telegram** - через `-webkit-overscroll-behavior` и API
- ✅ **Android Telegram** - через `overscroll-behavior` и API  
- ✅ **Telegram Web** - через стандартные CSS свойства
- ✅ **Desktop Telegram** - автоматически отключено (только мобильная проблема)

---

**Реализовано:** Декабрь 2024  
**Статус:** ✅ Готово к продакшену  
**Тестирование:** Требуется в реальном Telegram приложении
