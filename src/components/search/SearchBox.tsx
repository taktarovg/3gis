// src/components/search/SearchBox.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { debounce } from '@/lib/utils';

interface SearchBoxProps {
  placeholder?: string;
  defaultValue?: string;
}

export function SearchBox({ placeholder, defaultValue }: SearchBoxProps) {
  const [query, setQuery] = useState(defaultValue || '');
  const router = useRouter();

  // Debounced search function
  const debouncedSearch = React.useMemo(
    () => debounce((searchQuery: string) => {
      if (searchQuery.trim()) {
        router.push(`/tg/businesses?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }, 500),
    [router]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Trigger search after user stops typing
    if (value.trim().length >= 2) {
      debouncedSearch(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/tg/businesses?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="threegis-search-box pl-10 pr-4"
        />
      </div>
    </form>
  );
}