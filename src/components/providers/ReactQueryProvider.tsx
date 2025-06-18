'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface ReactQueryProviderProps {
  children: React.ReactNode;
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Время кэширования данных
        staleTime: 1000 * 60 * 5, // 5 минут
        gcTime: 1000 * 60 * 30, // 30 минут (ранее cacheTime)
        
        // Retry настройки
        retry: (failureCount, error: any) => {
          // Не retry для 4xx ошибок
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          
          // Максимум 2 retry для других ошибок
          return failureCount < 2;
        },
        
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Отключаем автоматические refetch в background
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        
        // Network mode для offline support
        networkMode: 'online',
      },
      mutations: {
        // Retry для mutations только для network errors
        retry: (failureCount, error: any) => {
          if (error?.message?.includes('Network Error') && failureCount < 2) {
            return true;
          }
          return false;
        },
        
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Network mode для offline support
        networkMode: 'online',
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools только в development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
