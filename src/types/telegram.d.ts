// src/types/telegram.d.ts
// ✅ Обновленные типы для Telegram SDK v3.x
// Основано на официальной документации: https://docs.telegram-mini-apps.com/

/// <reference types="@telegram-apps/sdk" />
/// <reference types="@telegram-apps/sdk-react" />

/**
 * ✅ Пользователь Telegram (совместимо с SDK v3.x)
 */
export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

/**
 * ✅ Context Value для TelegramProvider (SDK v3.x)
 * ИСПРАВЛЕНО: убрано rawInitData - используется отдельный хук useRawInitData()
 */
export interface TelegramContextValue {
  isReady: boolean;
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isTelegramEnvironment: boolean;
  error: string | null;
  launchParams: any; // ✅ Используем any для совместимости SDK v3.x
  webApp: TelegramWebApp | undefined;
  sdkVersion: string;
  // ❌ УДАЛЕНО в v3.x: rawInitData - используйте useRawInitData() хук
}

/**
 * ✅ Глобальный Telegram WebApp API (совместимо со всеми версиями)
 */
export interface TelegramWebApp {
  // Основные данные
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: Date; // ✅ ИСПРАВЛЕНО: Date по документации SDK v3.x
    hash?: string;
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  
  // Тема
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
    accent_text_color?: string;
    destructive_text_color?: string;
    header_bg_color?: string;
    section_bg_color?: string;
    section_header_text_color?: string;
    subtitle_text_color?: string;
  };
  
  // Размеры и состояние
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  
  // UI Элементы
  BackButton: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
  
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    isActive: boolean;
    setText(text: string): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
    setParams(params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }): void;
  };
  
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  
  // Дополнительные компоненты (опциональные для совместимости)
  BiometricManager?: {
    isInited: boolean;
    biometricType: string;
    isAccessRequested: boolean;
    isAccessGranted: boolean;
    isBiometricAvailable: boolean;
    init(callback?: () => void): void;
    requestAccess(params: { reason?: string }, callback?: (granted: boolean) => void): void;
    authenticate(params: { reason?: string }, callback?: (success: boolean, biometricToken?: string) => void): void;
    updateBiometricToken(token: string, callback?: (updated: boolean) => void): void;
    openSettings(): void;
  };
  
  CloudStorage?: {
    setItem(key: string, value: string, callback?: (error: Error | null, result?: boolean) => void): void;
    getItem(key: string, callback?: (error: Error | null, result?: string) => void): void;
    getItems(keys: string[], callback?: (error: Error | null, result?: {[key: string]: string}) => void): void;
    removeItem(key: string, callback?: (error: Error | null, result?: boolean) => void): void;
    removeItems(keys: string[], callback?: (error: Error | null, result?: boolean) => void): void;
    getKeys(callback?: (error: Error | null, result?: string[]) => void): void;
  };
  
  // Основные методы
  ready(): void;
  expand(): void;
  close(): void;
  sendData(data: string): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void): void;
  
  // Диалоги
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }, callback?: (buttonId: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  showScanQrPopup(params: { text?: string }, callback?: (text: string) => void): void;
  closeScanQrPopup(): void;
  
  // Дополнительные методы
  requestWriteAccess(callback?: (granted: boolean) => void): void;
  requestContact(callback?: (shared: boolean) => void): void;
  readTextFromClipboard(callback?: (text: string) => void): void;
  requestFullscreen(): void;
  exitFullscreen(): void;
  lockOrientation(): void;
  unlockOrientation(): void;
  
  // События
  onEvent(eventType: string, eventHandler: (...args: any[]) => void): void;
  offEvent(eventType: string, eventHandler: (...args: any[]) => void): void;
  
  // Настройка внешнего вида
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  
  // Переключение режимов
  switchInlineQuery(query: string, choose_chat_types?: string[]): void;
}

/**
 * ✅ Environment Detection Types
 */
export type EnvironmentType = 'browser' | 'telegram-web' | 'mini-app';

export interface EnvironmentInfo {
  type: EnvironmentType;
  userAgent: string;
  platform: string;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  hasTelegramWebApp: boolean;
  webAppVersion?: string;
  urlParams: Record<string, string>;
}

/**
 * ✅ Глобальные типы для Window
 */
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
    google?: typeof google;
  }

  /**
   * ✅ Environment Variables типизация
   */
  namespace NodeJS {
    interface ProcessEnv {
      // Database
      DATABASE_URL: string;
      SUPABASE_URL: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      
      // Telegram
      NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: string;
      TELEGRAM_BOT_TOKEN: string;
      
      // Google Maps
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
      
      // Cloudinary
      CLOUDINARY_URL: string;
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
      
      // AWS S3
      AWS_REGION: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      S3_BUCKET_NAME: string;
      
      // Auth
      JWT_SECRET: string;
      
      // App config
      NEXT_PUBLIC_APP_URL: string;
      NEXT_PUBLIC_WEBSITE_NAME: string;
      NODE_ENV: 'development' | 'production' | 'test';
      
      // Feature flags
      SKIP_TELEGRAM_VALIDATION?: string;
      ENABLE_TELEGRAM_STARS?: string;
    }
  }
}

/**
 * ✅ Модуль расширения для Telegram SDK React v3.x
 * Только для устранения ошибок типизации
 */
declare module '@telegram-apps/sdk-react' {
  // ✅ Основные хуки с правильными типами
  export function useRawInitData(): string | undefined;
  export function useRawLaunchParams(): string | undefined;
}

/**
 * ✅ CSS Modules и Assets
 */
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

/**
 * ✅ Utility Libraries
 */
declare module 'use-debounce' {
  export function useDebounce<T>(value: T, delay: number): T;
  export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number,
    options?: {
      maxWait?: number;
      leading?: boolean;
      trailing?: boolean;
    }
  ): T;
}

// Экспорт для удобства использования (опционально)
export type { LaunchParams, InitData } from '@telegram-apps/sdk';
