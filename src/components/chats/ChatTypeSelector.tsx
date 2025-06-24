'use client';

import { cn } from '@/lib/utils';

type ChatType = 'GROUP' | 'CHAT' | 'CHANNEL';

interface ChatTypeSelectorProps {
  selectedType?: ChatType;
  onTypeChange: (type?: ChatType) => void;
  counts?: Record<string, number>;
}

const CHAT_TYPES = [
  { key: 'GROUP' as ChatType, label: 'Группы', icon: '👥' },
  { key: 'CHAT' as ChatType, label: 'Чаты', icon: '💬' },
  { key: 'CHANNEL' as ChatType, label: 'Каналы', icon: '📢' },
];

export function ChatTypeSelector({ 
  selectedType, 
  onTypeChange, 
  counts = {} 
}: ChatTypeSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {/* Кнопка "Все" */}
      <button
        onClick={() => onTypeChange(undefined)}
        className={cn(
          'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
          !selectedType
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
      >
        🌐 Все ({Object.values(counts).reduce((sum, count) => sum + count, 0)})
      </button>

      {CHAT_TYPES.map((type) => {
        const count = counts[type.key] || 0;
        const isSelected = selectedType === type.key;
        
        return (
          <button
            key={type.key}
            onClick={() => onTypeChange(isSelected ? undefined : type.key)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
              isSelected
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {type.icon} {type.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
