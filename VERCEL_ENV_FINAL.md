# 🔧 Vercel Environment Variables для 3GIS

## 📋 Обязательные переменные окружения

### Database (Supabase)
```
DATABASE_URL=postgresql://postgres.ogvqcjmflawcsmbuvsor:159357Qaz@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.ogvqcjmflawcsmbuvsor:159357Qaz@aws-0-us-east-1.pooler.supabase.com:5432/postgres

NEXT_PUBLIC_SUPABASE_URL=https://ogvqcjmflawcsmbuvsor.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ndnFjam1mbGF3Y3NtYnV2c29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODk5NTYsImV4cCI6MjA2NTQ2NTk1Nn0.89ExfW5j-npcjfjCvEvuj7aATZQDL0NROh00xmkZ2Pg
```

### Google Maps API
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDoLDzLWQVc6e1guAGiQa7Fgzm9nneZ8DI
```

### Telegram
```
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=ThreeGIS_bot
TELEGRAM_BOT_TOKEN=7123456789:AAAA_ваш_токен_бота
```

### App URLs (для продакшена)
```
NEXT_PUBLIC_APP_URL=https://3gis.vercel.app
NEXT_PUBLIC_WEBSITE_URL=https://3gis.vercel.app
```

### Security
```
JWT_SECRET=your_super_secret_jwt_key_for_3gis_app_2025
```

### Optional (для файлов)
```
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key  
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## 🎯 Как добавить в Vercel

### Через Dashboard:
1. Перейдите в ваш проект 3GIS на vercel.com
2. Settings → Environment Variables
3. Добавьте каждую переменную отдельно
4. Выберите среду: Production, Preview, Development

### Важные настройки:
- **NODE_ENV** - устанавливается автоматически Vercel
- **VERCEL** - устанавливается автоматически Vercel
- **VERCEL_URL** - устанавливается автоматически Vercel

## ✅ Проверка переменных

### После деплоя проверьте:
1. **База данных** - должны подгружаться заведения
2. **Google Maps** - должны отображаться карты
3. **Telegram** - должна работать авторизация

### При ошибках:
- Проверьте правильность всех переменных
- Убедитесь что нет лишних пробелов
- Перезапустите деплоймент

## 🚀 После настройки переменных

1. **Push код** через `push-changes.bat`
2. **Vercel автоматически задеплоит**
3. **Проверьте работу** на https://3gis.vercel.app/tg

Готово! 🎉
