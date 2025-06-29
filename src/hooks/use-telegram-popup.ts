'use client';

import { useCallback } from 'react';

// Типы для popup
interface PopupParams {
  title: string;
  message: string;
  buttons?: PopupButton[];
}

interface PopupButton {
  id?: string;
  type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  text: string;
}

export function useTelegramPopup() {
  // Показ простого alert
  const showAlert = useCallback((message: string) => {
    try {
      // Пробуем использовать SDK v3.x
      const { showAlert } = require('@telegram-apps/sdk');
      if (showAlert?.isAvailable()) {
        return showAlert(message);
      }
    } catch {}

    try {
      // Fallback через window.Telegram
      if (typeof window !== 'undefined' && 
          window.Telegram && 
          window.Telegram.WebApp) {
        const webApp = window.Telegram.WebApp as any;
        if (typeof webApp['showAlert'] === 'function') {
          return webApp['showAlert'](message);
        }
      }
    } catch {}

    // Последний fallback - обычный alert
    alert(message);
  }, []);

  // Показ confirm диалога
  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        // Пробуем использовать SDK v3.x
        const { showConfirm } = require('@telegram-apps/sdk');
        if (showConfirm?.isAvailable()) {
          showConfirm(message).then(resolve).catch(() => resolve(false));
          return;
        }
      } catch {}

      try {
        // Fallback через window.Telegram
        if (typeof window !== 'undefined' && 
            window.Telegram && 
            window.Telegram.WebApp) {
          const webApp = window.Telegram.WebApp as any;
          if (typeof webApp['showConfirm'] === 'function') {
            webApp['showConfirm'](message, resolve);
            return;
          }
        }
      } catch {}

      // Последний fallback - обычный confirm
      resolve(confirm(message));
    });
  }, []);

  // Показ popup с кнопками
  const showPopup = useCallback((params: PopupParams): Promise<string> => {
    return new Promise((resolve) => {
      try {
        // Пробуем использовать SDK v3.x
        const { popup } = require('@telegram-apps/sdk');
        if (popup?.open?.isAvailable()) {
          popup.open(params).then(resolve).catch(() => resolve(''));
          return;
        }
      } catch {}

      try {
        // Fallback через window.Telegram
        if (typeof window !== 'undefined' && 
            window.Telegram && 
            window.Telegram.WebApp) {
          const webApp = window.Telegram.WebApp as any;
          if (typeof webApp['showPopup'] === 'function') {
            webApp['showPopup'](params, resolve);
            return;
          }
        }
      } catch {}

      // Fallback - простой confirm для базовых случаев
      if (params.buttons && params.buttons.length <= 2) {
        const result = confirm(`${params.title}\n\n${params.message}`);
        resolve(result ? 'ok' : 'cancel');
      } else {
        alert(`${params.title}\n\n${params.message}`);
        resolve('ok');
      }
    });
  }, []);

  return {
    showAlert,
    showConfirm,
    showPopup
  };
}
