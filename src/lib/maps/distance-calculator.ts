/**
 * Оптимизированный расчет расстояний без использования дорогих Google API
 * Основа: Haversine формула для точного расчета расстояний
 */

export class DistanceCalculator {
  /**
   * Расчет расстояния между двумя точками в км (Haversine формула)
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
    return R * c;
  }

  /**
   * Быстрая сортировка заведений по расстоянию от пользователя
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
   * Форматирование расстояния для UI
   */
  static formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} м`;
    }
    return `${distanceKm.toFixed(1)} км`;
  }

  /**
   * Фильтрация заведений в радиусе
   */
  static filterByRadius<T extends { latitude?: number; longitude?: number }>(
    businesses: T[],
    centerLat: number,
    centerLng: number,
    radiusKm: number
  ): T[] {
    return businesses.filter(business => {
      if (!business.latitude || !business.longitude) return false;
      
      const distance = this.haversineDistance(
        centerLat, centerLng,
        business.latitude, business.longitude
      );
      
      return distance <= radiusKm;
    });
  }

  /**
   * Получение координат центра для массива точек
   */
  static getCenterPoint(points: Array<{ latitude: number; longitude: number }>): {
    lat: number;
    lng: number;
  } {
    if (points.length === 0) {
      return { lat: 40.7128, lng: -74.0060 }; // Нью-Йорк по умолчанию
    }

    if (points.length === 1) {
      return { lat: points[0].latitude, lng: points[0].longitude };
    }

    const sumLat = points.reduce((sum, point) => sum + point.latitude, 0);
    const sumLng = points.reduce((sum, point) => sum + point.longitude, 0);

    return {
      lat: sumLat / points.length,
      lng: sumLng / points.length
    };
  }

  /**
   * Определение оптимального zoom уровня для карты
   */
  static calculateZoom(points: Array<{ latitude: number; longitude: number }>): number {
    if (points.length === 0) return 13;
    if (points.length === 1) return 15;

    const latitudes = points.map(p => p.latitude);
    const longitudes = points.map(p => p.longitude);

    const maxLat = Math.max(...latitudes);
    const minLat = Math.min(...latitudes);
    const maxLng = Math.max(...longitudes);
    const minLng = Math.min(...longitudes);

    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    // Примерный расчет zoom уровня
    if (maxDiff > 5) return 8;
    if (maxDiff > 2) return 10;
    if (maxDiff > 1) return 11;
    if (maxDiff > 0.5) return 12;
    if (maxDiff > 0.1) return 13;
    if (maxDiff > 0.05) return 14;
    return 15;
  }
}
