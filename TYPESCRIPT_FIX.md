# 🔧 ИСПРАВЛЕНИЕ: TypeScript Error в Telegram Auth Route

## ❌ **ПРОБЛЕМА:**
```
Type error: Argument of type 'null' is not assignable to parameter of type 'string'.
./src/app/api/auth/telegram/route.ts:149:46
```

## ✅ **РЕШЕНИЕ:**

### 1. **Обновил функцию uploadUserAvatar:**
```typescript
// ДО:
async function uploadUserAvatar(imageUrl: string, telegramId: string): Promise<string>

// ПОСЛЕ:
async function uploadUserAvatar(imageUrl: string | null, telegramId: string): Promise<string>
```

### 2. **Исправил вызов в строке 149:**
```typescript
// ДО (ошибка):
avatar: await uploadUserAvatar(testUser.photoUrl, testUser.telegramId),

// ПОСЛЕ (исправлено):
avatar: testUser.photoUrl ? await uploadUserAvatar(testUser.photoUrl, testUser.telegramId) : DEFAULT_AVATAR_URL,
```

### 3. **Обновил типизацию avatarUrl:**
```typescript
// ДО:
let avatarUrl = userData.photoUrl;

// ПОСЛЕ:
let avatarUrl: string | null = userData.photoUrl;
```

---

## 🎯 **ИТОГ:**

✅ **TypeScript ошибка исправлена**
✅ **Null safety добавлен**  
✅ **Fallback к DEFAULT_AVATAR_URL**
✅ **Функция принимает nullable photoUrl**

**Build должен пройти успешно!** 🚀

---

## 📝 **Команды для проверки:**
```bash
git add .
git commit -m "🔧 Fixed TypeScript null safety in uploadUserAvatar"
git push
```

**Новый build на Vercel должен пройти без ошибок.**
