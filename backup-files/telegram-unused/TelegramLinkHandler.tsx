'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Компонент для оптимизации работы с ссылкой https://www.3gis.biz/tg
 * Автоматически предлагает открыть приложение в Telegram
 * 
 * Основано на документации @telegram-apps/sdk v3.x:
 * https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/3-x
 */

interface TelegramLinkInfo {
  isTelegram: boolean;
  isWebVersion: boolean;
  isMobile: boolean;
  canOpenInApp: boolean;
  botUsername: string;
  appPath: string;
}

export function TelegramLinkHandler() {
  const [linkInfo, setLinkInfo] = useState<TelegramLinkInfo | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const searchParams = useSearchParams();

  // ✅ Получаем параметры из URL для передачи в Telegram
  const startParam = searchParams.get('start') || 'web_link';
  const category = searchParams.get