# Fix TypeScript Error for Google Analytics

## Описание проблемы
При деплое на Vercel возникала ошибка типизации для `gtag`:
```
Type error: Subsequent property declarations must have the same type. Property 'gtag' must be of type '(command: string, ...args: any[]) => void', but here has type 'GtagConfigCommand & GtagEventCommand & GtagConsentCommand & GtagJsCommand'.
```

## Решение
1. **Убрал сложную типизацию** из `GoogleAnalytics.tsx`
2. **Создал отдельный файл типов** `types/analytics.d.ts` с простой типизацией
3. **Упростил объявление** `gtag` до `(...args: any[]) => void`

## Изменения
- ✅ Создан `types/analytics.d.ts` с правильными типами
- ✅ Упрощена типизация в `GoogleAnalytics.tsx`
- ✅ Убраны конфликтующие декларации типов

## Результат
- ❌ **Было**: TypeScript ошибка при сборке
- ✅ **Стало**: Чистая сборка без ошибок типизации

Проблема возникала из-за конфликта между кастомными типами `GtagConfigCommand & GtagEventCommand` и встроенными типами Google Analytics.
