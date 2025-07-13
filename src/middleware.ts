import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ✅ УЛУЧШЕННЫЙ middleware для безопасного редиректа
 * - Точное определение Telegram WebApp
 * - Защита от зацикливания  
 * - Совместимость с Next.js 15.3.3
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  
  // ✅ Улучшенное определение Telegram WebApp среды
  const isTelegramWebApp = 
    // Telegram Bot User Agent
    userAgent.includes('TelegramBot') || 
    userAgent.includes('Telegram/') ||
    userAgent.includes('tgWebApp') ||
    // Telegram WebApp параметры
    searchParams.has('tgWebAppData') ||
    searchParams.has('tgWebAppVersion') ||
    searchParams.has('tgWebAppPlatform') ||
    searchParams.has('tgWebAppThemeParams') ||
    // Cross-site запросы от Telegram
    request.headers.get('sec-fetch-site') === 'cross-site' ||
    // Referer от Telegram
    request.headers.get('referer')?.includes('telegram') ||
    // Специальные заголовки от Telegram
    request.headers.get('x-requested-with') === 'org.telegram.messenger';
  
  // ✅ Обрабатываем только /tg путь
  if (pathname === '/tg' && !isTelegramWebApp) {
    // ✅ Защита от зацикливания - проверяем специальные флаги
    const preventRedirectFlags = [
      '_forceBrowser',
      '_fromTelegram', 
      '_browser',
      '_redirected',
      '_noRedirect'
    ];
    
    const hasPreventFlag = preventRedirectFlags.some(flag => 
      searchParams.has(flag)
    );
    
    if (hasPreventFlag) {
      console.log(`[middleware] ${pathname} - Доступ разрешен из-за флага предотвращения`);
      return NextResponse.next();
    }
    
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
      userAgent: userAgent.substring(0, 50) + '...',
      startParam: startParam || 'отсутствует',
      isTelegramWebApp,
      preventFlags: hasPreventFlag
    });
    
    return NextResponse.redirect(redirectUrl);
  }
  
  // ✅ Все остальные запросы пропускаем без изменений
  return NextResponse.next();
}

export const config = {
  // ✅ Применяем middleware ТОЛЬКО к /tg пути
  matcher: ['/tg']
};
