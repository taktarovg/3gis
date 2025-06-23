# 🔧 Исправления для сборки Next.js 15

## Исправленные проблемы:

### 1. **TypeScript ошибка в API route** ✅
**Файл:** `src/app/api/businesses/[id]/subscription/route.ts`

**Проблема:** Next.js 15 изменил тип параметров для динамических API routes
```typescript
// До (Next.js 14)
{ params }: { params: { id: string } }

// После (Next.js 15) 
{ params }: { params: Promise<{ id: string }> }
```

**Решение:** Обновили сигнатуру функции и добавили `await params`

### 2. **ESLint warning в React Hook** ✅
**Файл:** `src/components/premium/SubscriptionStatus.tsx`

**Проблема:** React Hook useEffect с отсутствующей зависимостью
```
Warning: React Hook useEffect has a missing dependency: 'fetchSubscriptionStatus'
```

**Решение:** Обернули `fetchSubscriptionStatus` в `useCallback` и добавили в зависимости

## Статус сборки:
- ✅ TypeScript ошибки исправлены
- ✅ ESLint warnings исправлены  
- ✅ Готово к новой сборке на Vercel

## Для деплоя:
```bash
git add .
git commit -m "fix: Next.js 15 API routes compatibility + ESLint warnings"
git push origin main
```
