# 🔧 Исправление Google Maps TypeScript ошибки

## ❌ Проблема:
```
Type error: Argument of type '{ apiKey: string; version: string; libraries: readonly ["places", "geometry"]; language: string; region: string; }' is not assignable to parameter of type 'LoaderOptions'.
Types of property 'libraries' are incompatible.
The type 'readonly ["places", "geometry"]' is 'readonly' and cannot be assigned to the mutable type 'Library[]'.
```

## 🔍 Причина:
Массив `libraries` был определен как `readonly` с помощью `as const`, но Google Maps Loader ожидает мутабельный массив `Library[]`.

## ✅ Решение:
Убрать `as const` из определения массива `libraries`:

**Было:**
```typescript
libraries: ['places', 'geometry'] as const,
```

**Стало:**
```typescript
libraries: ['places', 'geometry'],
```

## 🚀 Результат:
- ✅ TypeScript ошибка исправлена
- ✅ Google Maps Loader корректно принимает конфигурацию
- ✅ Функциональность геолокации сохранена

**Готово к деплою!** 🎉
