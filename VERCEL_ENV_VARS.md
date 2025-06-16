# Environment Variables для Vercel (Production)

# Supabase Database (уже настроено)
DATABASE_URL="postgresql://postgres.ogvqcjmflawcsmbuvsor:159357Qaz@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.ogvqcjmflawcsmbuvsor:159357Qaz@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Supabase Public (уже настроено)
NEXT_PUBLIC_SUPABASE_URL="https://ogvqcjmflawcsmbuvsor.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ndnFjam1mbGF3Y3NtYnV2c29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODk5NTYsImV4cCI6MjA2NTQ2NTk1Nn0.89ExfW5j-npcjfjCvEvuj7aATZQDL0NROh00xmkZ2Pg"

# Telegram (уже настроено)  
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="ThreeGIS_bot"
TELEGRAM_BOT_TOKEN="your_bot_token_here"

# App URLs (продакшен)
NEXT_PUBLIC_APP_URL="https://3gis.vercel.app"
NEXT_PUBLIC_WEBSITE_URL="https://3gis.vercel.app"

# ⭐ НОВЫЕ переменные для геолокации ⭐
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyDoLDzLWQVc6e1guAGiQa7Fgzm9nneZ8DI"

# Cloudinary (если будет использоваться)
CLOUDINARY_CLOUD_NAME="your_cloudinary_name"
CLOUDINARY_API_KEY="your_cloudinary_key" 
CLOUDINARY_API_SECRET="your_cloudinary_secret"

# JWT Secret
JWT_SECRET="your_jwt_secret_here"

# Environment
NODE_ENV="production"

---

# 📋 Инструкции для добавления в Vercel:

1. Зайти в Vercel Dashboard
2. Выбрать проект 3GIS
3. Settings → Environment Variables
4. Добавить ТОЛЬКО новую переменную:

Название: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Значение: AIzaSyDoLDzLWQVc6e1guAGiQa7Fgzm9nneZ8DI
Environment: Production

5. Сохранить и пересобрать проект
