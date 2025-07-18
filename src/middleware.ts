import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ✅ HYBRID MIDDLEWARE v15 - ФИНАЛЬНОЕ РЕШЕНИЕ
 * 
 * КРИТИЧЕСКИЕ УЛУЧШЕНИЯ v15:
 * - 3-уровневая система детекции
 * - JavaScript runtime детекция для спорных случаев
 * - Промежуточная страница /tg-detect для надежной проверки
 * - Обновленные User-Agent паттерны (2024-2025)
 */

/**
 * ✅ УРОВЕНЬ 1: ПАРАМЕТРИЧЕСКАЯ ДЕТЕКЦИЯ (100% надежность)
 */
function hasExplicitTelegramParams(request: NextRequest): boolean {
  const url = request.nextUrl;
  
  // Явные Telegram параметры из официальной документации
  const telegramParams = [
    'startapp',           // Основной параметр для Mini Apps
    'start_param',        // Альтернативный старт параметр
    'tgWebAppData',       // Init data в URL
    'tgWebAppVersion',    // Версия WebApp API
    'tgWebAppStartParam', // Параметр запуска
    'tgWebAppPlatform',   // Платформа (ios/android/web/desktop)
    'tgWebAppThemeParams',// Параметры темы
    'tg',                 // Принудительный обход
    'telegram',           // Альтернативный обход
    '_telegramApp'        // Внутренний маркер
  ];
  
  for (const param of telegramParams) {
    if (url.searchParams.has(param)) {
      const value = url.searchParams.get(param);
      console.log(`[TG Detection v15] ✅ LEVEL 1 - Explicit Telegram parameter: ${param}=${value}`);
      return true;
    }
  }
  
  return false;
}

/**
 * ✅ УРОВЕНЬ 2: USER-AGENT ДЕТЕКЦИЯ (обновленные паттерны 2024-2025)
 */
function hasTelegramUserAgent(request: NextRequest): boolean {
  const userAgentString = request.headers.get('user-agent') || '';
  
  // Обновленные паттерны на основе официальной документации
  const patterns = [
    // Android (официальный формат): Telegram-Android/{version} ({device}; Android {version}; SDK {version}; {performance})
    /Telegram-Android\/[\d.]+/,
    
    // iOS (официальный формат): Safari/{version} Telegram {version}  
    /Safari\/[\d.]+ Telegram [\d.]+/,
    
    // Desktop patterns (различные варианты)
    /TelegramDesktop/i,
    /tdesktop/i,
    
    // Bot API requests
    /^TelegramBot/,
    
    // WebView patterns (более осторожные)
    /Telegram.*WebView/i,
    /TelegramWebview/i
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    if (patterns[i].test(userAgentString)) {
      console.log(`[TG Detection v15] ✅ LEVEL 2 - User-Agent pattern ${i + 1} matched`);
      return true;
    }
  }
  
  return false;
}

/**
 * ✅ УРОВЕНЬ 3: СТРОГИЕ ЗАГОЛОВКИ И REFERER
 */
function hasTelegramHeaders(request: NextRequest): boolean {
  const referer = request.headers.get('referer') || '';
  
  // Строгие Telegram заголовки
  const telegramHeaders = [
    'x-telegram-bot-api-secret-token',
    'x-telegram-app',
    'x-telegram-init-data'
  ];
  
  for (const header of telegramHeaders) {
    const value = request.headers.get(header);
    if (value) {
      console.log(`[TG Detection v15] ✅ LEVEL 3 - Telegram header: ${header}`);
      return true;
    }
  }
  
  // Строгие referer паттерны
  const strictRefererPatterns = [
    'tg://',
    't.me/',
    'telegram.org',
    'web.telegram.org'
  ];
  
  for (const pattern of strictRefererPatterns) {
    if (referer.includes(pattern)) {
      console.log(`[TG Detection v15] ✅ LEVEL 3 - Referer pattern: ${pattern}`);
      return true;
    }
  }
  
  return false;
}

/**
 * ✅ КОМПЛЕКСНАЯ ДЕТЕКЦИЯ TELEGRAM
 */
function isTelegramRequest(request: NextRequest): 'CONFIRMED' | 'UNKNOWN' | 'NOT_TELEGRAM' {
  const userAgentString = request.headers.get('user-agent') || '';
  const url = request.nextUrl;
  
  console.log(`[Middleware v15] Анализ запроса:`, {
    userAgent: userAgentString.substring(0, 80) + '...',
    pathname: url.pathname,
    searchParams: Object.fromEntries(url.searchParams.entries())
  });
  
  // УРОВЕНЬ 1: Параметрическая детекция (100% надежность)
  if (hasExplicitTelegramParams(request)) {
    console.log(`[TG Detection v15] ✅ CONFIRMED via Level 1 (Parameters)`);
    return 'CONFIRMED';
  }
  
  // УРОВЕНЬ 2: User-Agent детекция
  if (hasTelegramUserAgent(request)) {
    console.log(`[TG Detection v15] ✅ CONFIRMED via Level 2 (User-Agent)`);
    return 'CONFIRMED';
  }
  
  // УРОВЕНЬ 3: Заголовки и referer
  if (hasTelegramHeaders(request)) {
    console.log(`[TG Detection v15] ✅ CONFIRMED via Level 3 (Headers/Referer)`);
    return 'CONFIRMED';
  }
  
  // АНАЛИЗ НЕОПРЕДЕЛЕННЫХ СЛУЧАЕВ
  // Если это может быть Telegram Desktop (Chrome-like UA, но без явных признаков)
  const isLikelyDesktop = userAgentString.includes('Chrome') && 
                          userAgentString.includes('Safari') &&
                          !userAgentString.includes('Mobile') &&
                          (userAgentString.includes('Windows') || userAgentString.includes('macOS') || userAgentString.includes('Linux'));
  
  if (isLikelyDesktop) {
    console.log(`[TG Detection v15] 🤔 UNKNOWN - Possible Telegram Desktop, needs JavaScript detection`);
    return 'UNKNOWN';
  }
  
  // Если это мобильный браузер без явных признаков
  const isMobile = userAgentString.includes('Mobile') || userAgentString.includes('Android') || userAgentString.includes('iPhone');
  if (isMobile) {
    console.log(`[TG Detection v15] 🤔 UNKNOWN - Mobile browser, needs JavaScript detection`);
    return 'UNKNOWN';
  }
  
  console.log(`[TG Detection v15] ❌ NOT_TELEGRAM - Все проверки провалены`);
  return 'NOT_TELEGRAM';
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // ✅ ОБРАБАТЫВАЕМ ТОЛЬКО /tg ПУТИ
  if (!pathname.startsWith('/tg')) {
    return NextResponse.next();
  }
  
  // ✅ СПЕЦИАЛЬНЫЕ ОБХОДЫ для отладки и служебных страниц
  const url = request.nextUrl;
  if (
    url.searchParams.has('_forceBrowser') ||
    url.searchParams.has('_fromTelegram') ||
    url.searchParams.has('_browser') ||
    url.searchParams.has('_redirected') ||
    url.searchParams.has('_noRedirect') ||
    url.searchParams.has('_debug') ||
    url.searchParams.has('_detected')
  ) {
    console.log(`[Middleware v15] Special bypass detected for ${pathname} - serving as is`);
    return NextResponse.next();
  }
  
  // ✅ ПРОПУСКАЕМ служебные страницы
  if (pathname.startsWith('/tg-redirect') || 
      pathname.startsWith('/tg-debug') || 
      pathname.startsWith('/tg-detect')) {
    console.log(`[Middleware v15] Serving utility page as is: ${pathname}`);
    return NextResponse.next();
  }
  
  // ✅ ОСНОВНАЯ ЛОГИКА: определяем Telegram клиент
  const detectionResult = isTelegramRequest(request);
  
  console.log(`[Middleware v15] DETECTION RESULT для ${pathname}:`, {
    result: detectionResult,
    nextAction: detectionResult === 'CONFIRMED' ? 'ALLOW' : 
                detectionResult === 'UNKNOWN' ? 'DETECT_PAGE' : 
                'REDIRECT_TO_TG_REDIRECT'
  });
  
  // ✅ CONFIRMED - пропускаем запрос
  if (detectionResult === 'CONFIRMED') {
    console.log(`[Middleware v15] ✅ Telegram client confirmed - allowing access to ${pathname}`);
    
    const response = NextResponse.next();
    
    // Отключаем кэширование для динамических страниц
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }
  
  // ✅ UNKNOWN - перенаправляем на JavaScript детекцию
  if (detectionResult === 'UNKNOWN') {
    console.log(`[Middleware v15] 🤔 Unknown client - redirecting to JavaScript detection page`);
    
    const detectUrl = new URL('/tg-detect', request.url);
    
    // Сохраняем оригинальный путь
    detectUrl.searchParams.set('redirect', pathname);
    
    // Сохраняем start параметры
    const startParam = url.searchParams.get('startapp') || 
                      url.searchParams.get('start') || 
                      url.searchParams.get('startParam');
    
    if (startParam) {
      detectUrl.searchParams.set('startapp', startParam);
    }
    
    // Передаем все остальные параметры
    url.searchParams.forEach((value, key) => {
      if (!detectUrl.searchParams.has(key)) {
        detectUrl.searchParams.set(key, value);
      }
    });
    
    return NextResponse.redirect(detectUrl);
  }
  
  // ✅ NOT_TELEGRAM - перенаправляем на /tg-redirect  
  console.log(`[Middleware v15] ❌ Non-Telegram request to ${pathname}, redirecting to /tg-redirect`);
  
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

export const config = {
  // ✅ ПРИМЕНЯЕМ ТОЛЬКО К /tg ПУТЯМ
  matcher: ['/tg/:path*'],
};
