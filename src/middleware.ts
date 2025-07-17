import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ✅ ИСПРАВЛЕННЫЙ MIDDLEWARE v12 - ТОЧНАЯ ДЕТЕКЦИЯ (по образцу TIB3)
 * 
 * ПРИНЦИПИАЛЬНЫЕ ИЗМЕНЕНИЯ v12:
 * 1. Применяем ТОЛЬКО к /tg пути (как было изначально)
 * 2. Используем проверенные паттерны из TIB3
 * 3. Убираем обработку всех остальных путей
 * 4. Фокус на решении конкретной проблемы: нативное приложение → /tg-redirect
 */

/**
 * ✅ ТОЧНАЯ ДЕТЕКЦИЯ TELEGRAM (проверенные паттерны из TIB3)
 */
function isTelegramRequest(request: NextRequest): boolean {
  const userAgentString = request.headers.get('user-agent') || '';
  const url = request.nextUrl;
  
  console.log(`[Middleware v12] Анализ запроса:`, {
    userAgent: userAgentString.substring(0, 80) + '...',
    pathname: url.pathname,
    hasStartApp: url.searchParams.has('startapp'),
    hasWebAppData: url.searchParams.has('tgWebAppData')
  });
  
  // 1. Точная детекция TelegramBot (для превью ссылок)
  if (/^TelegramBot/.test(userAgentString)) {
    console.log(`[TG Detection v12] TelegramBot detected`);
    return true;
  }
  
  // 2. Telegram Desktop приложения
  if (/tdesktop/i.test(userAgentString)) {
    console.log(`[TG Detection v12] TDesktop detected`);
    return true;
  }
  
  // 3. Telegram Mobile Apps (точные паттерны из документации)
  if (/Telegram-Android\//.test(userAgentString)) {
    console.log(`[TG Detection v12] Telegram Android detected`);
    return true;
  }
  if (/Safari\/[\d.]+ Telegram [\d.]+/.test(userAgentString)) {
    console.log(`[TG Detection v12] Telegram iOS detected`);
    return true;
  }
  
  // 4. Telegram параметры (самый надежный способ)
  if (url.searchParams.has('startapp')) {
    console.log(`[TG Detection v12] startapp parameter detected`);
    return true;
  }
  if (url.searchParams.has('start_param')) {
    console.log(`[TG Detection v12] start_param parameter detected`);
    return true;
  }
  if (url.searchParams.has('tgWebAppData')) {
    console.log(`[TG Detection v12] tgWebAppData parameter detected`);
    return true;
  }
  if (url.searchParams.has('tgWebAppVersion')) {
    console.log(`[TG Detection v12] tgWebAppVersion parameter detected`);
    return true;
  }
  
  // 5. Telegram заголовки
  if (request.headers.get('x-telegram-bot-api-secret-token')) {
    console.log(`[TG Detection v12] Telegram Bot API header detected`);
    return true;
  }
  if (request.headers.get('x-telegram-app')) {
    console.log(`[TG Detection v12] X-Telegram-App header detected`);
    return true;
  }
  
  // Если ни одна проверка не сработала - это НЕ Telegram
  console.log(`[TG Detection v12] NOT Telegram - все проверки не прошли`);
  return false;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // ✅ ОБРАБАТЫВАЕМ ТОЛЬКО /tg ПУТИ (как было изначально)
  if (!pathname.startsWith('/tg')) {
    return NextResponse.next();
  }
  
  // ✅ СПЕЦИАЛЬНЫЕ ОБХОДЫ для отладки
  const url = request.nextUrl;
  if (
    url.searchParams.has('_forceBrowser') ||
    url.searchParams.has('_fromTelegram') ||
    url.searchParams.has('_browser') ||
    url.searchParams.has('_redirected') ||
    url.searchParams.has('_noRedirect') ||
    url.searchParams.has('_debug')
  ) {
    console.log(`[Middleware v12] Special bypass detected for ${pathname} - serving as is`);
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ /tg-redirect и /tg-debug страницы
  if (pathname.startsWith('/tg-redirect') || pathname.startsWith('/tg-debug')) {
    console.log(`[Middleware v12] Serving redirect/debug page as is: ${pathname}`);
    return NextResponse.next();
  }
  
  // ✅ ОСНОВНАЯ ЛОГИКА: определяем Telegram клиент
  const isTelegram = isTelegramRequest(request);
  
  console.log(`[Middleware v12] Результат для ${pathname}:`, {
    isTelegram,
    decision: isTelegram ? 'ПРОПУСТИТЬ' : 'РЕДИРЕКТ_НА_TG_REDIRECT'
  });
  
  // ✅ Если это НЕ Telegram запрос на /tg - перенаправляем на /tg-redirect  
  if (!isTelegram) {
    console.log(`[Middleware v12] Non-Telegram request to ${pathname}, redirecting to /tg-redirect`);
    const redirectUrl = new URL('/tg-redirect', request.url);
    
    // Сохраняем start параметры
    const startParam = url.searchParams.get('startapp') || 
                      url.searchParams.get('start') || 
                      url.searchParams.get('startParam');
    
    if (startParam) {
      redirectUrl.searchParams.set('startapp', startParam);
    }
    
    // Флаг против зацикливания
    redirectUrl.searchParams.set('_redirected', 'true');
    
    return NextResponse.redirect(redirectUrl);
  }
  
  // ✅ Telegram клиент обнаружен - пропускаем запрос
  console.log(`[Middleware v12] Telegram client detected - allowing access to ${pathname}`);
  
  const response = NextResponse.next();
  
  // Отключаем кэширование для динамических страниц
  response.headers.set('Cache-Control', 'no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

export const config = {
  // ✅ ПРИМЕНЯЕМ ТОЛЬКО К /tg ПУТЯМ (возвращаемся к исходному подходу)
  matcher: ['/tg/:path*'],
};