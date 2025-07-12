// src/types/telegram.ts
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

export interface TelegramInitData {
  user?: TelegramUser;
  auth_date?: number;
  query_id?: string;
  hash?: string;
  start_param?: string;
  chat_type?: string;
  chat_instance?: string;
  isMock?: boolean;
  isDevFallback?: boolean;
  isLaunchParamsError?: boolean;
  [key: string]: any;
}

// ✅ ИСПРАВЛЕНО: Правильная типизация для SDK v3.x согласно документации
export interface LaunchParams {
  tgWebAppBotInline?: boolean;
  tgWebAppData?: {
    user?: TelegramUser;
    auth_date?: number | Date | string;
    authDate?: number | Date | string;
    query_id?: string;
    queryId?: string;
    hash?: string;
    start_param?: string;
    startParam?: string;
    chat_type?: string;
    chatType?: string;
    chat_instance?: string;
    chatInstance?: string;
    [key: string]: any;
  };
  tgWebAppVersion?: string;
  tgWebAppPlatform?: string;
  tgWebAppStartParam?: string; // ✅ КЛЮЧЕВОЕ ПОЛЕ для startapp параметров
  tgWebAppThemeParams?: Record<string, any>;
  [key: string]: any;
}

export interface EnvironmentChecks {
  hasWebApp: boolean;
  hasInitData: boolean;
  hasWebAppInUrl: boolean;
  hasTelegramUA: boolean;
  hasTelegramReferrer: boolean;
  hasWebAppObject: boolean;
}

export interface TelegramContextValue {
  isReady: boolean;
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isTelegramEnvironment: boolean;
  error: string | null;
  initData: TelegramInitData | null;
  launchParams: LaunchParams | null; // ✅ ИСПРАВЛЕНО: убрали unknown для лучшей типизации
  rawInitData: string | null;
  sdkVersion: string;
  environmentInfo: {
    hasWebApp: boolean;
    hasInitData: boolean;
    platform?: string;
    version?: string;
  };
}
