'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  separator?: 'chevron' | 'slash';
  className?: string;
}

export function Breadcrumbs({ 
  items, 
  showHome = true, 
  separator = 'chevron',
  className = ''
}: BreadcrumbsProps) {
  // Добавляем главную страницу если нужно
  const allItems = showHome 
    ? [{ label: 'Главная', href: '/' }, ...items]
    : items;

  const Separator = () => {
    if (separator === 'slash') {
      return <span className="mx-2 text-gray-400">/</span>;
    }
    return <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />;
  };

  return (
    <nav 
      aria-label="Навигация по сайту"
      className={`flex items-center text-sm text-gray-600 ${className}`}
    >
      <ol className="flex items-center space-x-0">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isHome = index === 0 && showHome;

          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && <Separator />}
              
              {isLast ? (
                // Последний элемент - не ссылка
                <span 
                  className="font-medium text-gray-900"
                  aria-current="page"
                >
                  {isHome && <Home className="w-4 h-4 mr-1 inline" />}
                  {item.label}
                </span>
              ) : (
                // Активные ссылки
                <Link 
                  href={item.href}
                  className="hover:text-blue-600 transition-colors flex items-center"
                >
                  {isHome && <Home className="w-4 h-4 mr-1" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Упрощенная версия для блога
interface BlogBreadcrumbsProps {
  category?: {
    name: string;
    slug: string;
  };
  postTitle?: string;
  postSlug?: string;
}

export function BlogBreadcrumbs({ category, postTitle, postSlug }: BlogBreadcrumbsProps) {
  const items: BreadcrumbItem[] = [
    { label: 'Блог', href: '/blog' }
  ];

  if (category) {
    items.push({
      label: category.name,
      href: `/blog/category/${category.slug}`
    });
  }

  if (postTitle && postSlug) {
    items.push({
      label: postTitle,
      href: `/blog/${postSlug}`,
      current: true
    });
  }

  return <Breadcrumbs items={items} />;
}

// Версия для мобильных устройств (более компактная)
export function MobileBreadcrumbs({ items, showHome = false }: BreadcrumbsProps) {
  const allItems = showHome 
    ? [{ label: 'Главная', href: '/' }, ...items]
    : items;

  // На мобильных показываем только последние 2 элемента
  const visibleItems = allItems.length > 2 
    ? allItems.slice(-2)
    : allItems;

  const hasHiddenItems = allItems.length > 2;

  return (
    <nav 
      aria-label="Навигация по сайту"
      className="flex items-center text-sm text-gray-600 md:hidden"
    >
      <ol className="flex items-center">
        {hasHiddenItems && (
          <li className="flex items-center">
            <span className="text-gray-400">...</span>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          </li>
        )}
        
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          const adjustedIndex = hasHiddenItems ? allItems.length - visibleItems.length + index : index;

          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
              
              {isLast ? (
                <span 
                  className="font-medium text-gray-900 truncate max-w-[150px]"
                  aria-current="page"
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.href}
                  className="hover:text-blue-600 transition-colors truncate max-w-[100px]"
                  title={item.label}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// JSON-LD схема для хлебных крошек
interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
  baseUrl?: string;
}

export function BreadcrumbSchema({ items, baseUrl = 'https://3gis.us' }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href.startsWith('http') ? item.href : `${baseUrl}${item.href}`
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
}

// Автоматические хлебные крошки на основе URL
export function AutoBreadcrumbs({ 
  pathname, 
  customLabels = {} 
}: { 
  pathname: string;
  customLabels?: Record<string, string>;
}) {
  const segments = pathname.split('/').filter(Boolean);
  
  const items: BreadcrumbItem[] = [];
  let currentPath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Получаем человекочитаемое название
    const label = customLabels[segment] || 
                 segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    
    items.push({
      label,
      href: currentPath,
      current: index === segments.length - 1
    });
  });

  if (items.length === 0) {
    return null;
  }

  return <Breadcrumbs items={items} />;
}