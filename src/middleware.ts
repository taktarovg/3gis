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
  
  // ✅ ИСПРАВЛЕНО: ТОЧНОЕ определение Telegram Mini App среды
  // Только настоящие WebApp запросы, НЕ обычные браузерные запросы из Telegram
  const isTelegramWebApp = 
    // ОСНОВНЫЕ признаки Mini App (обязательные WebApp параметры)
    searchParams.has('tgWebAppData') ||
    searchParams.has('tgWebAppVersion') ||
    searchParams.has('tgWebAppStartParam') ||
    searchParams.has('tgWebAppPlatform') ||
    searchParams.has('tgWebAppThemeParams') ||
    // TelegramBot User Agent ТОЛЬКО для Mini App (не для обычного браузера)
    (userAgent.includes('TelegramBot') && (
      searchParams.has('tgWebAppData') || 
      searchParams.has('tgWebAppVersion')
    )) ||
    // WebView паттерны ТОЛЬКО с WebApp параметрами
    ((userAgent.includes('TelegramWebView') || userAgent.includes('TgWebView')) && 
     searchParams.has('tgWebAppVersion'));
  
  console.log(`[middleware] ДИАГНОСТИКА v8 ${pathname}:`, {
    userAgent: userAgent.substring(0, 80) + (userAgent.length > 80 ? '...' : ''),
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
