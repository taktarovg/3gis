'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Telegram SDK v3.x provider
import { SDKProvider } from '@telegram-apps/sdk-react';

// Создаем разные клиенты для разных контекстов
const createQueryClient = (context: 'website' | 'telegram' | 'admin') => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: context === 'website' ? 5 * 60 * 1000 : 60 * 1000,
      gcTime: context === 'website' ? 10 * 60 * 1000 : 5 * 60 * 1000,
      retry: context === 'telegram' ? 1 : 2,
      refetchOnWindowFocus: context === 'website',
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Произошла неизвестная ошибка';

        // Используем console.error вместо toast для совместимости
        console.error('3GIS Mutation Error:', errorMessage);
      },
    },
  },
});

// Определяем контекст приложения
function determineContext(pathname: string): 'website' | 'telegram' | 'admin' {
  if (pathname.startsWith('/admin')) return 'admin'; 
  if (pathname.startsWith('/tg')) return 'telegram';
  return 'website';
}

// Telegram инициализация (упрощенная версия для SDK v3.x)
function TelegramInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // SDK v3.x сам обрабатывает инициализацию Telegram WebApp
    const timer = setTimeout(() => {
      console.log('✅ 3GIS Telegram SDK v3.x инициализирован');
      setIsInitialized(true);
    }, 100); // Минимальная задержка для инициализации SDK

    return () => clearTimeout(timer);
  }, []);

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
          <p className="text-sm font-medium text-gray-600">
            Инициализация 3GIS...
          </p>
        </div>
      </div>
    );
  }

  return null;
}

// Провайдер для сайта
function WebsiteProvider({ children }: { children: React.ReactNode }) {
  const queryClient = React.useRef(createQueryClient('website'));
  
  return (
    <QueryClientProvider client={queryClient.current}>
      {children}
    </QueryClientProvider>
  );
}

// Провайдер для Telegram приложения
function TelegramProvider({ children }: { children: React.ReactNode }) {
  const queryClient = React.useRef(createQueryClient('telegram'));
  
  return (
    <QueryClientProvider client={queryClient.current}>
      <SDKProvider acceptCustomStyles debug>
        <TelegramInitializer />
        {children}
      </SDKProvider>
    </QueryClientProvider>
  );
}

// Провайдер для админки
function AdminProvider({ children }: { children: React.ReactNode }) {
  const queryClient = React.useRef(createQueryClient('admin'));
  
  return (
    <QueryClientProvider client={queryClient.current}>
      {children}
    </QueryClientProvider>
  );
}

// Главный провайдер
export function ClientProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  
  // Определяем контекст приложения
  const context = determineContext(pathname);
  
  useEffect(() => {
    setIsMounted(true);
    console.log(`3GIS ClientProvider initialized for context: ${context}, path: ${pathname}`);
    
    // Инициализируем auth store после монтирования
    if (context === 'telegram') {
      initAuthStore();
    }
  }, [context, pathname]);

  if (!isMounted) {
    return null;
  }

  // Оборачиваем в Suspense для безопасности
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    }>
      {context === 'website' && <WebsiteProvider>{children}</WebsiteProvider>}
      {context === 'telegram' && <TelegramProvider>{children}</TelegramProvider>}
      {context === 'admin' && <AdminProvider>{children}</AdminProvider>}
    </Suspense>
  );
}
