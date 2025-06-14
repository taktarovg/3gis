// src/components/businesses/BusinessList.tsx
'use client';

import React from 'react';
import { BusinessCard } from './BusinessCard';

interface Business {
  id: number;
  name: string;
  nameEn?: string;
  description?: string;
  address: string;
  phone?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  languages: string[];
  hasParking: boolean;
  premiumTier: string;
  category: {
    name: string;
    icon: string;
  };
  city: {
    name: string;
    state: string;
  };
  photos: {
    url: string;
  }[];
  _count: {
    reviews: number;
    favorites: number;
  };
}

interface BusinessListProps {
  businesses: Business[];
}

export function BusinessList({ businesses }: BusinessListProps) {
  return (
    <div className="space-y-4">
      {businesses.map((business) => (
        <BusinessCard key={business.id} business={business} />
      ))}
    </div>
  );
}