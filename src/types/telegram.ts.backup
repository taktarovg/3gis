// src/types/telegram.ts
// ✅ Официальные типы для Telegram SDK v3.x

import type { 
  LaunchParams, 
  InitData, 
  User as TelegramSDKUser 
} from '@telegram-apps/sdk';

/**
 * ✅ ИСПРАВЛЕННЫЕ типы для Telegram SDK v3.x
 * Основаны на официальной документации: https://docs.telegram-mini-apps.com/
 */

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

/**
 * ✅ SDK v3.x Context Value - ТОЧНОЕ соответствие TelegramProvider
 * Исправлено: убрано rawInitData (используется отдельный хук useRawInitData)
 */
export interface TelegramContextValue {
  isReady: boolean;
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isTelegramEnvironment: boolean;
  error: string | null;
  launchParams: LaunchParams | null;
  webApp: any | null;
  sdkVersion: string;
  // ❌ УДАЛЕНО в v3.x: rawInitData - используйте useRawInitData() хук
}

/**
 * ✅ Глобальный Telegram Web App API (window.Telegram.WebApp)
 */
export interface TelegramWebApp {
  version: string;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  
  // User data
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
    start_param?: string;
  };
  
  // Theme
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  
  // Methods
  ready(): void;
  expand(): void;
  close(): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback: (confirmed: boolean) => void): void;
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }, callback?: (buttonId: string) => void): void;
  
  // Navigation
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  onEvent(eventType: string, eventHandler: Function): void;
  offEvent(eventType: string, eventHandler: Function): void;
  sendData(data: string): void;
  openLink(url: string): void;
  openTelegramLink(url: string): void;
  
  // UI elements
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    isActive: boolean;
    onClick(callback: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    setText(text: string): void;
    setParams(params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }): void;
  };
  
  BackButton: {
    isVisible: boolean;
    onClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };
  
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  
  // Payments (Telegram Stars)
  invoices?: {
    open(url: string, callback?: (status: string) => void): void;
  };
}

/**
 * ✅ Environment Detection Results
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
 * ✅ Telegram Global Window Interface
 */
declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

/**
 * ✅ Re-export основных типов от SDK для удобства
 */
export type { LaunchParams, InitData, TelegramSDKUser };
