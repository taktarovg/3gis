// src/components/filters/FilterChips.tsx
'use client';

import React from 'react';
import Link from 'next/link';

const filters = [
  { key: 'all', label: 'Все', href: '/tg' },
  { key: 'open_now', label: '🟢 Открыто сейчас', href: '/tg/businesses?filter=open_now' },
  { key: 'russian', label: '🇷🇺 Русский язык', href: '/tg/businesses?filter=russian' },
  { key: 'nearby', label: '📍 Рядом со мной', href: '/tg/businesses?filter=nearby' },
  { key: 'delivery', label: '🚚 Доставка', href: '/tg/businesses?filter=delivery' },
];

export function FilterChips() {
  return (
    <div className="threegis-filters hide-scrollbar">
      {filters.map((filter) => (
        <Link
          key={filter.key}
          href={filter.href}
          className="threegis-filter-chip"
        >
          {filter.label}
        </Link>
      ))}
    </div>
  );
}