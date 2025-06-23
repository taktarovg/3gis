// Премиум планы для 3GIS Telegram Stars
export const PREMIUM_PLANS = {
  basic: {
    starsAmount: 500,      // ~$5 USD
    dollarPrice: 49,       // Основная цена в долларах
    name: 'Базовый',
    nameEn: 'Basic',
    duration: 30,          // дней
    features: [
      'Верификация заведения',
      'До 10 фотографий',
      'Ответы на отзывы',
      'Базовая статистика просмотров'
    ]
  },
  standard: {
    starsAmount: 1500,     // ~$15 USD
    dollarPrice: 149,
    name: 'Стандарт', 
    nameEn: 'Standard',
    duration: 30,
    features: [
      'Приоритет в результатах поиска (топ-3)',
      'До 25 фотографий',
      'Детальная аналитика',
      'Промо-посты в ленте',
      'Интеграция с соцсетями'
    ]
  },
  premium: {
    starsAmount: 3000,     // ~$30 USD
    dollarPrice: 299,
    name: 'Премиум',
    nameEn: 'Premium', 
    duration: 30,
    features: [
      'Гарантированная позиция #1 в категории',
      'Неограниченное количество фото',
      'Рекламные блоки в поиске',
      'Персональный менеджер',
      'Брендированный дизайн карточки'
    ]
  }
} as const;

export type PremiumPlan = keyof typeof PREMIUM_PLANS;

// Опции донатов для пользователей
export const DONATION_OPTIONS = {
  coffee: {
    starsAmount: 100,     // ~$1 USD
    name: 'Кофе разработчику',
    nameEn: 'Buy me a coffee',
    icon: '☕',
    description: 'Поддержите разработку 3GIS'
  },
  lunch: {
    starsAmount: 500,     // ~$5 USD  
    name: 'Обед команде',
    nameEn: 'Buy team lunch',
    icon: '🍽️',
    description: 'Помогите команде развивать проект'
  },
  support: {
    starsAmount: 1000,    // ~$10 USD
    name: 'Большая поддержка',
    nameEn: 'Big support',
    icon: '🚀',
    description: 'Ускорьте развитие новых функций'
  },
  custom: {
    starsAmount: null,    // Пользователь вводит сам
    name: 'Своя сумма',
    nameEn: 'Custom amount',
    icon: '⭐',
    description: 'Введите желаемую сумму Stars'
  }
} as const;

export type DonationType = keyof typeof DONATION_OPTIONS;
