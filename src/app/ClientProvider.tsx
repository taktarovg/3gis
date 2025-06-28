'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Telegram SDK v3.x imports
import { init, mockTelegramEnv, retrieveLaunchParams } from '@telegram-apps/sdk-react';

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
  
  // ✅ Используем ref для предотвращения множественных инициализаций
  const initAttempted = React.useRef(false);

  useEffect(() => {
    // ✅ КРИТИЧНО: Предотвращаем множественные инициализации
    if (initAttempted.current) {
      console.log('🔄 TelegramInitializer: уже инициализирован, пропускаем');
      return;
    }
    
    initAttempted.current = true;
    let mounted = true;

    const initializeTelegramSDK = async () => {
      try {
        console.log('🚀 Инициализация Telegram SDK v3.x...');
        
        // Проверяем, работаем ли мы в Telegram
        let isInTelegram = false;
        let launchParams: any = null;
        
        try {
        // Даем больше времени для инициализации на мобильных устройствах
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // В v3 используем правильную функцию
        launchParams = retrieveLaunchParams();
        
        // В v3 структура изменилась - все свойства имеют префикс tgWebApp
        isInTelegram = !!(launchParams?.tgWebAppData || launchParams?.tgWebAppBotInline !== undefined);
        
        console.log('📱 Telegram environment check:', {
            isInTelegram,
            hasWebAppData: !!launchParams?.tgWebAppData,
            platform: launchParams?.tgWebAppPlatform || 'unknown',
            version: launchParams?.tgWebAppVersion || 'unknown',
            launchParamsKeys: launchParams ? Object.keys(launchParams) : []
          });
        } catch (error) {
          console.log('🔧 Не в Telegram окружении, включаем режим разработки:', error);
          isInTelegram = false;
        }
        
        if (!isInTelegram) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔧 Режим разработки: мокаем Telegram окружение');
            
            // Мокаем Telegram окружение для разработки
            const randomId = Math.floor(Math.random() * 1000000000);
            
            // Правильная структура для SDK v3.x согласно документации
            const themeParams = {
              accent_text_color: '#6ab2f2' as `#${string}`,
              bg_color: '#17212b' as `#${string}`,
              button_color: '#5288c1' as `#${string}`,
              button_text_color: '#ffffff' as `#${string}`,
              destructive_text_color: '#ec3942' as `#${string}`,
              header_bg_color: '#17212b' as `#${string}`,
              hint_color: '#708499' as `#${string}`,
              link_color: '#6ab3f3' as `#${string}`,
              secondary_bg_color: '#232e3c' as `#${string}`,
              section_bg_color: '#17212b' as `#${string}`,
              section_header_text_color: '#6ab3f3' as `#${string}`,
              subtitle_text_color: '#708499' as `#${string}`,
              text_color: '#f5f5f5' as `#${string}`,
            };

            // В v3 tgWebAppData должен быть строкой JSON для mockTelegramEnv
            const mockWebAppData = JSON.stringify({
              user: {
                id: randomId,
                first_name: 'Георгий',
                last_name: 'Тактаров',
                username: 'taktarovgv',
                language_code: 'ru',
                is_premium: false,
                allows_write_to_pm: true,
                photo_url: 'https://t.me/i/userpic/320/4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg'
              },
              auth_date: Math.floor(Date.now() / 1000),
              hash: '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31',
              start_param: 'debug',
              chat_type: 'sender',
              chat_instance: '8428209589180549439'
            });

            // Используем правильную структуру v3.x
            mockTelegramEnv({
              launchParams: {
                tgWebAppThemeParams: themeParams,
                tgWebAppData: mockWebAppData, // JSON строка для корректной работы
                tgWebAppVersion: '8.0',
                tgWebAppPlatform: 'tdesktop',
                tgWebAppStartParam: 'debug',
                tgWebAppBotInline: false
              }
            });
          } else {
            // В продакшене на мобильных устройствах может потребоваться больше времени
            console.log('⏳ Ожидание инициализации Telegram Mini App...');
          }
        }
        
        // Инициализируем SDK с retry логикой для мобильных устройств
        let initAttempts = 0;
        const maxAttempts = 3;
        
        while (initAttempts < maxAttempts && mounted) {
          try {
            await init();
            break; // Успешная инициализация
          } catch (error) {
            initAttempts++;
            console.warn(`❌ Попытка инициализации ${initAttempts}/${maxAttempts} не удалась:`, error);
            
            if (initAttempts < maxAttempts) {
              // Ждем перед следующей попыткой
              await new Promise(resolve => setTimeout(resolve, 1000 * initAttempts));
            } else {
              throw error; // Последняя попытка не удалась
            }
          }
        }
        
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

// Провайдер для Telegram приложения
const TelegramProvider = React.memo(({ children }: { children: React.ReactNode }) => {
  const queryClient = React.useMemo(() => createQueryClient('telegram'), []);
  
  console.log('📱 TelegramProvider: создан QueryClient');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramInitializer />
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
