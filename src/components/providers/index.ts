// src/components/providers/index.ts
export { TelegramProvider, useTelegram } from './TelegramProvider';
export { TelegramStatus } from '../debug/TelegramStatus';
export { useTelegramEnvironment, useTelegramAuth } from '../../hooks/useTelegramHooks';

// Экспорт типов для удобства
export type { TelegramUser, TelegramInitData, TelegramContextValue, LaunchParams } from '../../types/telegram';
