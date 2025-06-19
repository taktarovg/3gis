'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Telegram SDK v3.x imports
import { init, mockTelegramEnv, parseInitData, isTMA } from '@telegram-apps/sdk-react';

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

// Telegram SDK v3.x инициализация
function TelegramInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeTelegramSDK = async () => {
      try {
        console.log('🚀 Инициализация Telegram SDK v3.x...');
        
        // Проверяем, работаем ли мы в Telegram
        const isInTelegram = isTMA('simple');
        
        if (!isInTelegram && process.env.NODE_ENV === 'development') {
          console.log('🔧 Режим разработки: мокаем Telegram окружение');
          
          // Мокаем Telegram окружение для разработки
          const randomId = Math.floor(Math.random() * 1000000000);
          const mockInitDataRaw = new URLSearchParams([
            ['user', JSON.stringify({
              id: randomId,
              first_name: 'Test',
              last_name: 'User',
              username: 'testuser',
              language_code: 'ru',
              is_premium: false,
              allows_write_to_pm: true,
            })],
            ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
            ['auth_date', Math.floor(Date.now() / 1000).toString()],
            ['start_param', 'debug'],
            ['chat_type', 'sender'],
            ['chat_instance', '8428209589180549439'],
          ]).toString();

          mockTelegramEnv({
            themeParams: {
              accentTextColor: '#6ab2f2',
              bgColor: '#17212b',
              buttonColor: '#5288c1',
              buttonTextColor: '#ffffff',
              destructiveTextColor: '#ec3942',
              headerBgColor: '#17212b',
              hintColor: '#708499',
              linkColor: '#6ab3f3',
              secondaryBgColor: '#232e3c',
              sectionBgColor: '#17212b',
              sectionHeaderTextColor: '#6ab3f3',
              subtitleTextColor: '#708499',
              textColor: '#f5f5f5',
            },
            initData: parseInitData(mockInitDataRaw),
            initDataRaw: mockInitDataRaw,
            version: '7.2',
            platform: 'tdesktop',
          });
        }
        
        // Инициализируем SDK
        await init();
        
        if (mounted) {
          console.log('✅ Telegram SDK v3.x успешно инициализирован');
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('❌ Ошибка инициализации Telegram SDK:', error);
        if (mounted) {
          setInitError(error instanceof Error ? error.message : 'Неизвестная ошибка');
        }
      }
    };

    initializeTelegramSDK();

    return () => {
      mounted = false;
    };
  }, []);

  if (initError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-red-50 z-50">
        <div className="flex flex-col items-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-2xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Ошибка инициализации</h3>
          <p className="text-sm text-red-600 text-center mb-4">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

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
      <TelegramInitializer />
      {children}
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
