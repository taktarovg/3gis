'use client';

import { ShareButton } from './ShareButton';
import { TelegramRedirect } from './TelegramRedirect';

interface ClientShareActionsProps {
  business: {
    id: number;
    name: string;
    slug?: string;
    description?: string;
  };
}

export function ClientShareActions({ business }: ClientShareActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      {/* Share Button */}
      <ShareButton 
        type="business"
        entity={business}
        variant="icon"
        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
      />
      
      {/* Telegram Redirect Button */}
      <TelegramRedirect 
        url={`/tg/business/${business.id}`}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Открыть в Telegram
      </TelegramRedirect>
    </div>
  );
}
