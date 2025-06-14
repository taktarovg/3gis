// src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Объединение классов Tailwind CSS с помощью clsx и tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Форматирование цены в долларах
 */
export function formatPrice(
  price: number | string,
  currency: string = '$',
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = { minimumFractionDigits: 0, maximumFractionDigits: 0 }
): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numericPrice)) {
    return '$0';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: options.minimumFractionDigits,
    maximumFractionDigits: options.maximumFractionDigits,
  })
    .format(numericPrice)
    .replace('USD', currency.replace('$', ''));
}

/**
 * Создание уникального идентификатора
 */
export function generateId(prefix: string = ''): string {
  const random = Math.random().toString(36).substring(2, 9);
  const timestamp = Date.now().toString(36);
  return `${prefix}${random}${timestamp}`;
}

/**
 * Обрезка текста до указанной длины
 */
export function truncateText(
  text: string,
  maxLength: number = 100,
  suffix: string = '...'
): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
}

/**
 * Форматирование американского телефонного номера
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Очищаем номер от всех символов, кроме цифр
  const cleaned = phone.replace(/\D/g, '');
  
  // Проверяем формат американского номера (10 или 11 цифр)
  if (cleaned.length === 10) {
    const part1 = cleaned.substring(0, 3);
    const part2 = cleaned.substring(3, 6);
    const part3 = cleaned.substring(6, 10);
    return `(${part1}) ${part2}-${part3}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const part1 = cleaned.substring(1, 4);
    const part2 = cleaned.substring(4, 7);
    const part3 = cleaned.substring(7, 11);
    return `+1 (${part1}) ${part2}-${part3}`;
  }
  
  return phone;
}

/**
 * Плюрализация английских слов
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}

/**
 * Форматирование адреса для отображения
 */
export function formatAddress(address: string, city?: string, state?: string, zipCode?: string): string {
  const parts = [address];
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (zipCode) parts.push(zipCode);
  return parts.filter(Boolean).join(', ');
}

/**
 * Форматирование рейтинга
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Форматирование рейтинга в виде звезд
 */
export function formatRatingStars(rating: number, maxRating: number = 5): string {
  if (rating < 0 || maxRating <= 0) return '';
  
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = maxRating - fullStars - halfStar;
  
  return '★'.repeat(fullStars) + (halfStar ? '☆' : '') + '☆'.repeat(emptyStars);
}

/**
 * Форматирование времени работы
 */
export function formatBusinessHours(hours: any): string {
  if (!hours || typeof hours !== 'object') return 'Часы работы не указаны';
  
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
  const today = new Date().getDay();
  const todayKey = days[today === 0 ? 6 : today - 1]; // JS воскресенье = 0, наш понедельник = 0
  
  if (hours[todayKey]) {
    return `Сегодня: ${hours[todayKey]}`;
  }
  
  return 'Часы работы не указаны';
}

/**
 * Проверка открыто ли заведение сейчас
 */
export function isBusinessOpen(hours: any): boolean {
  if (!hours || typeof hours !== 'object') return false;
  
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 100 + now.getMinutes();
  
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayKey = days[currentDay];
  
  const todayHours = hours[todayKey];
  if (!todayHours || todayHours === 'Закрыто') return false;
  
  // Парсим время вида "9:00-18:00" или "09:00-18:00"
  const match = todayHours.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
  if (!match) return false;
  
  const [, openHour, openMin, closeHour, closeMin] = match;
  const openTime = parseInt(openHour) * 100 + parseInt(openMin);
  const closeTime = parseInt(closeHour) * 100 + parseInt(closeMin);
  
  return currentTime >= openTime && currentTime <= closeTime;
}

/**
 * Расчет расстояния между двумя координатами (формула Haversine)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Радиус Земли в километрах
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Форматирование расстояния
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} м`;
  }
  return `${distance.toFixed(1)} км`;
}

/**
 * Debounce функция
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * Проверка доступности Telegram WebApp API
 */
export function isTelegramWebAppAvailable(): boolean {
  return typeof window !== 'undefined' && 
    window.Telegram !== undefined && 
    window.Telegram.WebApp !== undefined;
}

/**
 * Проверка является ли устройство iOS
 */
export function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Получение цветов из темы Telegram
 */
export function getTelegramThemeColors(): {
  bgColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  hintColor: string;
  linkColor: string;
} {
  const defaults = {
    bgColor: '#ffffff',
    textColor: '#000000',
    buttonColor: '#3390EC',
    buttonTextColor: '#ffffff',
    hintColor: '#999999',
    linkColor: '#2481cc'
  };
  
  if (!isTelegramWebAppAvailable()) return defaults;
  
  try {
    const telegram = window.Telegram!;
    const webApp = telegram.WebApp!;
    const theme = webApp.themeParams || {};
    
    return {
      bgColor: theme.bg_color || defaults.bgColor,
      textColor: theme.text_color || defaults.textColor,
      buttonColor: theme.button_color || defaults.buttonColor,
      buttonTextColor: theme.button_text_color || defaults.buttonTextColor,
      hintColor: theme.hint_color || defaults.hintColor,
      linkColor: theme.link_color || defaults.linkColor
    };
  } catch (error) {
    console.warn('Error getting Telegram theme colors:', error);
    return defaults;
  }
}

/**
 * Отправить данные в Telegram
 */
export function sendDataToTelegram(data: any): boolean {
  if (!isTelegramWebAppAvailable()) return false;
  
  try {
    const telegram = window.Telegram!;
    const webApp = telegram.WebApp!;
    
    if (typeof webApp.sendData === 'function') {
      webApp.sendData(JSON.stringify(data));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error sending data to Telegram:', error);
    return false;
  }
}

/**
 * Получение безопасных отступов для iOS
 */
export function getSafeAreaInsets(): { 
  top: string; 
  right: string; 
  bottom: string; 
  left: string; 
} {
  return {
    top: 'env(safe-area-inset-top, 0)',
    right: 'env(safe-area-inset-right, 0)',
    bottom: 'env(safe-area-inset-bottom, 0)',
    left: 'env(safe-area-inset-left, 0)',
  };
}

/**
 * Валидация американского штата
 */
export function isValidUSState(state: string): boolean {
  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];
  return usStates.includes(state.toUpperCase());
}

/**
 * Конвертация статуса бизнеса в читаемый вид
 */
export function getBusinessStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'На модерации',
    'ACTIVE': 'Активно',
    'SUSPENDED': 'Приостановлено',
    'REJECTED': 'Отклонено'
  };
  return statusMap[status] || status;
}

/**
 * Конвертация премиум-уровня в читаемый вид
 */
export function getPremiumTierText(tier: string): string {
  const tierMap: Record<string, string> = {
    'FREE': 'Бесплатно',
    'BASIC': 'Базовый',
    'STANDARD': 'Стандарт',
    'PREMIUM': 'Премиум'
  };
  return tierMap[tier] || tier;
}