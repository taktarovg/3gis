// lib/telegram-stars/plans.ts
export type PremiumPlan = 'basic' | 'standard' | 'premium';
export type DonationType = 'coffee' | 'lunch' | 'support' | 'custom';

export interface PlanConfig {
  starsAmount: number;
  dollarPrice: number;
  name: string;
  nameEn: string;
  duration: number; // дней
  features: string[];
}

export interface DonationConfig {
  starsAmount: number | null;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
}

export const PREMIUM_PLANS: Record<PremiumPlan, PlanConfig> = {
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
};

export const DONATION_OPTIONS: Record<DonationType, DonationConfig> = {
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
};

/**
 * Получение конфигурации плана по типу
 */
export function getPlanConfig(plan: PremiumPlan): PlanConfig {
  return PREMIUM_PLANS[plan];
}

/**
 * Получение конфигурации доната по типу
 */
export function getDonationConfig(type: DonationType): DonationConfig {
  return DONATION_OPTIONS[type];
}

/**
 * Валидация суммы Stars
 */
export function validateStarsAmount(amount: number): boolean {
  return amount >= 1 && amount <= 10000 && Number.isInteger(amount);
}

/**
 * Конвертация Stars в доллары (приблизительно)
 */
export function starsToUsd(stars: number): number {
  return stars * 0.01;
}

/**
 * Конвертация долларов в Stars (приблизительно)
 */
export function usdToStars(usd: number): number {
  return Math.round(usd * 100);
}
