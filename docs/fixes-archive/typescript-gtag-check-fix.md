# TypeScript Fix: window.gtag проверка в тестовой странице

## Ошибка при деплое
```
Type error: This condition will always return true since this function is always defined. Did you mean to call it instead?

./src/app/test-analytics/page.tsx:18:11
if (window.gtag) {
```

## Решение
Заменили простую проверку на более строгую:

```typescript
// ❌ Было:
if (window.gtag) {

// ✅ Стало:
if (window.gtag && typeof window.gtag === 'function') {
```

## Объяснение
TypeScript в strict mode предупреждает, что `window.gtag` как функция всегда будет "truthy", даже если не инициализирована. Добавление проверки типа делает условие более явным и корректным.

Это аналогично исправлению с `navigator.share`, которое мы делали ранее.

## Результат
- ✅ TypeScript ошибка исправлена
- ✅ Функциональность сохранена
- ✅ Деплой проходит успешно

---
*Исправление #3 для TypeScript strict mode в проекте 3GIS*
