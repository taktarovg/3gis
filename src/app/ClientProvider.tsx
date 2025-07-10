'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initAuthStore } from '@/store/auth-store';
import { Loader2 } from 'lucide-react';

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

// ✅ Мемоизированные провайдеры для предотвращения пересоздания QueryClient

// Провайдер для сайта
const WebsiteProvider = React.memo(({ children }: { children: React.ReactNode }) => {
  const queryClient = React.useMemo(() => createQueryClient('website'), []);
  
  console.log('🌐 WebsiteProvider: создан QueryClient');
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
});
WebsiteProvider.displayName = 'WebsiteProvider';

// Провайдер для Telegram приложения - БЕЗ дублирования инициализации SDK
const TelegramProvider = React.memo(({ children }: { children: React.ReactNode }) => {
  const queryClient = React.useMemo(() => createQueryClient('telegram'), []);
  
  console.log('📱 TelegramProvider: создан QueryClient (SDK будет инициализирован в layout)');
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
});
TelegramProvider.displayName = 'TelegramProvider';

// Провайдер для админки
const AdminProvider = React.memo(({ children }: { children: React.ReactNode }) => {
  const queryClient = React.useMemo(() => createQueryClient('admin'), []);
  
  console.log('🔧 AdminProvider: создан QueryClient');
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
});
AdminProvider.displayName = 'AdminProvider';

// Главный провайдер
export function ClientProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  
  // ✅ СТАБИЛИЗИРУЕМ контекст - мемоизируем результат
  const context = React.useMemo(() => determineContext(pathname), [pathname]);
  
  // ✅ КРИТИЧНО: Разделяем инициализацию на два эффекта
  // 1. Устанавливаем isMounted только один раз
  useEffect(() => {
    setIsMounted(true);
  }, []); // ✅ ПУСТЫЕ зависимости - выполняется только при mount
  
  // 2. Инициализируем auth store только для telegram контекста
  useEffect(() => {
    if (isMounted && context === 'telegram') {
      console.log(`🔧 Initializing auth store for telegram context: ${pathname}`);
      initAuthStore();
    }
  }, [isMounted, context, pathname]); // ✅ Зависит от isMounted

  // ✅ Логируем изменения контекста отдельно для отладки
  useEffect(() => {
    if (isMounted) {
      console.log(`📍 3GIS ClientProvider: context=${context}, path=${pathname}`);
    }
  }, [isMounted, context, pathname]);

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
