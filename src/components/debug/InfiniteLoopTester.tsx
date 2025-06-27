'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

/**
 * ✅ Компонент для тестирования устранения бесконечного цикла рендеров
 * Показывает статистику рендеров useChats хука и ClientProvider
 */
export function InfiniteLoopTester() {
  const [isActive, setIsActive] = useState(false);
  const [testResults, setTestResults] = useState<{
    status: 'idle' | 'testing' | 'passed' | 'failed';
    renderCount: number;
    duration: number;
    message: string;
  }>({ status: 'idle', renderCount: 0, duration: 0, message: '' });
  
  const testStartTime = useRef<number>(0);
  const renderCounter = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTest = () => {
    console.log('🧪 [TEST] Starting infinite loop prevention test...');
    
    setIsActive(true);
    setTestResults({ status: 'testing', renderCount: 0, duration: 0, message: 'Тестирование...' });
    testStartTime.current = Date.now();
    renderCounter.current = 0;
    
    // Считаем рендеры в консоли
    const originalLog = console.log;
    let renderCount = 0;
    
    // Перехватываем логи для подсчета рендеров
    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('[HOOK-') && message.includes('useChats: Effect triggered')) {
        renderCount++;
        console.log(`🎯 [TEST] Detected hook render #${renderCount}`);
      }
      originalLog.apply(console, args);
    };
    
    // Тест длится 10 секунд
    intervalRef.current = setInterval(() => {
      const duration = Date.now() - testStartTime.current;
      
      setTestResults(prev => ({
        ...prev,
        renderCount,
        duration: Math.round(duration / 1000),
      }));
      
      // Завершаем тест через 10 секунд
      if (duration >= 10000) {
        clearInterval(intervalRef.current!);
        console.log = originalLog; // Восстанавливаем console.log
        
        // Оцениваем результаты
        const finalStatus = renderCount > 20 ? 'failed' : 'passed';
        const message = finalStatus === 'passed' 
          ? `✅ Тест пройден! ${renderCount} рендеров за 10 сек` 
          : `❌ Тест провален! ${renderCount} рендеров за 10 сек (норма ≤20)`;
        
        setTestResults({
          status: finalStatus,
          renderCount,
          duration: 10,
          message
        });
        
        setIsActive(false);
        console.log(`🧪 [TEST] Test completed: ${message}`);
      }
    }, 100);
  };
  
  const stopTest = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsActive(false);
    setTestResults({ status: 'idle', renderCount: 0, duration: 0, message: '' });
  };
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  const getStatusIcon = () => {
    switch (testResults.status) {
      case 'testing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };
  
  const getStatusBadge = () => {
    switch (testResults.status) {
      case 'testing': return <Badge variant="secondary">Тестирование...</Badge>;
      case 'passed': return <Badge variant="default" className="bg-green-500">Пройден</Badge>;
      case 'failed': return <Badge variant="destructive">Провален</Badge>;
      default: return <Badge variant="outline">Готов к тесту</Badge>;
    }
  };
  
  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-50 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-semibold text-gray-800">Тест производительности</span>
        </div>
        {getStatusBadge()}
      </div>
      
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Рендеры хука:</span>
          <span className="font-mono font-semibold">{testResults.renderCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Длительность:</span>
          <span className="font-mono">{testResults.duration} сек</span>
        </div>
        {testResults.renderCount > 0 && (
          <div className="flex justify-between">
            <span>Частота:</span>
            <span className="font-mono">
              {testResults.duration > 0 ? (testResults.renderCount / testResults.duration).toFixed(1) : '0'} рендеров/сек
            </span>
          </div>
        )}
      </div>
      
      {testResults.message && (
        <div className={`p-2 rounded text-xs mb-3 ${
          testResults.status === 'passed' ? 'bg-green-50 text-green-700 border border-green-200' :
          testResults.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {testResults.message}
        </div>
      )}
      
      <div className="flex gap-2">
        <Button 
          onClick={startTest} 
          disabled={isActive}
          size="sm"
          className="flex-1"
        >
          {isActive ? 'Тестирование...' : 'Запустить тест'}
        </Button>
        
        {isActive && (
          <Button 
            onClick={stopTest} 
            variant="outline"
            size="sm"
          >
            Остановить
          </Button>
        )}
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        <div className="font-semibold mb-1">Критерии теста:</div>
        <div>• ≤20 рендеров за 10 сек = ✅ Норма</div>
        <div>• >20 рендеров за 10 сек = ❌ Бесконечный цикл</div>
      </div>
    </div>
  );
}