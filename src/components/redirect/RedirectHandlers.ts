import { openTelegramLink, openLink } from '@telegram-apps/sdk';

export interface RedirectHandlers {
  handleTelegramRedirect: () => void;
  tryOpenMiniApp: () => Promise<void>;
  handleManualClick: () => void;
}

export interface RedirectConfig {
  startParam: string;
  botUsername: string;
  appName: string;
  launchParams?: any;
  environmentType: 'browser' | 'telegram-web' | 'mini-app';
  redirectAttempted: boolean;
  setRedirectAttempted: (value: boolean) => void;
}

/**
 * ✅ Хуки для обработки различных типов редиректов
 */
export function createRedirectHandlers(config: RedirectConfig): RedirectHandlers {
  const {
    startParam,
    botUsername,
    appName,
    launchParams,
    environmentType,
    redirectAttempted,
    setRedirectAttempted
  } = config;

  const handleTelegramRedirect = () => {
    if (redirectAttempted) return;
    
    setRedirectAttempted(true);
    
    const actualStartParam = startParam || launchParams?.tgWebAppStartParam || '';
    
    const telegramUrl = actualStartParam 
      ? `https://t.me/${botUsername}/${appName}?startapp=${encodeURIComponent(actualStartParam)}`
      : `https://t.me/${botUsername}/${appName}`;
    
    console.log('🚀 Выполняем редирект в Telegram:', {
      url: telegramUrl,
      startParam: actualStartParam,
      method: 'window.location.href',
      environmentType
    });
    
    try {
      window.location.href = telegramUrl;
    } catch (error) {
      console.error('❌ Ошибка редиректа:', error);
      window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const tryOpenMiniApp = async () => {
    try {
      const actualStartParam = startParam || launchParams?.tgWebAppStartParam || '';
      const miniAppUrl = actualStartParam 
        ? `https://t.me/${botUsername}/${appName}?startapp=${encodeURIComponent(actualStartParam)}`
        : `https://t.me/${botUsername}/${appName}`;
      
      console.log('🚀 Попытка открытия через @telegram-apps/sdk');
      
      // Попытка 1: SDK openTelegramLink
      if (openTelegramLink.isAvailable()) {
        openTelegramLink(miniAppUrl);
        console.log('✅ openTelegramLink (SDK) выполнен:', miniAppUrl);
        return;
      }
      
      // Попытка 2: SDK openLink
      if (openLink.isAvailable()) {
        openLink(miniAppUrl);
        console.log('✅ openLink (SDK) выполнен:', miniAppUrl);
        return;
      }
      
      // Попытка 3: Telegram WebApp API
      const webApp = (window as any)?.Telegram?.WebApp;
      if (webApp) {
        console.log('🔄 Fallback на Telegram WebApp API');
        
        if (webApp.openTelegramLink) {
          webApp.openTelegramLink(miniAppUrl);
          console.log('✅ webApp.openTelegramLink выполнен:', miniAppUrl);
          return;
        }
        
        if (webApp.openLink) {
          webApp.openLink(miniAppUrl);
          console.log('✅ webApp.openLink выполнен:', miniAppUrl);
          return;
        }
      }
      
      // Попытка 4: Прямой редирект
      console.log('🔄 Fallback на прямой редирект');
      window.location.href = miniAppUrl;
      console.log('✅ Прямой редирект выполнен:', miniAppUrl);
      
    } catch (error) {
      console.error('❌ Ошибка автоматического открытия Mini App:', error);
      handleTelegramRedirect();
    }
  };

  const handleManualClick = () => {
    console.log('📊 Мануальный клик по кнопке редиректа');
    if (environmentType === 'telegram-web') {
      tryOpenMiniApp();
    } else {
      handleTelegramRedirect();
    }
  };

  return {
    handleTelegramRedirect,
    tryOpenMiniApp,
    handleManualClick
  };
}
