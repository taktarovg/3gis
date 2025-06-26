'use client';

import { useTrafficTracking } from '@/hooks/use-traffic-tracking';

/**
 * Компонент для автоматического отслеживания источников трафика
 * Невидимый компонент, который анализирует UTM параметры и referrer
 */
export function TrafficTracker() {
  // Автоматически отслеживаем источник трафика при загрузке страницы
  useTrafficTracking();
  
  // Компонент невидимый, только для логики
  return null;
}
