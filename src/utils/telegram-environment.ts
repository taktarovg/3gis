// src/utils/telegram-environment.ts

/**
 * ✅ Утилиты для определения Telegram среды и обработки deep linking
 * Решает проблему LaunchParamsRetrieveError в браузере
 */

interface TelegramEnvironmentDetection {
  isTelegramEnvironment: boolean;
  confidence: number;
  checks: Record<string, boolean>;
  userAgent: string;
  reasons: string[];
}

/**
 * ✅ Комплексное определение Telegram среды
 * Использует множественные проверки для максимальной точности
 */
export function detectTelegramEnvironment(): TelegramEnvironmentDetection {
  if (typeof window === 'undefined') {
    return {
      isTelegramEnvironment: false,
      confidence: 0,
      checks: {},
      userAgent: '',
      reasons: ['Server-side rendering']
    };
  }

  const ua = navigator.userAgent;
  const urlParams = new URLSearchParams(window.location.search);
  const reasons: string[] = [];
  
  // ✅ Множественные проверки для определения Telegram среды
  const checks = {
    // Проверка 1: Telegram WebApp объект доступен
    hasWebApp: !!(window as any)?.Telegram?.WebApp,
    
    // Проверка 2: initData присутствует в WebApp
    hasInitData: !!(window as any)?.Telegram?.WebApp?.initData,
    
    // Проверка 3: WebApp версия определена
    hasWebAppVersion: !!(window as any)?.Telegram?.WebApp?.version,
    
    // Проверка 4: URL содержит параметры от Telegram
    hasWebAppParams: urlParams.has('tgWebAppData') || 
                    urlParams.has('tgWebAppVersion') || 
                    urlParams.has('tgWebAppPlatform'),
    
    // Проверка 5: User Agent содержит Telegram идентификаторы
    hasTelegramUA: ua.includes('TelegramBot') || 
                  ua.includes('Telegram-') ||
                  ua.includes('tgWebApp'),
    
    // Проверка 6: URL содержит tgWebApp в pathname или search
    hasWebAppInUrl: window.location.href.includes('tgWebApp') ||
                   window.location.search.includes('tgWebApp'),
    
    // Проверка 7: Referrer от Telegram доменов
    hasTelegramReferrer: document.referrer.includes('telegram.org') ||
                        document.referrer.includes('t.me'),
    
    // Проверка 8: WebApp platform определена
    hasWebAppPlatform: !!(window as any)?.Telegram?.WebApp?.platform,
    
    // Проверка 9: WebApp isExpanded доступно
    hasWebAppExpanded: typeof (window as any)?.Telegram?.WebApp?.isExpanded !== 'undefined'
  };

  // ✅ Подсчет положительных проверок и генерация reasons
  let positiveChecks = 0;
  Object.entries(checks).forEach(([key, value]) => {
    if (value) {
      positiveChecks++;
      reasons.push(`✅ ${key}: ${value}`);
    } else {
      reasons.push(`❌ ${key}: false`);
    }
  });

  // ✅ Определение уверенности на основе количества положительных проверок
  const totalChecks = Object.keys(checks).length;
  const confidence = positiveChecks / totalChecks;
  
  // ✅ Считаем что в Telegram если:
  // - Есть WebApp объект И initData (высокая уверенность)
  // - Или минимум 3 положительные проверки (средняя уверенность)
  const highConfidence = checks.hasWebApp && checks.hasInitData;
  const mediumConfidence = positiveChecks >= 3;
  const isTelegramEnvironment = highConfidence || mediumConfidence;

  if (highConfidence) {
    reasons.push('🎯 HIGH CONFIDENCE: WebApp + initData detected');
  } else if (mediumConfidence) {
    reasons.push(`🔍 MEDIUM CONFIDENCE: ${positiveChecks}/${totalChecks} checks passed`);
  } else {
    reasons.push(`⚠️ LOW CONFIDENCE: Only ${positiveChecks}/${totalChecks} checks passed`);
  }

  return {
    isTelegramEnvironment,
    confidence,
    checks,
    userAgent: ua,
    reasons
  };
}

/**
 * ✅ Генерация корректной ссылки для Telegram Mini App
 */
export function generateTelegramDeepLink(startParam?: string): string {
  const botUsername = 'ThreeGIS_bot';
  const appName = 'app';
  
  if (startParam) {
    return `https://t.me/${botUsername}/${appName}?startapp=${encodeURIComponent(startParam)}`;
  }
  
  return `https://t.me/${botUsername}/${appName}`;
}

/**
 * ✅ Попытка автоматического открытия в Telegram
 */
export function attemptTelegramOpen(startParam?: string, userAgent?: string): void {
  const telegramUrl = generateTelegramDeepLink(startParam);
  const ua = userAgent || navigator.userAgent;
  
  console.log('🔗 Attempting to open in Telegram:', telegramUrl);
  
  // ✅ Стратегия 1: Прямой переход (работает на десктопе и некоторых мобильных)
  const directRedirect = () => {
    try {
      window.location.href = telegramUrl;
    } catch (error) {
      console.error('Direct redirect failed:', error);
    }
  };
  
  // ✅ Стратегия 2: Невидимый iframe (для мобильных приложений)
  const iframeRedirect = () => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.src = telegramUrl;
      document.body.appendChild(iframe);
      
      // Удаляем iframe через секунду
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    } catch (error) {
      console.error('Iframe redirect failed:', error);
    }
  };
  
  // ✅ Стратегия 3: Создание временной ссылки
  const linkRedirect = () => {
    try {
      const link = document.createElement('a');
      link.href = telegramUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    } catch (error) {
      console.error('Link redirect failed:', error);
    }
  };
  
  // ✅ Выбираем стратегию в зависимости от платформы
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
    // Мобильные устройства: пробуем iframe, затем прямой редирект
    iframeRedirect();
    setTimeout(directRedirect, 1500);
  } else {
    // Десктоп: прямой редирект и ссылка как fallback
    setTimeout(directRedirect, 500);
    setTimeout(linkRedirect, 2000);
  }
}

/**
 * ✅ Извлечение startParam из различных источников
 */
export function extractStartParam(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Проверяем URL параметры
  const urlParams = new URLSearchParams(window.location.search);
  const startParam = urlParams.get('startapp') || urlParams.get('start') || urlParams.get('startParam');
  
  if (startParam) {
    return startParam;
  }
  
  // Проверяем hash параметры
  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashStartParam = hashParams.get('startapp') || hashParams.get('start');
    if (hashStartParam) {
      return hashStartParam;
    }
  }
  
  // Проверяем Telegram WebApp startParam
  try {
    const webApp = (window as any)?.Telegram?.WebApp;
    if (webApp?.initDataUnsafe?.start_parameter) {
      return webApp.initDataUnsafe.start_parameter;
    }
  } catch (error) {
    console.warn('Error extracting startParam from WebApp:', error);
  }
  
  return null;
}

/**
 * ✅ Безопасная проверка доступности Telegram WebApp API
 */
export function isTelegramWebAppAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const webApp = (window as any)?.Telegram?.WebApp;
    return !!(webApp && typeof webApp.ready === 'function');
  } catch (error) {
    console.warn('Error checking Telegram WebApp availability:', error);
    return false;
  }
}

/**
 * ✅ Логирование информации о среде для отладки
 */
export function logEnvironmentInfo(): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const detection = detectTelegramEnvironment();
  
  console.group('🔍 Telegram Environment Detection');
  console.log('Result:', detection.isTelegramEnvironment ? '✅ Telegram' : '❌ Browser');
  console.log('Confidence:', `${Math.round(detection.confidence * 100)}%`);
  console.log('User Agent:', detection.userAgent);
  console.log('Checks:', detection.checks);
  console.log('Reasons:', detection.reasons);
  
  if (isTelegramWebAppAvailable()) {
    const webApp = (window as any).Telegram.WebApp;
    console.log('WebApp Info:', {
      version: webApp.version,
      platform: webApp.platform,
      isExpanded: webApp.isExpanded,
      viewportHeight: webApp.viewportHeight,
      initData: webApp.initData ? 'Present' : 'Missing'
    });
  }
  
  console.groupEnd();
}
