/**
 * ✅ ИСПРАВЛЕННЫЙ детектор среды для предотвращения бесконечных циклов
 */

export type EnvironmentType = 'browser' | 'telegram-web' | 'mini-app';

export interface EnvironmentInfo {
  type: EnvironmentType;
  userAgent: string;
  pathname: string;
  isRedirectPage: boolean;
  hasTelegramWebApp: boolean;
  isRealMiniApp: boolean;
  webAppVersion?: string;
  webAppInitData: boolean;
}

/**
 * ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Правильное определение среды
 * - На странице /tg-redirect НЕ может быть Mini App
 * - Проверяем ТОЛЬКО реально инициализированные Mini App
 * - Предотвращаем ложные срабатывания
 */
export function detectEnvironment(launchParams?: any): EnvironmentInfo {
  if (typeof window === 'undefined') {
    return {
      type: 'browser',
      userAgent: '',
      pathname: '',
      isRedirectPage: false,
      hasTelegramWebApp: false,
      isRealMiniApp: false,
      webAppInitData: false
    };
  }
  
  const ua = navigator.userAgent;
  const searchParams = new URLSearchParams(window.location.search);
  const pathname = window.location.pathname;
  
  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: ТОЛЬКО РЕАЛЬНАЯ проверка Mini App
  const hasTelegramWebApp = !!(window as any)?.Telegram?.WebApp;
  const webApp = (window as any)?.Telegram?.WebApp;
  
  // ✅ Проверяем что Mini App ДЕЙСТВИТЕЛЬНО инициализирован и готов
  const isRealMiniApp = hasTelegramWebApp && 
                       webApp && 
                       webApp.initData && 
                       webApp.version &&
                       typeof webApp.ready === 'function';
  
  // ✅ ВАЖНО: Если это СТРАНИЦА TG-REDIRECT, то НЕ считаем это Mini App
  const isRedirectPage = pathname === '/tg-redirect';
  
  const info: EnvironmentInfo = {
    type: 'browser',
    userAgent: ua,
    pathname,
    isRedirectPage,
    hasTelegramWebApp,
    isRealMiniApp,
    webAppVersion: webApp?.version,
    webAppInitData: !!webApp?.initData
  };
  
  console.log('🔍 Environment Detection (исправлено):', {
    userAgent: ua.substring(0, 60) + '...',
    pathname,
    isRedirectPage,
    hasTelegramWebApp,
    isRealMiniApp,
    webAppVersion: webApp?.version,
    webAppInitData: webApp?.initData ? 'есть' : 'нет',
    launchParams: launchParams ? 'есть' : 'нет'
  });
  
  // ✅ ИСПРАВЛЕННАЯ ЛОГИКА: на странице редиректа НЕ может быть Mini App
  if (isRedirectPage) {
    console.log('🚨 Redirect page detected - НЕ Mini App');
    
    // Проверяем Telegram браузер (но НЕ Mini App)
    const isTelegramBrowser = 
      ua.includes('TelegramBot') || 
      ua.includes('Telegram/') ||
      ua.includes('tgWebApp') ||
      ua.includes('TgWebView') ||
      searchParams.has('tgWebAppData') ||
      searchParams.has('tgWebAppVersion');
    
    info.type = isTelegramBrowser ? 'telegram-web' : 'browser';
    return info;
  }
  
  // ✅ Только для НЕ-redirect страниц проверяем Mini App
  if (isRealMiniApp) {
    info.type = 'mini-app';
    return info;
  }
  
  // Обычный браузер
  info.type = 'browser';
  return info;
}
