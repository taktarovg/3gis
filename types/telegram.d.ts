// types/telegram.d.ts
// Полные типы для Telegram SDK v3.x и нативного window.Telegram API

// Расширяем типы для @telegram-apps/sdk-react v3.x
declare module '@telegram-apps/sdk-react' {
  export interface LaunchParams {
    tgWebAppData?: string | {
      user?: any;
      authDate?: Date;
      queryId?: string;
      hash?: string;
      startParam?: string;
      chatType?: string;
      chatInstance?: string;
    };
    tgWebAppVersion?: string;
    tgWebAppPlatform?: string;
    tgWebAppStartParam?: string;
    tgWebAppBotInline?: boolean;
    tgWebAppThemeParams?: any;
  }

  export function useLaunchParams(ssrSafe?: boolean): LaunchParams | null;
  export function useRawInitData(): string | null;
  export function init(config?: any): Promise<void>;
  export function mockTelegramEnv(config: any): void;
  export function retrieveLaunchParams(): LaunchParams;
}

// Global types for Telegram WebApp API
// Дополняет @telegram-apps/sdk типами для нативного window.Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            photo_url?: string;
            allows_write_to_pm?: boolean;
          };
          chat?: {
            id: number;
            type: string;
            title?: string;
            username?: string;
            photo_url?: string;
          };
          receiver?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
            is_bot?: boolean;
            is_premium?: boolean;
            language_code?: string;
          };
          start_param?: string;
          auth_date?: number;
          hash?: string;
          query_id?: string;
          can_send_after?: number;
          chat_type?: string;
          chat_instance?: string;
        };
        version: string;
        platform: string;
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
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        bottomBarColor: string;
        isClosingConfirmationEnabled: boolean;
        isVerticalSwipesEnabled: boolean;
        
        // Методы
        isVersionAtLeast: (version: string) => boolean;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        setBottomBarColor?: (color: string) => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        sendData: (data: string) => void;
        switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
        requestWriteAccess: (callback?: (granted: boolean) => void) => void;
        requestContact: (callback?: (granted: boolean, data?: any) => void) => void;
        showPopup: (params: {
          title?: string;
          message: string;
          buttons?: Array<{
            id?: string;
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
            text: string;
          }>;
        }, callback?: (button_id: string) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        showScanQrPopup: (params: {
          text?: string;
        }, callback?: (text: string) => boolean) => void;
        closeScanQrPopup: () => void;
        readTextFromClipboard: (callback?: (text: string) => void) => void;
        requestFullscreen: () => void;
        exitFullscreen: () => void;
        
        // ✅ Методы для предотвращения сворачивания (Bot API 7.7+)
        disableVerticalSwipes?: () => void;
        enableVerticalSwipes?: () => void;
        
        // События
        onEvent: (eventType: string, eventHandler: () => void) => void;
        offEvent: (eventType: string, eventHandler: () => void) => void;
        
        // Главная кнопка
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }) => void;
        };
        
        // Вторичная кнопка (Bot API 7.10+)
        SecondaryButton?: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          position: 'left' | 'right' | 'top' | 'bottom';
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
            position?: 'left' | 'right' | 'top' | 'bottom';
          }) => void;
        };
        
        // Кнопка "Назад"
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        
        // Настройки кнопки меню
        SettingsButton?: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        
        // Тактильная обратная связь
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        
        // CloudStorage API (Bot API 6.9+)
        CloudStorage?: {
          setItem: (key: string, value: string, callback?: (error: string | null, stored?: boolean) => void) => void;
          getItem: (key: string, callback: (error: string | null, value?: string) => void) => void;
          getItems: (keys: string[], callback: (error: string | null, values?: Record<string, string>) => void) => void;
          removeItem: (key: string, callback?: (error: string | null, removed?: boolean) => void) => void;
          removeItems: (keys: string[], callback?: (error: string | null, removed?: boolean) => void) => void;
          getKeys: (callback: (error: string | null, keys?: string[]) => void) => void;
        };
        
        // BiometricManager API (Bot API 7.2+)
        BiometricManager?: {
          isInited: boolean;
          isBiometricAvailable: boolean;
          biometricType: 'finger' | 'face' | 'unknown';
          isAccessRequested: boolean;
          isAccessGranted: boolean;
          isBiometricTokenSaved: boolean;
          deviceId: string;
          init: (callback?: () => void) => void;
          requestAccess: (params: {
            reason?: string;
          }, callback?: (granted: boolean) => void) => void;
          authenticate: (params: {
            reason?: string;
          }, callback?: (success: boolean, biometric_token?: string) => void) => void;
          updateBiometricToken: (token: string, callback?: (updated: boolean) => void) => void;
          openSettings: () => void;
        };
        
        // LocationManager API (Bot API 6.9+)
        LocationManager?: {
          isInited: boolean;
          isLocationAvailable: boolean;
          isAccessRequested: boolean;
          isAccessGranted: boolean;
          init: (callback?: () => void) => void;
          getLocation: (callback?: (location: {
            latitude: number;
            longitude: number;
            altitude?: number;
            course?: number;
            speed?: number;
            horizontal_accuracy?: number;
            vertical_accuracy?: number;
          } | null) => void) => void;
          openSettings: () => void;
        };
      };
    };
  }
}

export {};
