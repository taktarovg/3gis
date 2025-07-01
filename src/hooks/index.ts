// src/hooks/index.ts
// ✅ Экспорт всех хуков для удобства импорта

// Бизнесы - избранное
export { useFavorites, useFavoriteStatus, useFavoritesCount, useIsFavorite } from './use-favorites';
export { useToggleFavorite, useClearFavorites } from './use-toggle-favorite';

// Чаты - избранное  
export { useChatFavorites, useChatFavoriteStatus, useChatFavoritesCount, useIsChatFavorite } from './use-chat-favorites';
export { useToggleChatFavorite, useClearChatFavorites } from './use-toggle-chat-favorite';

// Haptic feedback
export { useHapticFeedback } from './use-haptic-feedback';

// Другие хуки (если есть)
export * from './use-chats';
