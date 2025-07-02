'use client';

import { useState } from 'react';
import { trackEvent, track3GISEvent, GA_MEASUREMENT_ID } from '@/components/analytics/GoogleAnalytics';

export default function AnalyticsTestPage() {
  const [status, setStatus] = useState<string>('');

  const testGA = () => {
    setStatus('Тестирование Google Analytics...');
    
    // Проверяем наличие gtag
    if (typeof window !== 'undefined') {
      console.log('GA_MEASUREMENT_ID:', GA_MEASUREMENT_ID);
      console.log('window.gtag:', window.gtag);
      console.log('window.dataLayer:', window.dataLayer);
      
      if (window.gtag) {
        // Отправляем тестовое событие
        trackEvent('test_analytics', 'test', 'Analytics Test Button Click');
        track3GISEvent.searchBusiness('Тестовый поиск', 'рестораны', 'Нью-Йорк');
        
        setStatus('✅ Google Analytics работает! События отправлены.');
      } else {
        setStatus('❌ window.gtag не найден. Google Analytics не загружен.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🧪 Тест Google Analytics</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Диагностика Google Analytics</h2>
        
        <div className="space-y-4">
          <div>
            <strong>GA Measurement ID:</strong> 
            <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
              {GA_MEASUREMENT_ID || 'Не настроен'}
            </code>
          </div>
          
          <div>
            <strong>NODE_ENV:</strong> 
            <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
              {process.env.NODE_ENV}
            </code>
          </div>
          
          <button
            onClick={testGA}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            🧪 Протестировать Google Analytics
          </button>
          
          {status && (
            <div className={`p-4 rounded ${
              status.includes('✅') ? 'bg-green-100 text-green-800' : 
              status.includes('❌') ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              {status}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">📝 Инструкции для проверки:</h3>
        <ol className="list-decimal list-inside space-y-2 text-yellow-700">
          <li>Нажмите кнопку "Протестировать Google Analytics"</li>
          <li>Откройте консоль браузера (F12)</li>
          <li>Проверьте логи: должны появиться сообщения о GA</li>
          <li>В Google Analytics через 10-15 минут должны появиться события в Real-time</li>
        </ol>
      </div>
    </div>
  );
}
