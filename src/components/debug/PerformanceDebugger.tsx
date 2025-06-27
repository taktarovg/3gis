'use client';

import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  renderFrequency: number;
  avgRenderTime: number;
  isStable: boolean;
}

/**
 * ✅ Компонент для отладки производительности
 * Показывает количество рендеров, частоту и стабильность компонента
 */
export function PerformanceDebugger({ 
  componentName = 'Component',
  showInProduction = false 
}: { 
  componentName?: string;
  showInProduction?: boolean;
}) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const startTime = useRef(Date.now());
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    renderFrequency: 0,
    avgRenderTime: 0,
    isStable: true
  });

  // Увеличиваем счетчик рендеров при каждом рендере
  renderCount.current += 1;
  const currentTime = Date.now();
  renderTimes.current.push(currentTime);

  useEffect(() => {
    const renderTime = Date.now() - currentTime;
    
    // Вычисляем метрики
    const recentRenders = renderTimes.current.slice(-10); // Последние 10 рендеров
    const totalTime = currentTime - startTime.current;
    const frequency = renderCount.current / (totalTime / 1000); // рендеров в секунду
    
    // Определяем стабильность (если больше 5 рендеров в секунду - нестабильно)
    const isStable = frequency < 5;
    
    setMetrics({
      renderCount: renderCount.current,
      lastRenderTime: renderTime,
      renderFrequency: frequency,
      avgRenderTime: recentRenders.length > 1 
        ? (recentRenders[recentRenders.length - 1] - recentRenders[0]) / recentRenders.length
        : renderTime,
      isStable
    });

    // Логируем в консоль для анализа
    console.log(`🎯 [PERF] ${componentName}: render #${renderCount.current}, freq: ${frequency.toFixed(1)}/sec, stable: ${isStable}`);

    // Предупреждение о нестабильности
    if (!isStable && renderCount.current > 10) {
      console.warn(`⚠️ [PERF] ${componentName}: High render frequency detected! ${frequency.toFixed(1)} renders/sec`);
    }
  }, [componentName, currentTime]);

  // Показывать только в dev режиме или если явно разрешено
  if (!showInProduction && process.env.NODE_ENV === 'production') {
    return null;
  }

  const getStatusColor = () => {
    if (!metrics.isStable) return 'destructive';
    if (metrics.renderFrequency > 2) return 'secondary'; // warning нет в Badge
    return 'default'; // success нет в Badge
  };

  const getStatusText = () => {
    if (!metrics.isStable) return 'Нестабильно';
    if (metrics.renderFrequency > 2) return 'Частые рендеры';
    return 'Стабильно';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 text-xs shadow-lg z-50 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-700">{componentName}</span>
        <Badge variant={getStatusColor() as any} className="text-xs">
          {getStatusText()}
        </Badge>
      </div>
      
      <div className="space-y-1 text-gray-600">
        <div className="flex justify-between">
          <span>Рендеры:</span>
          <span className="font-mono">{metrics.renderCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Частота:</span>
          <span className="font-mono">{metrics.renderFrequency.toFixed(1)}/сек</span>
        </div>
        <div className="flex justify-between">
          <span>Последний:</span>
          <span className="font-mono">{metrics.lastRenderTime}мс</span>
        </div>
      </div>

      {!metrics.isStable && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
          <div className="text-xs font-semibold">🚨 Проблема производительности!</div>
          <div className="text-xs">Слишком частые перерендеры</div>
        </div>
      )}
    </div>
  );
}

/**
 * ✅ HOC для быстрого добавления отладки производительности
 */
export function withPerformanceDebug<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    return (
      <>
        <PerformanceDebugger componentName={componentName || Component.displayName || Component.name} />
        <Component {...props} />
      </>
    );
  };

  WrappedComponent.displayName = `withPerformanceDebug(${componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
}