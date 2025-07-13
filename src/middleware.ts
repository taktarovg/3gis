import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ✅ ДИАГНОСТИЧЕСКИЙ middleware для отладки Telegram определения
 * - Детальное логирование для понимания проблемы
 * - Временно более агрессивное определение Telegram
 * - Совместимость с Next.js 15.3.3
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  const secFetchSite = request.headers.get('sec-fetch-site') || '';
  const xRequestedWith = request.headers.get('x-requested-with') || '';
  
  // ✅ РАСШИРЕННОЕ определение Telegram WebApp среды
  const isTelegramWebApp = 
    // Telegram Bot User Agent (основные паттерны)
    userAgent.includes('TelegramBot') || 
    userAgent.includes('Telegram/') ||
    userAgent.includes('tgWebApp') ||
    userAgent.includes('TelegramWebView') ||
    userAgent.includes('TgWebView') ||
    // Telegram WebApp параметры
    searchParams.has('tgWebAppData') ||
    searchParams.has('tgWebAppVersion') ||
    searchParams.has('tgWebAppPlatform') ||
    searchParams.has('tgWebAppThemeParams') ||
    searchParams.has('tgWebAppStartParam') ||
    // ✅ НОВОЕ: расширенные проверки для нативных приложений
    searchParams.has('_tgWebAppVersion') ||
    // Cross-site запросы от Telegram
    secFetchSite === 'cross-site' ||
    // Referer от Telegram
    referer.includes('telegram') ||
    referer.includes('t.me') ||
    // Специальные заголовки от Telegram
    xRequestedWith === 'org.telegram.messenger' ||
    // ✅ НОВОЕ: дополнительные паттерны для Desktop и Mobile
    userAgent.includes('Telegram-Desktop') ||
    userAgent.includes('Telegram-iOS') ||
    userAgent.includes('Telegram-Android');
  
  // ✅ ДЕТАЛЬНОЕ логирование для диагностики
  console.log(`[middleware] ДИАГНОСТИКА ${pathname}:`, {
    userAgent: userAgent.substring(0, 100) + (userAgent.length > 100 ? '...' : ''),
    referer,
    secFetchSite,
    xRequestedWith,
    hasWebAppParams: {
      tgWebAppData: searchParams.has('tgWebAppData'),
      tgWebAppVersion: searchParams.has('tgWebAppVersion'), 
      tgWebAppPlatform: searchParams.has('tgWebAppPlatform'),
      tgWebAppStartParam: searchParams.has('tgWebAppStartParam')
    },
    isTelegramWebApp,
    searchParams: Object.fromEntries(searchParams.entries())
  });
  
  // ✅ Обрабатываем только /tg путь
  if (pathname === '/tg') {
    // ✅ Защита от зацикливания - проверяем специальные флаги
    const preventRedirectFlags = [
      '_forceBrowser',
      '_fromTelegram', 
      '_browser',
      '_redirected',
      '_noRedirect',
      '_debug' // для отладки
    ];
    
    const hasPreventFlag = preventRedirectFlags.some(flag => 
      searchParams.has(flag)
    );
    
    if (hasPreventFlag) {
      console.log(`[middleware] ${pathname} - Доступ разрешен из-за флага предотвращения:`, 
        preventRedirectFlags.filter(flag => searchParams.has(flag))
      );
      return NextResponse.next();
    }
    
    // ✅ Если НЕ определили как Telegram - редиректим
    if (!isTelegramWebApp) {
      // ✅ Создаем редирект URL
      const redirectUrl = new URL('/tg-redirect', request.url);
      
      // ✅ Сохраняем ТОЛЬКО необходимые параметры
      const startParam = searchParams.get('startapp') || 
                        searchParams.get('start') || 
                        searchParams.get('startParam');
      
      if (startParam) {
        redirectUrl.searchParams.set('startapp', startParam);
      }
      
      // ✅ Добавляем флаг для предотвращения зацикливания
      redirectUrl.searchParams.set('_redirected', 'true');
      
      console.log(`[middleware] РЕДИРЕКТ: ${pathname} -> /tg-redirect`, {
        reason: 'не обнаружен Telegram WebApp',
        startParam: startParam || 'отсутствует',
        redirectUrl: redirectUrl.toString()
      });
      
      return NextResponse.redirect(redirectUrl);
    } else {
      console.log(`[middleware] ${pathname} - Пропускаем, обнаружен Telegram WebApp`);
    }
  }
  
  // ✅ Все остальные запросы пропускаем без изменений
  return NextResponse.next();
}

export const config = {
  // ✅ Применяем middleware ТОЛЬКО к /tg пути
  matcher: ['/tg']
};
