// src/types/telegram.ts
// ✅ ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ файл типов для Telegram SDK v3.x
// Убраны все конфликтующие импорты, используются собственные типы
// Основано на официальной документации: https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk-react/3-x

/**
 * ✅ ИСПРАВЛЕНИЕ ВСЕХ ОШИБОК: Определяем собственные типы без импортов
 * В SDK v3.x структура типов изменилась, создаем совместимые интерфейсы
 */

/**
 * ✅ Пользователь Telegram (совместимо с SDK v3.x)
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
 * ✅ Launch Parameters (совместимо с нашей реализацией v10)
 * ИСПРАВЛЕНО: Добавлено startParam для обратной совместимости
 */
export interface LaunchParams {
  // ✅ Основные параметры SDK v3.x
  tgWebAppBotInline?: boolean;
  tgWebAppData?: {
    user?: TelegramUser;
    auth_date?: Date;
    query_id?: string;
    hash?: string;
    start_param?: string;
    chat_type?: string;
    chat_instance?: string;
  };
  tgWebAppThemeParams?: {
    accent_text_color?: string;
    bg_color?: string;
    button_color?: string;
    button_text_color?: string;
    destructive_text_color?: string;
    header_bg_color?: string;
    hint_color?: string;
    link_color?: string;
    secondary_bg_color?: string;
    section_bg_color?: string;
    section_header_text_color?: string;
    subtitle_text_color?: string;
    text_color?: string;
  };
  tgWebAppVersion?: string;
  tgWebAppPlatform?: string;
  tgWebAppStartParam?: string;
  
  // ✅ ИСПРАВЛЕНИЕ v10: Добавляем startParam для совместимости с нашей реализацией
  startParam?: string;
  platform?: string;
  version?: string;
  queryId?: string;
  hash?: string;
}

/**
 * ✅ Init Data (совместимо с SDK v3.x)
 */
export interface InitData {
  user?: TelegramUser;
  auth_date?: Date;
  query_id?: string;
  hash?: string;
  start_param?: string;
  chat_type?: string;
  chat_instance?: string;
}

/**
 * ✅ Контекст TelegramProvider - используется в приложении
 */
export interface TelegramContextValue {
  isReady: boolean;
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isTelegramEnvironment: boolean;
  error: string | null;
  launchParams: LaunchParams | null;
  webApp: TelegramWebApp | null;
  sdkVersion: string;
}

/**
 * ✅ Полный интерфейс Telegram WebApp API (window.Telegram.WebApp)
 */
export interface TelegramWebApp {
  version: string;
  platform: string;
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
    chat?: {
      id: number;
      type: string;
      title?: string;
      username?: string;
      photo_url?: string;
    };
    receiver?: TelegramUser & { is_bot?: boolean };
    can_send_after?: number;
    chat_type?: string;
    chat_instance?: string;
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
    header_bg_color?: string;
    accent_text_color?: string;
    section_bg_color?: string;
    section_header_text_color?: string;
    subtitle_text_color?: string;
    destructive_text_color?: string;
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
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: string) => void): void;
  
  // Advanced methods
  isVersionAtLeast(version: string): boolean;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  setBottomBarColor?(color: string): void;
  requestWriteAccess(callback?: (granted: boolean) => void): void;
  requestContact(callback?: (granted: boolean, data?: any) => void): void;
  showScanQrPopup(params: { text?: string }, callback?: (text: string) => boolean): void;
  closeScanQrPopup(): void;
  readTextFromClipboard(callback?: (text: string) => void): void;
  requestFullscreen(): void;
  exitFullscreen(): void;
  disableVerticalSwipes?(): void;
  enableVerticalSwipes?(): void;
  
  // ✅ UI элементы с правильными offClick методами
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    isActive: boolean;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
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
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
  };
  
  BackButton: {
    isVisible: boolean;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };
  
  SecondaryButton?: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    position: 'left' | 'right' | 'top' | 'bottom';
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
      position?: 'left' | 'right' | 'top' | 'bottom';
    }): void;
  };
  
  SettingsButton?: {
    isVisible: boolean;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };
  
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  
  // Advanced APIs
  CloudStorage?: {
    setItem(key: string, value: string, callback?: (error: string | null, stored?: boolean) => void): void;
    getItem(key: string, callback: (error: string | null, value?: string) => void): void;
    getItems(keys: string[], callback: (error: string | null, values?: Record<string, string>) => void): void;
    removeItem(key: string, callback?: (error: string | null, removed?: boolean) => void): void;
    removeItems(keys: string[], callback?: (error: string | null, removed?: boolean) => void): void;
    getKeys(callback: (error: string | null, keys?: string[]) => void): void;
  };
  
  BiometricManager?: {
    isInited: boolean;
    isBiometricAvailable: boolean;
    biometricType: 'finger' | 'face' | 'unknown';
    isAccessRequested: boolean;
    isAccessGranted: boolean;
    isBiometricTokenSaved: boolean;
    deviceId: string;
    init(callback?: () => void): void;
    requestAccess(params: { reason?: string }, callback?: (granted: boolean) => void): void;
    authenticate(params: { reason?: string }, callback?: (success: boolean, biometric_token?: string) => void): void;
    updateBiometricToken(token: string, callback?: (updated: boolean) => void): void;
    openSettings(): void;
  };
  
  LocationManager?: {
    isInited: boolean;
    isLocationAvailable: boolean;
    isAccessRequested: boolean;
    isAccessGranted: boolean;
    init(callback?: () => void): void;
    getLocation(callback?: (location: {
      latitude: number;
      longitude: number;
      altitude?: number;
      course?: number;
      speed?: number;
      horizontal_accuracy?: number;
      vertical_accuracy?: number;
    } | null) => void): void;
    openSettings(): void;
  };
  
  // Payments (Telegram Stars)
  invoices?: {
    open(url: string, callback?: (status: string) => void): void;
  };
}

/**
 * ✅ Утилитарные типы для 3GIS
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
 * ✅ Глобальные типы (расширяем Window для Telegram WebApp)
 */
declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

// ✅ ИСПРАВЛЕНО: Убран дублирующийся export type для TelegramUser
// Все интерфейсы уже экспортированы выше как export interface
