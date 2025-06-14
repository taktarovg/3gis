# 3GIS - Russian Business Directory

🇺🇸 **3GIS** - первый современный справочник русскоязычных услуг в США в формате Telegram Mini App.

## 🚀 О проекте

3GIS решает проблему поиска русскоязычных услуг для 5.5 миллионов русскоговорящих американцев. Приложение предоставляет удобный поиск врачей, юристов, ресторанов и других услуг на родном языке.

### ✨ Основные функции

- 🔍 **Поиск по 8 категориям**: рестораны, медицина, юристы, красота, авто, финансы, образование, недвижимость
- 📱 **Telegram Mini App** с автоматической авторизацией
- 🗺️ **Геолокация** и построение маршрутов
- ⭐ **Система рейтингов** и отзывов
- 🇷🇺 **Фильтр по русскому языку** обслуживания
- 💎 **Премиум функции** для бизнесов

## 🛠 Технологический стек

- **Frontend**: Next.js 15 + React 18 + TypeScript
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Auth**: Telegram Web App
- **Deployment**: Vercel
- **Storage**: AWS S3 (для изображений)

## 🚀 Быстрый старт

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/tbcgroupus/3gis.git
cd 3gis

# Установить зависимости
npm install

# Настроить environment variables
cp .env.example .env
# Заполнить переменные в .env

# Создать таблицы в БД
npm run db:push

# Заполнить тестовыми данными
npm run db:seed

# Запустить в режиме разработки
npm run dev
```

### Environment Variables

```bash
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Telegram
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="ThreeGIS_bot"
TELEGRAM_BOT_TOKEN="..."

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WEBSITE_URL="http://localhost:3000"

# AWS S3 (для изображений)
AWS_S3_BUCKET_NAME="..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"

# Security
JWT_SECRET="..."
NODE_ENV="development"
```

## 📊 API Endpoints

- `GET /api/categories` - Список категорий услуг
- `GET /api/businesses` - Список заведений с фильтрами
- `GET /api/businesses/[id]` - Детали заведения
- `GET /api/cities` - Список городов
- `POST /api/upload` - Загрузка изображений (S3)

### Примеры запросов

```bash
# Получить все рестораны
GET /api/businesses?category=restaurants

# Поиск по названию
GET /api/businesses?search=русский

# Фильтр по русскому языку
GET /api/businesses?filter=russian

# Комбинированный запрос
GET /api/businesses?category=healthcare&city=New York&filter=russian
```

## 🗄 База данных

Проект использует следующие основные модели:

- **Business** - заведения с полной информацией
- **BusinessCategory** - категории услуг
- **City** - города США
- **User** - пользователи Telegram
- **BusinessReview** - отзывы и рейтинги
- **BusinessPhoto** - фотографии заведений

### Команды для БД

```bash
# Создать миграцию
npx prisma db push

# Заполнить тестовыми данными
npm run db:seed

# Сбросить БД
npm run db:reset

# Открыть Prisma Studio
npx prisma studio
```

## 🚀 Деплой

### Vercel (рекомендуется)

```bash
# Установить Vercel CLI
npm i -g vercel

# Логин
vercel login

# Деплой
vercel --prod
```

### Environment Variables для продакшена

Настройте переменные окружения в Vercel Dashboard:

- Скопируйте все переменные из `.env.example`
- Обновите URL на production домен
- Добавьте production Telegram Bot Token

## 📱 Telegram Bot Setup

1. Создайте бота через @BotFather
2. Получите TOKEN
3. Настройте Mini App:
   ```
   /newapp
   URL: https://yourdomain.com/tg
   ```

## 🤝 Контрибьют

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) файл для деталей.

## 📞 Контакты

- **Telegram**: [@ThreeGIS_bot](https://t.me/ThreeGIS_bot)
- **GitHub**: [github.com/tbcgroupus/3gis](https://github.com/tbcgroupus/3gis)
- **Website**: [3gis.us](https://3gis.us)

## 🗺️ Roadmap

- [x] MVP с основными функциями
- [x] Telegram Mini App интеграция
- [x] База данных с тестовыми заведениями
- [ ] AWS S3 интеграция для изображений
- [ ] Система добавления заведений пользователями
- [ ] Telegram Stars монетизация
- [ ] Расширение на другие города
- [ ] Mobile приложение

---

**3GIS** - твой проводник в русскоязычной Америке! 🇺🇸