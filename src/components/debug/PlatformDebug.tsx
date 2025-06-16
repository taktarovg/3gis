'use client';

import { usePlatformDetection } from '@/hooks/use-platform-detection';

interface PlatformDebugProps {
  className?: string;
}

/**
 * Компонент для отладки - показывает информацию о платформе
 * Удалить после тестирования
 */
export function PlatformDebug({ className = '' }: PlatformDebugProps) {
  const platform = usePlatformDetection();

  // Показываем только в development или при добавлении ?debug=true
  const shouldShow = process.env.NODE_ENV === 'development' || 
    (typeof window !== 'undefined' && window.location.search.includes('debug=true'));

  if (!shouldShow) return null;

  return (
    <div className={`fixed bottom-4 left-4 bg-black/80 text-white text-xs p-3 rounded-lg z-50 max-w-xs ${className}`}>
      <div className="font-bold mb-2">Platform Debug:</div>
      <div>Platform: {platform.platform}</div>
      <div>Telegram: {platform.isTelegram ? 'YES' : 'NO'}</div>
      <div>Mobile: {platform.isMobile ? 'YES' : 'NO'}</div>
      <div>Can Call: {platform.canMakeCall ? 'YES' : 'NO'}</div>
      <div>Can Maps: {platform.canOpenMaps ? 'YES' : 'NO'}</div>
      <div className="mt-2 text-xs opacity-70">
        UA: {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 30) + '...' : 'N/A'}
      </div>
    </div>
  );
}

/**
 * Кнопка для тестирования функций платформы
 */
export function PlatformTestButtons() {
  const platform = usePlatformDetection();

  const shouldShow = process.env.NODE_ENV === 'development' || 
    (typeof window !== 'undefined' && window.location.search.includes('debug=true'));

  if (!shouldShow) return null;

  const testCall = () => {
    if (platform.canMakeCall) {
      window.open('tel:+1234567890', '_self');
    } else {
      alert('Calling not supported on this platform');
    }
  };

  const testMaps = () => {
    if (platform.canOpenMaps) {
      window.open('https://maps.google.com/?q=New+York', '_blank');
    } else {
      alert('Maps opening not optimized for this platform');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      <button 
        onClick={testCall}
        className="bg-green-500 text-white px-3 py-2 rounded text-xs"
      >
        Test Call
      </button>
      <button 
        onClick={testMaps}
        className="bg-blue-500 text-white px-3 py-2 rounded text-xs"
      >
        Test Maps
      </button>
    </div>
  );
}
