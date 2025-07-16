import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ v10: Совместимость с исправленным TelegramProvider
 * - Синхронизация с TelegramProvider v10 (БЕЗ useLaunchParams)
 * - Исправлены Server/Client ошибки компонентов
 * - Улучшенная совместимость с Next.js 15.3.3
 * - Telegram Desktop/Mobile поддержка
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  const secFetchSite = request.headers.get('sec-fetch-site') || '';
  const xRequestedWith = request.headers.get('x-requested-with') || '';
  
  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Правильное определение Telegram Desktop/Mobile
  // Не все Telegram клиенты передают WebApp параметры!
  const isTelegramWebApp = 
    // Метод 1: Настоящие WebApp параметры (приоритет)
    searchParams.has('tgWebAppData') ||
    searchParams.has('tgWebAppVersion') ||
    searchParams.has('tgWebAppStartParam') ||
    searchParams.has('tgWebAppPlatform') ||
    searchParams.has('tgWebAppThemeParams') ||
    // Метод 2: Telegram Desktop/Mobile User Agent (без WebApp параметров)
    userAgent.includes('TelegramDesktop') ||
    userAgent.includes('Telegram Desktop') ||
    userAgent.includes('Telegram/') ||
    // Метод 3: TelegramBot с WebApp параметрами
    (userAgent.includes('TelegramBot') && (
      searchParams.has('tgWebAppData') || 
      searchParams.has('tgWebAppVersion')
    )) ||
    // Метод 4: WebView с WebApp параметрами
    ((userAgent.includes('TelegramWebView') || userAgent.includes('TgWebView')) && 
     searchParams.has('tgWebAppVersion'));
  
  console.log(`[middleware] ДИАГНОСТИКА v10 ФИКС (совместимо с TelegramProvider v10) ${pathname}:`, {
    userAgent: userAgent.substring(0, 100) + (userAgent.length > 100 ? '...' : ''),
    referer,
    secFetchSite,
    xRequestedWith,
    telegramDetection: {
      hasTelegramDesktop: userAgent.includes('TelegramDesktop') || userAgent.includes('Telegram Desktop'),
      hasTelegramSlash: userAgent.includes('Telegram/'),
      hasTelegramBot: userAgent.includes('TelegramBot'),
      hasWebViewPatterns: userAgent.includes('TelegramWebView') || userAgent.includes('TgWebView')
    },
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
      
      console.log(`[middleware] РЕДИРЕКТ v10: ${pathname} -> /tg-redirect`, {
        reason: 'не обнаружен Telegram WebApp',
        startParam: startParam || 'отсутствует',
        redirectUrl: redirectUrl.toString(),
        telegramProviderCompatible: 'v10'
      });
      
      return NextResponse.redirect(redirectUrl);
    } else {
      console.log(`[middleware] ${pathname} - Пропускаем, обнаружен Telegram WebApp (v10 совместимо)`);
    }
  }
  
  // ✅ Все остальные запросы пропускаем без изменений
  return NextResponse.next();
}

export const config = {
  // ✅ Применяем middleware ТОЛЬКО к /tg пути
  matcher: ['/tg']
};
