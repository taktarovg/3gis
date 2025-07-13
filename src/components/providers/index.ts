// src/components/providers/index.ts
export { TelegramProvider, useTelegram, TelegramStatus } from './TelegramProvider';
// ✅ ИСПРАВЛЕНО: TelegramStatus теперь экспортируется из TelegramProvider вместо отдельного файла
export { useTelegramEnvironment, useTelegramAuth } from '../../hooks/useTelegramHooks';

// Экспорт типов для удобства
export type { TelegramUser, TelegramContextValue } from '../../types/telegram';
