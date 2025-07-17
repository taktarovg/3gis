import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ v11: Совместимость с TelegramRedirectClientFixed v11
 * - Синхронизация с исправленным redirect клиентом
 * - Оптимизированная логика определения Telegram клиентов
 * - Полная Next.js 15.3.3 совместимость
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  const secFetchSite = request.headers.get('sec-fetch-site') || '';
  const xRequestedWith = request.headers.get('x-requested-with') || '';
  
  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ v11: Упрощенная и точная логика определения Telegram клиентов
  // Синхронизировано с TelegramRedirectClientFixed v11
  const isTelegramWebApp = 
    // Метод 1: Настоящие WebApp параметры (приоритет)
    searchParams.has('tgWebAppData') ||
    searchParams.has('tgWebAppVersion') ||
    searchParams.has('tgWebAppStartParam') ||
    searchParams.has('tgWebAppPlatform') ||
    searchParams.has('tgWebAppThemeParams') ||
    // Метод 2: Telegram Desktop/Mobile User Agent (ОСНОВНОЙ для Telegram Desktop)
    userAgent.includes('TelegramDesktop') ||
    userAgent.includes('Telegram Desktop') ||
    userAgent.includes('Telegram/') ||
    // Метод 3: TelegramBot (любой - с параметрами или без)
    userAgent.includes('TelegramBot') ||
    // Метод 4: WebView с WebApp параметрами
    ((userAgent.includes('TelegramWebView') || userAgent.includes('TgWebView')) && 
     searchParams.has('tgWebAppVersion'));
  
  console.log(`[middleware] v11 ДИАГНОСТИКА (совместимо с TelegramRedirectClient v11) ${pathname}:`, {
    userAgent: userAgent.substring(0, 80) + (userAgent.length > 80 ? '...' : ''),
    referer: referer.substring(0, 50) + (referer.length > 50 ? '...' : ''),
    telegramDetection: {
      hasTelegramDesktop: userAgent.includes('TelegramDesktop') || userAgent.includes('Telegram Desktop'),
      hasTelegramSlash: userAgent.includes('Telegram/'),
      hasTelegramBot: userAgent.includes('TelegramBot'),
      hasWebViewPatterns: userAgent.includes('TelegramWebView') || userAgent.includes('TgWebView')
    },
    webAppParams: {
      tgWebAppData: searchParams.has('tgWebAppData'),
      tgWebAppVersion: searchParams.has('tgWebAppVersion'), 
      tgWebAppPlatform: searchParams.has('tgWebAppPlatform'),
      tgWebAppStartParam: searchParams.has('tgWebAppStartParam')
    },
    decision: isTelegramWebApp ? '✅ ALLOW_ACCESS_TO_TG' : '🔄 REDIRECT_TO_TG_REDIRECT',
    startParam: searchParams.get('startapp') || searchParams.get('start') || 'none'
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
      
      console.log(`[middleware] v11: РЕДИРЕКТ ${pathname} -> /tg-redirect`, {
        reason: 'не обнаружен Telegram клиент',
        startParam: startParam || 'отсутствует',
        redirectUrl: redirectUrl.toString(),
        clientVersion: 'TelegramRedirectClient v11'
      });
      
      return NextResponse.redirect(redirectUrl);
    } else {
      console.log(`[middleware] v11: ${pathname} - Пропускаем, обнаружен Telegram клиент (совместимо с v11)`);
    }
  }
  
  // ✅ Все остальные запросы пропускаем без изменений
  return NextResponse.next();
}

export const config = {
  // ✅ Применяем middleware ТОЛЬКО к /tg пути
  matcher: ['/tg']
};
