'use client';

import { logger } from '@/utils/logger';

/**
 * TELEGRAM SDK SERVICE - АДАПТИРОВАННЫЙ ДЛЯ 3GIS v3.x
 * 
 * ✅ СОВМЕСТИМОСТЬ: Этот сервис полностью совместим с @telegram-apps/sdk v3.x
 * ✅ НЕ КОНФЛИКТУЕТ: Использует только нативный Telegram WebApp API
 * ✅ ДОПОЛНЯЕТ: Работает параллельно с основным useTelegramSDK хуком
 * 
 * НАЗНАЧЕНИЕ:
 * - Простая обертка над нативными Telegram WebApp методами
 * - Fallback для случаев, когда SDK хуки недоступны
 * - Утилитарные методы, которых нет в основном SDK
 * 
 * ИСПОЛЬЗОВАНИЕ:
 * - Можно использовать совместно с @telegram-apps/sdk-react хуками
 * - Не требует дополнительной инициализации через init()
 * - Безопасен для вызова в любом контексте
 */
class TelegramSDKService {
  private static instance: TelegramSDKService;
  private initialized = false;

  private constructor() {}

  public static getInstance(): TelegramSDKService {
    if (!TelegramSDKService.instance) {
      TelegramSDKService.instance = new TelegramSDKService();
    }
    return TelegramSDKService.instance;
  }

  /**
   * Инициализация сервиса для 3GIS
   */
  public initialize(): boolean {
    if (this.initialized) {
      return true;
    }

    try {
      logger.logTelegram('3GIS TelegramSDKService initialized for v3.x');
      this.initialized = true;
      return true;
    } catch (error) {
      logger.error('Failed to initialize 3GIS TelegramSDKService:', error);
      return false;
    }
  }

  // ==================== ОСНОВНЫЕ МЕТОДЫ ====================

  /**
   * Отправить сигнал готовности
   */
  public ready(): boolean {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.ready) {
        window.Telegram.WebApp.ready();
        logger.logTelegram('3GIS Ready signal sent');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error sending ready signal:', error);
      return false;
    }
  }

  /**
   * Развернуть приложение
   */
  public expand(): boolean {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.expand) {
        window.Telegram.WebApp.expand();
        logger.logTelegram('3GIS App expanded');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error expanding app:', error);
      return false;
    }
  }

  /**
   * Закрыть приложение
   */
  public close(): boolean {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.close) {
        window.Telegram.WebApp.close();
        logger.logTelegram('3GIS App closed');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error closing app:', error);
      return false;
    }
  }

  // ==================== ДАННЫЕ ====================

  /**
   * Получить данные пользователя
   */
  public getUser(): any {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
        return window.Telegram.WebApp.initDataUnsafe.user;
      }
      return null;
    } catch (error) {
      logger.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Получить сырые init данные
   */
  public getInitData(): string {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
        return window.Telegram.WebApp.initData;
      }
      return '';
    } catch (error) {
      logger.error('Error getting init data:', error);
      return '';
    }
  }

  /**
   * Получить все init данные в объекте
   */
  public getInitDataUnsafe(): any {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe) {
        return window.Telegram.WebApp.initDataUnsafe;
      }
      return null;
    } catch (error) {
      logger.error('Error getting init data unsafe:', error);
      return null;
    }
  }

  // ==================== ТЕМА ====================

  /**
   * Получить параметры темы
   */
  public getThemeParams(): any {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.themeParams) {
        const theme = window.Telegram.WebApp.themeParams;
        return {
          bgColor: theme.bg_color || '#ffffff',
          textColor: theme.text_color || '#000000',
          hintColor: theme.hint_color || '#999999',
          linkColor: theme.link_color || '#2481cc',
          buttonColor: theme.button_color || '#3B82F6', // Синий для 3GIS
          buttonTextColor: theme.button_text_color || '#ffffff',
          secondaryBgColor: theme.secondary_bg_color || '#f0f0f0',
        };
      }
      
      // Fallback значения для 3GIS
      return {
        bgColor: '#ffffff',
        textColor: '#000000',
        hintColor: '#999999',
        linkColor: '#3B82F6', // Синий акцент 3GIS
        buttonColor: '#3B82F6',
        buttonTextColor: '#ffffff',
        secondaryBgColor: '#f0f0f0',
      };
    } catch (error) {
      logger.error('Error getting theme params:', error);
      return {
        bgColor: '#ffffff',
        textColor: '#000000',
        hintColor: '#999999',
        linkColor: '#3B82F6',
        buttonColor: '#3B82F6',
        buttonTextColor: '#ffffff',
        secondaryBgColor: '#f0f0f0',
      };
    }
  }

  /**
   * Применить цвета темы к документу для 3GIS
   */
  public applyThemeToDocument(): void {
    try {
      const theme = this.getThemeParams();
      
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--tg-bg-color', theme.bgColor);
        document.documentElement.style.setProperty('--tg-text-color', theme.textColor);
        document.documentElement.style.setProperty('--tg-hint-color', theme.hintColor);
        document.documentElement.style.setProperty('--tg-link-color', theme.linkColor);
        document.documentElement.style.setProperty('--tg-button-color', theme.buttonColor);
        document.documentElement.style.setProperty('--tg-button-text-color', theme.buttonTextColor);
        document.documentElement.style.setProperty('--tg-secondary-bg-color', theme.secondaryBgColor);
        
        // 3GIS специфичные цвета
        document.documentElement.style.setProperty('--threegis-accent', theme.linkColor);
        document.documentElement.style.setProperty('--threegis-text', theme.textColor);
        document.documentElement.style.setProperty('--threegis-secondary', theme.hintColor);
        
        logger.logTelegram('3GIS Theme colors applied to document');
      }
    } catch (error) {
      logger.error('Error applying theme to document:', error);
    }
  }

  // ==================== КНОПКИ ====================

  /**
   * Настроить главную кнопку
   */
  public setupMainButton(params: {
    text?: string;
    color?: string;
    textColor?: string;
    isVisible?: boolean;
    isActive?: boolean;
    onClick?: () => void;
  }): () => void {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.MainButton) {
        const mainButton = window.Telegram.WebApp.MainButton;

        if (params.text) {
          mainButton.setText(params.text);
        }

        if (params.isVisible) {
          mainButton.show();
        } else if (params.isVisible === false) {
          mainButton.hide();
        }

        let cleanup = () => {};

        if (params.onClick) {
          mainButton.onClick(params.onClick);
          cleanup = () => {
            mainButton.offClick(params.onClick!);
          };
        }

        logger.logTelegram('3GIS Main button configured');
        return cleanup;
      }
      return () => {};
    } catch (error) {
      logger.error('Error setting up main button:', error);
      return () => {};
    }
  }

  /**
   * Настроить кнопку назад
   */
  public setupBackButton(isVisible: boolean, onBackClick?: () => void): () => void {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.BackButton) {
        const backButton = window.Telegram.WebApp.BackButton;

        if (isVisible) {
          backButton.show();
        } else {
          backButton.hide();
        }

        let cleanup = () => {};

        if (onBackClick) {
          backButton.onClick(onBackClick);
          cleanup = () => {
            backButton.offClick(onBackClick);
          };
        }

        logger.logTelegram('3GIS Back button configured');
        return cleanup;
      }
      return () => {};
    } catch (error) {
      logger.error('Error setting up back button:', error);
      return () => {};
    }
  }

  // ==================== HAPTIC FEEDBACK ====================

  /**
   * Вибрация
   */
  public hapticFeedback(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium'): boolean {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback?.impactOccurred) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
        logger.logTelegram(`3GIS Haptic feedback ${style}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error triggering haptic feedback:', error);
      return false;
    }
  }

  /**
   * Уведомление вибрация
   */
  public hapticNotification(type: 'error' | 'success' | 'warning' = 'success'): boolean {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
        logger.logTelegram(`3GIS Haptic notification ${type}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error triggering haptic notification:', error);
      return false;
    }
  }

  // ==================== НАВИГАЦИЯ И ССЫЛКИ ====================

  /**
   * Открыть бота 3GIS в Telegram
   */
  public openBotInTelegram(): boolean {
    try {
      if (typeof window !== 'undefined') {
        // Получаем имя бота 3GIS из переменных окружения
        const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'ThreeGIS_bot';
        const telegramUrl = `https://t.me/${botUsername}/app`;
        
        // Пытаемся открыть через Telegram API, если доступно
        if (window.Telegram?.WebApp?.openTelegramLink) {
          window.Telegram.WebApp.openTelegramLink(telegramUrl);
          logger.logTelegram('3GIS Bot opened via Telegram API');
          return true;
        }
        
        // Fallback - открываем в новом окне
        window.open(telegramUrl, '_blank');
        logger.logTelegram('3GIS Bot opened via window.open fallback');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error opening 3GIS bot in Telegram:', error);
      return false;
    }
  }

  /**
   * Открыть ссылку
   */
  public openLink(url: string): boolean {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openLink) {
        window.Telegram.WebApp.openLink(url);
        logger.logTelegram('Link opened via Telegram API');
        return true;
      }
      
      // Fallback
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error opening link:', error);
      return false;
    }
  }

  // ==================== ОТПРАВКА ДАННЫХ ====================

  /**
   * Отправить данные в Telegram
   */
  public sendData(data: any): boolean {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.sendData) {
        const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
        window.Telegram.WebApp.sendData(dataStr);
        logger.logTelegram('3GIS Data sent');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error sending data:', error);
      return false;
    }
  }

  // ==================== ПРОВЕРКИ ДОСТУПНОСТИ ====================

  /**
   * Проверить, доступен ли Telegram
   */
  public isAvailable(): boolean {
    return typeof window !== 'undefined' && 
           !!window.Telegram && 
           !!window.Telegram.WebApp;
  }

  /**
   * Проверить минимальную версию WebApp
   * ОБНОВЛЕНО ДЛЯ 2025: проверяем фактическую версию и доступность методов
   */
  public isVersionAtLeast(version: string): boolean {
    try {
      if (!this.isAvailable()) {
        return false;
      }

      const targetVersion = parseFloat(version);
      
      // Проверяем фактическую версию через version свойство
      const webApp = window.Telegram?.WebApp;
      if (webApp?.version) {
        const currentVersion = parseFloat(webApp.version);
        logger.logTelegram(`3GIS: WebApp version check: ${currentVersion} >= ${targetVersion}`);
        return currentVersion >= targetVersion;
      }
      
      // Fallback: проверяем доступность конкретных методов
      if (targetVersion <= 6.0) {
        // Базовые возможности доступны во всех версиях
        return true;
      } else if (targetVersion <= 6.1) {
        // BackButton появился в 6.1
        return !!webApp?.BackButton;
      } else if (targetVersion <= 6.2) {
        // HapticFeedback появился в 6.2
        return !!webApp?.HapticFeedback;
      } else if (targetVersion <= 6.4) {
        // BiometricManager появился в 6.4
        return !!webApp?.BiometricManager;
      } else if (targetVersion <= 6.7) {
        // CloudStorage появился в 6.7
        return !!webApp?.CloudStorage;
      }
      
      // Для новых версий (7.0+) считаем поддерживаемыми
      return true;
    } catch (error) {
      logger.error('Error checking WebApp version:', error);
      return false;
    }
  }
  
  /**
   * Получить текущую версию WebApp
   */
  public getVersion(): string {
    try {
      if (this.isAvailable() && window.Telegram?.WebApp?.version) {
        return window.Telegram.WebApp.version;
      }
      // Fallback - возвращаем 6.0 как минимальную поддерживаемую
      return '6.0';
    } catch (error) {
      logger.error('Error getting WebApp version:', error);
      return '6.0';
    }
  }

  /**
   * Проверить Premium статус пользователя
   */
  public isPremiumUser(): boolean {
    try {
      const user = this.getUser();
      return user?.is_premium || false;
    } catch (error) {
      logger.error('Error checking premium status:', error);
      return false;
    }
  }

  // ==================== ШАРИНГ ====================

  /**
   * Универсальный метод шаринга для 3GIS
   */
  public share(params: {
    text: string;
    url?: string;
    title?: string;
    type?: 'story' | 'contacts' | 'general';
  }): boolean {
    try {
      if (!this.isAvailable()) {
        return false;
      }

      // Для обычного шаринга используем нативные методы
      if (params.url && typeof window !== 'undefined') {
        const shareText = `${params.text}\n\n🗺️ 3GIS - Твой проводник в Америке`;
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(params.url)}&text=${encodeURIComponent(shareText)}`;
        window.open(telegramUrl, '_blank');
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error sharing:', error);
      return false;
    }
  }

  /**
   * Поделиться заведением из 3GIS
   */
  public shareBusiness(business: {
    name: string;
    address: string;
    category: string;
    id: number;
  }): boolean {
    try {
      const shareText = `🏢 ${business.name}\n📍 ${business.address}\n🔗 Найдено в 3GIS`;
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/tg/business/${business.id}`;
      
      return this.share({
        text: shareText,
        url: shareUrl,
        title: `${business.name} в 3GIS`
      });
    } catch (error) {
      logger.error('Error sharing business:', error);
      return false;
    }
  }
}

// Экспортируем singleton
export const telegramSDKService = TelegramSDKService.getInstance();
export default telegramSDKService;