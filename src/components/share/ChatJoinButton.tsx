'use client';

import { ExternalLink } from 'lucide-react';

interface ChatJoinButtonProps {
  inviteLink: string;
  chatId: number;
  className?: string;
}

export function ChatJoinButton({ inviteLink, chatId, className }: ChatJoinButtonProps) {
  const handleClick = () => {
    // Записываем клик по ссылке
    fetch('/api/analytics/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: 'CHAT',
        entityId: chatId,
        action: 'APP_OPENED'
      })
    }).catch(console.error);
  };

  return (
    <a
      href={inviteLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      <ExternalLink className="w-4 h-4 mr-2" />
      Присоединиться к чату
    </a>
  );
}