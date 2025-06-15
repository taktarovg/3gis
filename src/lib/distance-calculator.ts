/**
 * Утилиты для расчета расстояний между заведениями
 * Используем формулу Haversine вместо дорогого Google Routes API
 */

export class DistanceCalculator {
  /**
   * Расчет расстояния по формуле Haversine
   * Точность: ~99.5% для расстояний до 100км
   */
  static haversineDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number {
    const R = 6371; // Радиус Земли в км
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Расстояние в км
  }

  /**
   * Быстрая сортировка заведений по расстоянию
   */
  static sortByDistance<T extends { latitude?: number; longitude?: number }>(
    businesses: T[],
    userLat: number,
    userLng: number,
    maxDistance: number = 50 // км
  ): (T & { distance: number })[] {
    return businesses
      .filter(b => b.latitude && b.longitude)
      .map(business => ({
        ...business,
        distance: this.haversineDistance(
          userLat, userLng,
          business.latitude!, business.longitude!
        )
      }))
      .filter(b => b.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Форматирование расстояния для отображения
   */
  static formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} м`;
    }
    return `${distanceKm.toFixed(1)} км`;
  }

  /**
   * Определение является ли заведение "рядом"
   */
  static isNearby(
    userLat: number, userLng: number,
    businessLat: number, businessLng: number,
    radiusKm: number = 5
  ): boolean {
    const distance = this.haversineDistance(userLat, userLng, businessLat, businessLng);
    return distance <= radiusKm;
  }

  /**
   * Группировка заведений по расстоянию
   */
  static groupByDistanceRanges<T extends { latitude?: number; longitude?: number }>(
    businesses: T[],
    userLat: number,
    userLng: number
  ): {
    nearby: (T & { distance: number })[];     // < 2км
    close: (T & { distance: number })[];      // 2-10км  
    far: (T & { distance: number })[];        // > 10км
  } {
    const withDistance = this.sortByDistance(businesses, userLat, userLng, 100);
    
    return {
      nearby: withDistance.filter(b => b.distance < 2),
      close: withDistance.filter(b => b.distance >= 2 && b.distance <= 10),
      far: withDistance.filter(b => b.distance > 10)
    };
  }

  /**
   * Поиск ближайшего заведения
   */
  static findNearest<T extends { latitude?: number; longitude?: number }>(
    businesses: T[],
    userLat: number,
    userLng: number
  ): (T & { distance: number }) | null {
    const sorted = this.sortByDistance(businesses, userLat, userLng, 100);
    return sorted.length > 0 ? sorted[0] : null;
  }

  /**
   * Расчет времени в пути пешком (приблизительно)
   * Средняя скорость: 5 км/ч
   */
  static estimateWalkingTime(distanceKm: number): string {
    const hours = distanceKm / 5; // 5 км/ч средняя скорость ходьбы
    const minutes = Math.round(hours * 60);
    
    if (minutes < 5) return '< 5 мин пешком';
    if (minutes < 60) return `${minutes} мин пешком`;
    
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}ч ${m}мин пешком`;
  }

  /**
   * Расчет времени в пути на машине (приблизительно)
   * Средняя скорость в городе: 30 км/ч
   */
  static estimateDrivingTime(distanceKm: number): string {
    const hours = distanceKm / 30; // 30 км/ч средняя скорость в городе
    const minutes = Math.round(hours * 60);
    
    if (minutes < 5) return '< 5 мин на машине';
    if (minutes < 60) return `${minutes} мин на машине`;
    
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}ч ${m}мин на машине`;
  }
}

/**
 * Константы для расстояний
 */
export const DISTANCE_RANGES = {
  VERY_CLOSE: 0.5,  // 500м
  NEARBY: 2,        // 2км - пешая доступность
  CLOSE: 10,        // 10км - близко на машине
  FAR: 50,          // 50км - максимум для поиска
} as const;

/**
 * Типы для работы с расстояниями
 */
export type BusinessWithDistance<T = any> = T & {
  distance: number;
  formattedDistance?: string;
  walkingTime?: string;
  drivingTime?: string;
};

/**
 * Хук для обогащения заведений информацией о расстоянии
 */
export function enrichWithDistanceInfo<T extends { latitude?: number; longitude?: number }>(
  businesses: T[],
  userLat: number,
  userLng: number
): BusinessWithDistance<T>[] {
  return DistanceCalculator.sortByDistance(businesses, userLat, userLng, DISTANCE_RANGES.FAR)
    .map(business => ({
      ...business,
      formattedDistance: DistanceCalculator.formatDistance(business.distance),
      walkingTime: DistanceCalculator.estimateWalkingTime(business.distance),
      drivingTime: DistanceCalculator.estimateDrivingTime(business.distance),
    }));
}
