# 📊 План реализации аналитики в админке 3GIS

## 🎯 Цели проекта

### Основная задача
Создать собственную систему аналитики в админ-панели 3GIS для отслеживания ключевых метрик без зависимости от Google Analytics.

### Ключевые метрики для отслеживания
- **Трафик**: количество посещений, уникальные пользователи
- **Источники**: откуда приходят пользователи (referrer, UTM, социальные сети)
- **Популярный контент**: топ заведений и чатов по просмотрам
- **Конверсии**: от просмотра до действия (звонок, переход на сайт)
- **География**: распределение по городам и штатам
- **Устройства**: мобильные vs десктоп, Telegram vs веб

---

## 📋 Этапы реализации

### **ЭТАП 1: Расширение схемы БД (2-3 дня)**

#### 1.1 Новые таблицы аналитики
```sql
-- Сессии пользователей
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 1,
  is_telegram BOOLEAN DEFAULT FALSE,
  user_agent TEXT,
  ip_address VARCHAR(45),
  country VARCHAR(3),
  city VARCHAR(100),
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Детальные события (pageviews, clicks, actions)
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) REFERENCES user_sessions(session_id),
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'click', 'action'
  page_path VARCHAR(500),
  element_type VARCHAR(100), -- 'business_card', 'phone_button', 'category'
  element_id INTEGER, -- ID заведения, чата, категории
  metadata JSONB, -- дополнительные данные
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Агрегированная статистика по дням
CREATE TABLE daily_stats (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  avg_session_duration FLOAT DEFAULT 0,
  bounce_rate FLOAT DEFAULT 0,
  telegram_sessions INTEGER DEFAULT 0,
  mobile_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date)
);
```

#### 1.2 Расширение существующих таблиц
```sql
-- Добавляем метрики к заведениям
ALTER TABLE businesses ADD COLUMN total_views INTEGER DEFAULT 0;
ALTER TABLE businesses ADD COLUMN total_clicks INTEGER DEFAULT 0;
ALTER TABLE businesses ADD COLUMN phone_clicks INTEGER DEFAULT 0;
ALTER TABLE businesses ADD COLUMN website_clicks INTEGER DEFAULT 0;
ALTER TABLE businesses ADD COLUMN last_viewed_at TIMESTAMP;

-- Добавляем метрики к чатам
ALTER TABLE telegram_chats ADD COLUMN total_views INTEGER DEFAULT 0;
ALTER TABLE telegram_chats ADD COLUMN total_clicks INTEGER DEFAULT 0;
ALTER TABLE telegram_chats ADD COLUMN last_viewed_at TIMESTAMP;
```

---

### **ЭТАП 2: Система сбора данных (3-4 дня)**

#### 2.1 Клиентский трекер
```typescript
// src/lib/analytics/tracker.ts
class AnalyticsTracker {
  private sessionId: string;
  private isInitialized: boolean = false;

  async init() {
    this.sessionId = this.getOrCreateSessionId();
    await this.startSession();
    this.setupEventListeners();
    this.isInitialized = true;
  }

  // Отслеживание просмотров страниц
  async trackPageView(path: string, metadata?: Record<string, any>) {
    if (!this.isInitialized) return;
    
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        eventType: 'page_view',
        pagePath: path,
        metadata,
        timestamp: new Date().toISOString()
      })
    });
  }

  // Отслеживание кликов
  async trackClick(elementType: string, elementId?: number, metadata?: Record<string, any>) {
    // Аналогично trackPageView
  }

  // Автоматическое отслеживание
  private setupEventListeners() {
    // Клики по телефонам
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-track="phone"]')) {
        const businessId = target.getAttribute('data-business-id');
        this.trackClick('phone_click', Number(businessId));
      }
    });

    // Отслеживание времени на странице
    this.startTimeTracking();
  }
}
```

#### 2.2 API endpoints для сбора данных
```typescript
// src/app/api/analytics/track/route.ts
export async function POST(request: NextRequest) {
  const data = await request.json();
  
  // Валидация и очистка данных
  const event = validateAnalyticsEvent(data);
  
  // Сохранение в БД
  await prisma.analyticsEvents.create({
    data: {
      sessionId: event.sessionId,
      eventType: event.eventType,
      pagePath: event.pagePath,
      elementType: event.elementType,
      elementId: event.elementId,
      metadata: event.metadata
    }
  });

  // Обновление счетчиков в реальном времени
  if (event.elementType === 'business_view') {
    await prisma.businesses.update({
      where: { id: event.elementId },
      data: { 
        totalViews: { increment: 1 },
        lastViewedAt: new Date()
      }
    });
  }

  return NextResponse.json({ success: true });
}
```

#### 2.3 Интеграция в компоненты
```typescript
// src/components/businesses/BusinessCard.tsx
export function BusinessCard({ business }: { business: Business }) {
  const { trackClick, trackView } = useAnalytics();

  useEffect(() => {
    trackView('business_card', business.id);
  }, [business.id]);

  return (
    <div className="business-card">
      <h3>{business.name}</h3>
      <button
        data-track="phone"
        data-business-id={business.id}
        onClick={() => trackClick('phone_click', business.id)}
      >
        📞 Позвонить
      </button>
    </div>
  );
}
```

---

### **ЭТАП 3: Админ-панель с дашбордом (4-5 дней)**

#### 3.1 Главный дашборд
```typescript
// src/app/admin/analytics/page.tsx
export default function AnalyticsDashboard() {
  return (
    <div className="analytics-dashboard">
      {/* Основные метрики */}
      <MetricsOverview />
      
      {/* Графики трафика */}
      <TrafficCharts />
      
      {/* Топ контента */}
      <TopContent />
      
      {/* Источники трафика */}
      <TrafficSources />
      
      {/* Реальное время */}
      <RealTimeActivity />
    </div>
  );
}
```

#### 3.2 Компоненты дашборда
```typescript
// Обзор ключевых метрик
function MetricsOverview() {
  const metrics = useQuery(['analytics', 'overview'], fetchOverview);
  
  return (
    <div className="grid grid-cols-4 gap-6">
      <MetricCard 
        title="Сессии сегодня" 
        value={metrics.todaySessions}
        change={metrics.sessionsChange}
      />
      <MetricCard 
        title="Уникальные пользователи" 
        value={metrics.uniqueUsers}
        change={metrics.usersChange}
      />
      <MetricCard 
        title="Просмотры страниц" 
        value={metrics.pageViews}
        change={metrics.viewsChange}
      />
      <MetricCard 
        title="Среднее время сессии" 
        value={formatDuration(metrics.avgDuration)}
        change={metrics.durationChange}
      />
    </div>
  );
}

// График посещений
function TrafficCharts() {
  return (
    <div className="bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Трафик за последние 30 дней</h3>
      <LineChart data={trafficData} />
    </div>
  );
}
```

#### 3.3 API для админ-панели
```typescript
// src/app/api/admin/analytics/overview/route.ts
export async function GET() {
  const today = new Date();
  const yesterday = subDays(today, 1);
  
  // Получаем статистику за сегодня и вчера для сравнения
  const [todayStats, yesterdayStats] = await Promise.all([
    getDailyStats(today),
    getDailyStats(yesterday)
  ]);

  return NextResponse.json({
    todaySessions: todayStats.totalSessions,
    sessionsChange: calculateChange(todayStats.totalSessions, yesterdayStats.totalSessions),
    uniqueUsers: todayStats.uniqueUsers,
    usersChange: calculateChange(todayStats.uniqueUsers, yesterdayStats.uniqueUsers),
    // ... другие метрики
  });
}
```

---

### **ЭТАП 4: Расширенная аналитика (3-4 дня)**

#### 4.1 Воронка конверсий
```typescript
// Анализ пути пользователя: просмотр → клик → действие
function ConversionFunnel() {
  const funnelData = [
    { step: 'Просмотр главной', users: 1000, rate: 100 },
    { step: 'Просмотр категории', users: 650, rate: 65 },
    { step: 'Просмотр заведения', users: 420, rate: 42 },
    { step: 'Клик по телефону', users: 180, rate: 18 },
    { step: 'Переход на сайт', users: 95, rate: 9.5 }
  ];

  return <FunnelChart data={funnelData} />;
}
```

#### 4.2 Географическая аналитика
```typescript
// Карта активности по штатам
function GeographicAnalytics() {
  const geoData = useQuery(['analytics', 'geography'], fetchGeoData);
  
  return (
    <div className="geographic-analytics">
      <USAMap data={geoData.stateStats} />
      <CityRanking cities={geoData.topCities} />
    </div>
  );
}
```

#### 4.3 Сегментация пользователей
```typescript
// Анализ поведения разных групп пользователей
function UserSegmentation() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <SegmentCard 
        title="Telegram пользователи"
        metrics={telegramSegment}
      />
      <SegmentCard 
        title="Веб пользователи"
        metrics={webSegment}
      />
    </div>
  );
}
```

---

### **ЭТАП 5: Оптимизация и автоматизация (2-3 дня)**

#### 5.1 Батчевая обработка данных
```typescript
// Ежедневная агрегация статистики (cron job)
async function aggregateDailyStats() {
  const yesterday = subDays(new Date(), 1);
  
  const stats = await prisma.analyticsEvents.groupBy({
    by: ['session_id'],
    where: {
      timestamp: {
        gte: startOfDay(yesterday),
        lt: endOfDay(yesterday)
      }
    },
    _count: { session_id: true }
  });

  await prisma.dailyStats.upsert({
    where: { date: yesterday },
    update: { /* агрегированные данные */ },
    create: { /* агрегированные данные */ }
  });
}
```

#### 5.2 Кэширование и производительность
```typescript
// Redis кэш для частых запросов
const CACHE_KEYS = {
  dailyOverview: 'analytics:daily:overview',
  topBusinesses: 'analytics:top:businesses',
  trafficSources: 'analytics:traffic:sources'
};

// Кэширование с TTL
async function getCachedAnalytics(key: string, fetcher: Function, ttl: number = 300) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}
```

#### 5.3 Алерты и уведомления
```typescript
// Автоматические уведомления о важных событиях
async function checkAnalyticsAlerts() {
  const todayTraffic = await getTodayTraffic();
  const avgTraffic = await getAverageTraffic();
  
  if (todayTraffic < avgTraffic * 0.5) {
    await sendAlert({
      type: 'traffic_drop',
      message: 'Трафик упал на 50% от среднего значения',
      severity: 'high'
    });
  }
}
```

---

## 🛠️ Технический стек

### Frontend
- **Charts**: Recharts или Chart.js для графиков
- **Maps**: Leaflet или Google Maps для географии
- **State**: React Query + Zustand
- **UI**: shadcn/ui компоненты

### Backend
- **Database**: PostgreSQL с индексами для аналитики
- **Cache**: Redis для кэширования
- **Queue**: Bull Queue для обработки событий
- **Cron**: node-cron для агрегации данных

### Monitoring
- **Performance**: мониторинг времени ответа API
- **Errors**: логирование ошибок трекинга
- **Alerts**: уведомления о критических метриках

---

## 📊 Ключевые метрики и отчеты

### Dashboard Overview
- **Сессии**: сегодня vs вчера, недельная динамика
- **Пользователи**: новые vs возвращающиеся
- **Страницы**: топ просматриваемых, время на странице
- **Конверсии**: от просмотра к действию

### Traffic Sources
- **Referrers**: откуда приходят пользователи
- **UTM кампании**: эффективность маркетинга
- **Social Media**: трафик из социальных сетей
- **Direct**: прямые заходы

### Content Analytics
- **Топ заведений**: по просмотрам и кликам
- **Популярные категории**: рестораны, врачи, etc.
- **Чаты**: самые активные сообщества
- **Search**: популярные поисковые запросы

### User Behavior
- **Device Types**: мобильные vs десктоп
- **Platforms**: Telegram vs веб
- **Geography**: города, штаты, распределение
- **Session Duration**: время активности

---

## 🎯 Timeline реализации

### Неделя 1 (Этап 1-2)
- **Дни 1-2**: Расширение схемы БД, миграции
- **Дни 3-5**: Система сбора данных, API endpoints
- **Дни 6-7**: Интеграция трекинга в компоненты

### Неделя 2 (Этап 3)
- **Дни 1-3**: Основные компоненты админ-панели
- **Дни 4-5**: Дашборд с графиками и метриками
- **Дни 6-7**: API для аналитики, тестирование

### Неделя 3 (Этап 4-5)
- **Дни 1-2**: Расширенная аналитика (воронки, география)
- **Дни 3-4**: Оптимизация, кэширование
- **Дни 5-7**: Автоматизация, алерты, финальное тестирование

---

## ✅ Результат

### Что получим:
- 📊 **Полноценная аналитика** без зависимости от Google Analytics
- 🎯 **Telegram-специфичные метрики** недоступные в GA
- 🚀 **Real-time данные** для быстрых решений
- 💰 **Конверсионная аналитика** для монетизации
- 🌍 **Географические инсайты** для развития
- 📱 **Мобильная оптимизация** отчетов

### Преимущества:
- **Privacy-first**: никаких внешних трекеров
- **Customization**: метрики специально для 3GIS
- **Performance**: быстрые запросы благодаря оптимизации
- **Integration**: связь с бизнес-логикой приложения
- **Cost-effective**: никаких лимитов внешних сервисов

**Готовы начать реализацию! 🚀**