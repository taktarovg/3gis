'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

/**
 * Component for testing infinite render loop prevention
 * Shows render statistics for useChats hook and ClientProvider
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
    setTestResults({ status: 'testing', renderCount: 0, duration: 0, message: 'Testing...' });
    testStartTime.current = Date.now();
    renderCounter.current = 0;
    
    // Count renders in console
    const originalLog = console.log;
    let renderCount = 0;
    
    // Intercept logs to count renders
    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('[HOOK-') && message.includes('useChats: Effect triggered')) {
        renderCount++;
        console.log(`🎯 [TEST] Detected hook render #${renderCount}`);
      }
      originalLog.apply(console, args);
    };
    
    // Test runs for 10 seconds
    intervalRef.current = setInterval(() => {
      const duration = Date.now() - testStartTime.current;
      
      setTestResults(prev => ({
        ...prev,
        renderCount,
        duration: Math.round(duration / 1000),
      }));
      
      // Complete test after 10 seconds
      if (duration >= 10000) {
        clearInterval(intervalRef.current!);
        console.log = originalLog; // Restore console.log
        
        // Evaluate results
        const finalStatus = renderCount > 20 ? 'failed' : 'passed';
        const message = finalStatus === 'passed' 
          ? `✅ Test passed! ${renderCount} renders in 10 sec` 
          : `❌ Test failed! ${renderCount} renders in 10 sec (norm ≤20)`;
        
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
      case 'testing': return <Badge variant="secondary">Testing...</Badge>;
      case 'passed': return <Badge variant="default" className="bg-green-500">Passed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="outline">Ready</Badge>;
    }
  };
  
  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-50 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-semibold text-gray-800">Performance Test</span>
        </div>
        {getStatusBadge()}
      </div>
      
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Hook renders:</span>
          <span className="font-mono font-semibold">{testResults.renderCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Duration:</span>
          <span className="font-mono">{testResults.duration} sec</span>
        </div>
        {testResults.renderCount > 0 && (
          <div className="flex justify-between">
            <span>Frequency:</span>
            <span className="font-mono">
              {testResults.duration > 0 ? (testResults.renderCount / testResults.duration).toFixed(1) : '0'} renders/sec
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
          {isActive ? 'Testing...' : 'Start Test'}
        </Button>
        
        {isActive && (
          <Button 
            onClick={stopTest} 
            variant="outline"
            size="sm"
          >
            Stop
          </Button>
        )}
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        <div className="font-semibold mb-1">Test criteria:</div>
        <div>• ≤20 renders in 10 sec = ✅ Normal</div>
        <div>• {'>'}20 renders in 10 sec = ❌ Infinite loop</div>
      </div>
    </div>
  );
}