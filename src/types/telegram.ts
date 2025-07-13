// src/types/telegram.ts
// ✅ ПРАВИЛЬНЫЕ ТИПЫ для @telegram-apps/sdk-react v3.x

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

// ✅ УПРОЩЕННЫЙ тип согласно SDK v3.x документации
export interface TelegramContextValue {
  isReady: boolean;
  user: TelegramUser | null;
  isAuthenticated: boolean;
  isTelegramEnvironment: boolean;
  error: string | null;
  launchParams: any; // Используем any для launchParams из SDK v3.x
  rawInitData: string | null;
  sdkVersion: string;
}
