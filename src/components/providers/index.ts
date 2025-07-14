// src/components/providers/index.ts
export { TelegramProvider, useTelegram, TelegramDebugStatus } from './TelegramProvider';
// ✅ ИСПРАВЛЕНО: Экспортируем TelegramDebugStatus вместо несуществующего TelegramStatus
export { useTelegramEnvironment, useTelegramAuth } from '../../hooks/useTelegramHooks';

// Экспорт типов для удобства
export type { TelegramUser, TelegramContextValue } from '../../types/telegram';
