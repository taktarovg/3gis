// src/components/categories/CategoryGrid.tsx
'use client';

import React from 'react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  nameEn: string;
  slug: string;
  icon: string;
  order: number;
}

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="threegis-category-grid">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/tg/businesses?category=${category.slug}`}
          className="threegis-category-card group"
        >
          <span className="threegis-category-icon">
            {category.icon}
          </span>
          <div className="threegis-category-name">
            {category.name}
          </div>
          <div className="text-xs text-threegis-secondary mt-1">
            {category.nameEn}
          </div>
        </Link>
      ))}
    </div>
  );
}