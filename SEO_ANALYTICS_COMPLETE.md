# 📊 SEO & Traffic Analytics для 3GIS

## 🎯 Что отслеживается для САЙТА:

### 🔍 **Источники трафика:**

#### Автоматическое определение источников:
- ✅ **Google Organic** - органический поиск
- ✅ **Yandex Organic** - поиск в Яндексе  
- ✅ **Bing Organic** - поиск в Bing
- ✅ **Social Media** - Facebook, Instagram, VK, Telegram
- ✅ **Direct Traffic** - прямые переходы
- ✅ **Referral Traffic** - переходы с других сайтов
- ✅ **UTM Campaigns** - рекламные кампании

#### Сохраняемые данные:
- **Источник трафика** (google_organic, facebook, direct, etc.)
- **UTM параметры** (campaign, source, medium, term)
- **Ключевые слова** (где возможно определить)
- **Referrer URL** (с какого сайта пришли)
- **Время посещения**

---

## 🎯 **Целевые ключевые слова для SEO:**

### Основные запросы:
```
✅ "3gis" - брендовые запросы
✅ "русский справочник сша"
✅ "русскоязычные услуги америка"
✅ "русские врачи америка"
✅ "русские рестораны сша"
✅ "русские юристы америка"
```

### По городам:
```
✅ "русские врачи нью йорк"
✅ "русские рестораны бруклин"
✅ "русские юристы лос анджелес"
✅ "русские салоны красоты майами"
```

### По услугам:
```
✅ "иммиграционные адвокаты"
✅ "русскоговорящие врачи"
✅ "русская еда америка"
✅ "русские автосервисы"
✅ "русские парикмахерские"
```

### Справочные запросы:
```
✅ "справочник русских америка"
✅ "русский телефонный справочник"
✅ "где найти русского врача"
✅ "русские магазины америка"
```

---

## 📈 **Google Analytics Events для лендинга:**

### Автоматические события:
- **page_view** - просмотры главной страницы
- **landing_page_view** - с деталями источника трафика
- **landing_scroll** - прокрутка разделов лендинга

### Пользовательские события:
- **telegram_app_open** - клики "Открыть приложение"
  - `source: 'hero_cta'` - главная кнопка
  - `source: 'categories_section_cta'` - кнопка в категориях
- **category_card_click** - клики по карточкам категорий
- **landing_categories_click** - клик "Посмотреть категории"
- **social_media_click** - клики по соцсетям
- **contact_click** - клики по контактам

---

## 🔗 **Ожидаемые источники трафика:**

### 🔍 Поисковые системы:
- **Google.com** - основной источник органического трафика
- **Yandex.ru** - русскоязычные пользователи
- **Bing.com** - альтернативный поиск
- **DuckDuckGo.com** - приватный поиск

### 📱 Социальные сети:
- **Facebook Groups** - русскоязычные сообщества в США
- **Telegram Channels** - каналы про жизнь в Америке
- **VKontakte Communities** - группы эмигрантов
- **Instagram Posts** - посты про русские места

### 🌐 Референсы:
- **Brighton Beach блоги** - местные сайты
- **Русскоязычные порталы США** - community сайты
- **Иммиграционные форумы** - советы новичкам
- **Русские новостные сайты** - упоминания в статьях

### 📝 Прямой трафик:
- **Прямой ввод 3gis.biz** - знание бренда
- **Закладки браузера** - постоянные пользователи
- **QR коды** - оффлайн материалы
- **Word-of-mouth** - рекомендации друзей

---

## 🧪 **Тестирование SEO аналитики:**

### Локальное тестирование:
```bash
# Открыть тестовую страницу
http://localhost:3000/seo-analytics

# Проверить отслеживание с UTM параметрами
http://localhost:3000/?utm_source=google&utm_campaign=test&utm_term=русский врач
```

### Production тестирование:
```bash
# Основная страница
https://3gis.biz/

# SEO аналитика
https://3gis.biz/seo-analytics

# Тест с UTM
https://3gis.biz/?utm_source=facebook&utm_campaign=russian_community&utm_medium=social
```

---

## 📊 **Что увидите в Google Analytics:**

### Real-time отчеты:
- Текущие пользователи на сайте
- Источники трафика в реальном времени
- Активные страницы

### Acquisition отчеты:
- **Traffic acquisition** - откуда приходят пользователи
- **User acquisition** - характеристики новых пользователей
- **Campaigns** - UTM кампании

### Engagement отчеты:
- **Events** - все пользовательские действия
- **Pages and screens** - популярные страницы
- **Landing pages** - эффективность точек входа

### Custom Events:
- `landing_page_view` - с источником трафика
- `telegram_app_open` - конверсии в приложение
- `category_card_click` - интерес к категориям
- `social_media_click` - переходы в соцсети

---

## 🎯 **Рекомендуемые цели для конверсий:**

### Primary Goals:
1. **telegram_app_open** - главная цель (переход в приложение)
2. **category_card_click** - вовлечение пользователей

### Secondary Goals:
1. **social_media_click** - расширение присутствия
2. **contact_click** - прямые контакты

---

## 📈 **Готовые UTM кампании для тестирования:**

### Google Ads:
```
?utm_source=google&utm_medium=cpc&utm_campaign=russian_services&utm_term=русские врачи нью йорк
```

### Facebook:
```
?utm_source=facebook&utm_medium=social&utm_campaign=brighton_beach_community&utm_content=group_post
```

### Telegram:
```
?utm_source=telegram&utm_medium=messenger&utm_campaign=russian_channels&utm_content=channel_link
```

### Email:
```
?utm_source=newsletter&utm_medium=email&utm_campaign=weekly_digest&utm_content=header_link
```

---

## 🚀 **После деплоя отслеживается:**

✅ **Все источники трафика** автоматически  
✅ **Ключевые слова** (где доступно)  
✅ **UTM кампании** полностью  
✅ **Конверсии** в Telegram Mini App  
✅ **Поведение** на лендинге  
✅ **SEO эффективность** по целевым запросам  

**Google Analytics покажет полную картину того, откуда и как пользователи находят 3GIS!** 📊
