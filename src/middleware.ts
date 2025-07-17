import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ✅ ИСПРАВЛЕННЫЙ MIDDLEWARE v13 - ФИКС TELEGRAM DESKTOP
 * 
 * КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ v13:
 * - Telegram Desktop НЕ передает специальный User-Agent
 * - Но он ВСЕГДА передает Telegram-специфичные заголовки и параметры
 * - Добавляем детекцию по Referer, заголовкам и контексту запуска
 */

/**
 * ✅ РАСШИРЕННАЯ ДЕТЕКЦИЯ TELEGRAM (включая современный Desktop)
 */
function isTelegramRequest(request: NextRequest): boolean {
  const userAgentString = request.headers.get('user-agent') || '';
  const url = request.nextUrl;
  const referer = request.headers.get('referer') || '';
  
  console.log(`[Middleware v13] Анализ запроса:`, {
    userAgent: userAgentString.substring(0, 80) + '...',
    pathname: url.pathname,
    referer: referer.substring(0, 60) + '...',
    hasStartApp: url.searchParams.has('startapp'),
    hasWebAppData: url.searchParams.has('tgWebAppData')
  });
  
  // 1. ✅ НОВОЕ: Проверка Referer (Telegram Desktop часто передает)
  if (referer.includes('telegram') || referer.includes('tg://')) {
    console.log(`[TG Detection v13] Telegram referer detected: ${referer}`);
    return true;
  }
  
  // 2. ✅ НОВОЕ: Telegram-специфичные заголовки
  const telegramHeaders = [
    'x-telegram-bot-api-secret-token',
    'x-telegram-app',
    'sec-fetch-site', // Telegram Desktop может передавать 'none' или 'same-origin'
  ];
  
  for (const header of telegramHeaders) {
    const value = request.headers.get(header);
    if (value) {
      console.log(`[TG Detection v13] Telegram header detected: ${header}=${value}`);
      return true;
    }
  }
  
  // 3. ✅ НОВОЕ: Расширенная проверка URL параметров (больше вариантов)
  const telegramParams = [
    'startapp',
    'start_param', 
    'tgWebAppData',
    'tgWebAppVersion',
    'tgWebAppStartParam',
    'tgWebAppPlatform',
    'tgWebAppThemeParams',
    'tg', // Простой флаг
    'telegram' // Альтернативный флаг
  ];
  
  for (const param of telegramParams) {
    if (url.searchParams.has(param)) {
      console.log(`[TG Detection v13] Telegram parameter detected: ${param}`);
      return true;
    }
  }
  
  // 4. ✅ ОРИГИНАЛЬНЫЕ ПАТТЕРНЫ User-Agent (для мобильных и старых клиентов)
  const patterns = {
    telegramBot: /^TelegramBot/.test(userAgentString),
    tdesktop: /tdesktop/i.test(userAgentString),
    telegramAndroid: /Telegram-Android\//.test(userAgentString),
    telegramIOS: /Safari\/[\d.]+ Telegram [\d.]+/.test(userAgentString),
    telegramDesktop: /TelegramDesktop/i.test(userAgentString), // Старые версии
  };
  
  for (const [patternName, matches] of Object.entries(patterns)) {
    if (matches) {
      console.log(`[TG Detection v13] ${patternName} pattern detected`);
      return true;
    }
  }
  
  // 5. ✅ НОВОЕ: Проверка контекста запроса
  // Если запрос пришел без стандартных браузерных заголовков - может быть WebView
  const acceptHeader = request.headers.get('accept') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  
  // Telegram WebView часто имеет упрощенные заголовки
  const hasMinimalHeaders = !acceptHeader.includes('text/html') && 
                           !acceptLanguage.includes('en') &&
                           !acceptLanguage.includes('ru');
  
  if (hasMinimalHeaders && url.pathname.startsWith('/tg')) {
    console.log(`[TG Detection v13] Minimal headers suggest WebView context`);
    return true;
  }
  
  // 6. ✅ НОВОЕ: Эвристика для Telegram Desktop
  // Если User-Agent содержит Chrome/Edge без обычных браузерных признаков
  const isWebViewLike = userAgentString.includes('Chrome/') && 
                       !userAgentString.includes('Windows NT') &&
                       url.pathname.startsWith('/tg');
  
  if (isWebViewLike) {
    console.log(`[TG Detection v13] WebView-like User-Agent for /tg path`);
    return true;
  }
  
  // Если ни одна проверка не сработала - это НЕ Telegram
  console.log(`[TG Detection v13] NOT Telegram - все проверки v13 не прошли`);
  return false;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // ✅ ОБРАБАТЫВАЕМ ТОЛЬКО /tg ПУТИ
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
    console.log(`[Middleware v13] Special bypass detected for ${pathname} - serving as is`);
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ /tg-redirect и /tg-debug страницы
  if (pathname.startsWith('/tg-redirect') || pathname.startsWith('/tg-debug')) {
    console.log(`[Middleware v13] Serving redirect/debug page as is: ${pathname}`);
    return NextResponse.next();
  }
  
  // ✅ ОСНОВНАЯ ЛОГИКА: определяем Telegram клиент (расширенная v13)
  const isTelegram = isTelegramRequest(request);
  
  console.log(`[Middleware v13] Результат для ${pathname}:`, {
    isTelegram,
    decision: isTelegram ? 'ПРОПУСТИТЬ' : 'РЕДИРЕКТ_НА_TG_REDIRECT'
  });
  
  // ✅ Если это НЕ Telegram запрос на /tg - перенаправляем на /tg-redirect  
  if (!isTelegram) {
    console.log(`[Middleware v13] Non-Telegram request to ${pathname}, redirecting to /tg-redirect`);
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
  console.log(`[Middleware v13] Telegram client detected - allowing access to ${pathname}`);
  
  const response = NextResponse.next();
  
  // Отключаем кэширование для динамических страниц
  response.headers.set('Cache-Control', 'no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

export const config = {
  // ✅ ПРИМЕНЯЕМ ТОЛЬКО К /tg ПУТЯМ
  matcher: ['/tg/:path*'],
};