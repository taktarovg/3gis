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
 * Component for performance debugging
 * Shows render count, frequency and component stability
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

  // Increment render counter on each render
  renderCount.current += 1;
  const currentTime = Date.now();
  renderTimes.current.push(currentTime);

  useEffect(() => {
    const renderTime = Date.now() - currentTime;
    
    // Calculate metrics
    const recentRenders = renderTimes.current.slice(-10); // Last 10 renders
    const totalTime = currentTime - startTime.current;
    const frequency = renderCount.current / (totalTime / 1000); // renders per second
    
    // Determine stability (more than 5 renders per second is unstable)
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

    // Log to console for analysis
    console.log(`🎯 [PERF] ${componentName}: render #${renderCount.current}, freq: ${frequency.toFixed(1)}/sec, stable: ${isStable}`);

    // Warning about instability
    if (!isStable && renderCount.current > 10) {
      console.warn(`⚠️ [PERF] ${componentName}: High render frequency detected! ${frequency.toFixed(1)} renders/sec`);
    }
  }, [componentName, currentTime]);

  // Show only in dev mode or if explicitly allowed
  if (!showInProduction && process.env.NODE_ENV === 'production') {
    return null;
  }

  const getStatusColor = () => {
    if (!metrics.isStable) return 'destructive';
    if (metrics.renderFrequency > 2) return 'secondary';
    return 'default';
  };

  const getStatusText = () => {
    if (!metrics.isStable) return 'Unstable';
    if (metrics.renderFrequency > 2) return 'Frequent';
    return 'Stable';
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
          <span>Renders:</span>
          <span className="font-mono">{metrics.renderCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Frequency:</span>
          <span className="font-mono">{metrics.renderFrequency.toFixed(1)}/sec</span>
        </div>
        <div className="flex justify-between">
          <span>Last:</span>
          <span className="font-mono">{metrics.lastRenderTime}ms</span>
        </div>
      </div>

      {!metrics.isStable && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
          <div className="text-xs font-semibold">🚨 Performance Issue!</div>
          <div className="text-xs">Too frequent re-renders</div>
        </div>
      )}
    </div>
  );
}

/**
 * HOC for quick performance debugging addition
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