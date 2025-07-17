import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: ПРАВИЛЬНОЕ ОПРЕДЕЛЕНИЕ TELEGRAM КЛИЕНТОВ
 * 
 * Основано на реальном тестировании с Telegram Desktop
 * 
 * ЛОГИКА:
 * 1. Проверяем User Agent на признаки Telegram
 * 2. Проверяем URL параметры WebApp
 * 3. Особые случаи (диагностика, флаги)
 * 4. ИНАЧЕ: Редирект на /tg-redirect только для обычных браузеров
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  
  // ✅ Обрабатываем только /tg путь
  if (pathname === '/tg') {
    // ✅ ОСОБЫЕ СЛУЧАИ: Никогда не редиректим
    const neverRedirectCases = [
      // Диагностика
      pathname.includes('/diagnostic'),
      // Специальные флаги
      searchParams.has('_forceBrowser'),
      searchParams.has('_fromTelegram'),
      searchParams.has('_browser'),
      searchParams.has('_redirected'),
      searchParams.has('_noRedirect'),
      searchParams.has('_debug'),
      // Development режим
      process.env.NODE_ENV === 'development' && searchParams.has('dev')
    ];
    
    if (neverRedirectCases.some(condition => condition)) {
      console.log(`[middleware] Никогда не редиректим ${pathname} - особый случай`);
      return NextResponse.next();
    }
    
    // ✅ УЛУЧШЕННОЕ ОПРЕДЕЛЕНИЕ TELEGRAM КЛИЕНТОВ
    const telegramIndicators = {
      // Метод 1: WebApp параметры (надежные)
      hasWebAppParams: searchParams.has('tgWebAppData') ||
                      searchParams.has('tgWebAppVersion') ||
                      searchParams.has('tgWebAppStartParam') ||
                      searchParams.has('tgWebAppPlatform') ||
                      searchParams.has('tgWebAppThemeParams'),
      
      // Метод 2: User Agent паттерны
      hasTelegramUA: [
        'TelegramDesktop',
        'Telegram Desktop', 
        'Telegram/',
        'TelegramBot',
        'TelegramWebView',
        'TgWebView'
      ].some(pattern => userAgent.includes(pattern)),
      
      // Метод 3: Особые Telegram параметры
      hasTelegramSpecific: userAgent.toLowerCase().includes('telegram') ||
                          searchParams.has('tg') ||
                          request.headers.get('referer')?.includes('telegram'),
    };
    
    // ✅ Определяем как Telegram клиент
    const isTelegramClient = telegramIndicators.hasWebAppParams ||
                            telegramIndicators.hasTelegramUA ||
                            telegramIndicators.hasTelegramSpecific;
    
    // ✅ ЛОГИРОВАНИЕ ДЛЯ ОТЛАДКИ
    console.log(`[middleware] УЛУЧШЕННАЯ ДИАГНОСТИКА ${pathname}:`, {
      userAgent: userAgent.substring(0, 80) + (userAgent.length > 80 ? '...' : ''),
      telegramIndicators,
      decision: isTelegramClient ? '✅ TELEGRAM_CLIENT' : '🔄 REDIRECT_TO_TG_REDIRECT',
      referer: request.headers.get('referer') || 'none',
      startParam: searchParams.get('startapp') || searchParams.get('start') || 'none'
    });
    
    // ✅ Если НЕ Telegram клиент - редиректим
    if (!isTelegramClient) {
      const redirectUrl = new URL('/tg-redirect', request.url);
      
      // Сохраняем start параметры
      const startParam = searchParams.get('startapp') || 
                        searchParams.get('start') || 
                        searchParams.get('startParam');
      
      if (startParam) {
        redirectUrl.searchParams.set('startapp', startParam);
      }
      
      // Флаг против зацикливания
      redirectUrl.searchParams.set('_redirected', 'true');
      
      console.log(`[middleware] РЕДИРЕКТ: Обычный браузер -> /tg-redirect`, {
        redirectUrl: redirectUrl.toString(),
        reason: 'не обнаружен Telegram клиент'
      });
      
      return NextResponse.redirect(redirectUrl);
    } else {
      console.log(`[middleware] ПРОПУСК: Telegram клиент обнаружен -> разрешаем доступ`);
    }
  }
  
  // ✅ Все остальные запросы пропускаем
  return NextResponse.next();
}

export const config = {
  // ✅ Применяем middleware ТОЛЬКО к /tg пути
  matcher: ['/tg']
};
