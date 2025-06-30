// src/app/tg/business/[id]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import { BusinessDetail } from '@/components/businesses/BusinessDetail';
import { sanitizeBusinessData, createSafeBusinessQuery } from '@/lib/database-utils';

interface BusinessPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getBusiness(id: string) {
  try {
    const businessId = parseInt(id);
    if (isNaN(businessId)) {
      return null;
    }

    // Используем безопасную функцию для получения бизнеса
    const business = await createSafeBusinessQuery(businessId);
    return business;
  } catch (error) {
    console.error('Error fetching business:', error);
    return null;
  }
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  // Await params для Next.js 15
  const { id } = await params;
  
  const businessData = await getBusiness(id);

  if (!businessData) {
    notFound();
  }

  // Преобразуем данные для компонента с безопасной обработкой
  const business = sanitizeBusinessData({
    ...businessData,
    city: {
      name: businessData.city.name,
      state: businessData.city.state?.name || businessData.city.stateId
    }
  });

  return (
    <div className="threegis-app-container">
      <div className="threegis-app-main">
        <BusinessDetail business={business} />
      </div>
    </div>
  );
}