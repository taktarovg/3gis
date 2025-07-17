import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ✅ ИСПРАВЛЕННЫЙ MIDDLEWARE v14 - ФИКС ЛОЖНЫХ СРАБАТЫВАНИЙ
 * 
 * КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ v14:
 * - v13 работает для Telegram Desktop ✅
 * - Но ломает обычные браузеры ❌
 * - Нужно сделать проверки более строгими
 */

/**
 * ✅ СТРОГАЯ ДЕТЕКЦИЯ TELEGRAM (без ложных срабатываний)
 */
function isTelegramRequest(request: NextRequest): boolean {
  const userAgentString = request.headers.get('user-agent') || '';
  const url = request.nextUrl;
  const referer = request.headers.get('referer') || '';
  
  console.log(`[Middleware v14] Анализ запроса:`, {
    userAgent: userAgentString.substring(0, 80) + '...',
    pathname: url.pathname,
    referer: referer.substring(0, 60) + '...',
    hasStartApp: url.searchParams.has('startapp'),
    hasWebAppData: url.searchParams.has('tgWebAppData')
  });
  
  // 1. ✅ ПРИОРИТЕТ: Явные URL параметры (самые надежные)
  const explicitTelegramParams = [
    'startapp',
    'start_param', 
    'tgWebAppData',
    'tgWebAppVersion',
    'tgWebAppStartParam',
    'tgWebAppPlatform',
    'tgWebAppThemeParams',
    'tg', // Принудительный обход
    'telegram' // Альтернативный обход
  ];
  
  for (const param of explicitTelegramParams) {
    if (url.searchParams.has(param)) {
      const value = url.searchParams.get(param);
      console.log(`[TG Detection v14] EXPLICIT Telegram parameter: ${param}=${value}`);
      return true;
    }
  }
  
  // 2. ✅ ПРОВЕРЕННЫЕ User-Agent паттерны (как в v12)
  const patterns = {
    telegramBot: /^TelegramBot/.test(userAgentString),
    tdesktop: /tdesktop/i.test(userAgentString),
    telegramAndroid: /Telegram-Android\//.test(userAgentString),
    telegramIOS: /Safari\/[\d.]+ Telegram [\d.]+/.test(userAgentString),
    telegramDesktop: /TelegramDesktop/i.test(userAgentString),
  };
  
  for (const [patternName, matches] of Object.entries(patterns)) {
    if (matches) {
      console.log(`[TG Detection v14] USER_AGENT pattern detected: ${patternName}`);
      return true;
    }
  }
  
  // 3. ✅ СТРОГАЯ проверка Referer (только если очень специфичный)
  const strictRefererPatterns = [
    'tg://',
    't.me/',
    'telegram.org',
    'web.telegram.org'
  ];
  
  for (const pattern of strictRefererPatterns) {
    if (referer.includes(pattern)) {
      console.log(`[TG Detection v14] STRICT Referer pattern: ${pattern}`);
      return true;
    }
  }
  
  // 4. ✅ УБРАНО: Широкие эвристики которые давали ложные срабатывания
  // Удалены проверки:
  // - hasMinimalHeaders (ложно срабатывал для обычных браузеров)
  // - isWebViewLike (слишком широкий)
  // - общие проверки на 'telegram' в User-Agent
  
  // 5. ✅ СТРОГИЕ Telegram заголовки (только специфичные)
  const strictTelegramHeaders = [
    'x-telegram-bot-api-secret-token',
    'x-telegram-app'
  ];
  
  for (const header of strictTelegramHeaders) {
    const value = request.headers.get(header);
    if (value) {
      console.log(`[TG Detection v14] STRICT Telegram header: ${header}=${value}`);
      return true;
    }
  }
  
  // Если ни одна СТРОГАЯ проверка не сработала - это НЕ Telegram
  console.log(`[TG Detection v14] NOT Telegram - все строгие проверки v14 не прошли`);
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
    console.log(`[Middleware v14] Special bypass detected for ${pathname} - serving as is`);
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ /tg-redirect и /tg-debug страницы
  if (pathname.startsWith('/tg-redirect') || pathname.startsWith('/tg-debug')) {
    console.log(`[Middleware v14] Serving redirect/debug page as is: ${pathname}`);
    return NextResponse.next();
  }
  
  // ✅ ОСНОВНАЯ ЛОГИКА: определяем Telegram клиент (строгая v14)
  const isTelegram = isTelegramRequest(request);
  
  console.log(`[Middleware v14] ФИНАЛЬНОЕ РЕШЕНИЕ для ${pathname}:`, {
    isTelegram,
    decision: isTelegram ? 'ПРОПУСТИТЬ' : 'РЕДИРЕКТ_НА_TG_REDIRECT'
  });
  
  // ✅ Если это НЕ Telegram запрос на /tg - перенаправляем на /tg-redirect  
  if (!isTelegram) {
    console.log(`[Middleware v14] Non-Telegram request to ${pathname}, redirecting to /tg-redirect`);
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
  console.log(`[Middleware v14] Telegram client detected - allowing access to ${pathname}`);
  
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