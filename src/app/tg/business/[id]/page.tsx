// src/app/tg/business/[id]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import { BusinessDetail } from '@/components/businesses/BusinessDetail';
import { prisma } from '@/lib/prisma';

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

    const business = await prisma.business.findUnique({
      where: {
        id: businessId,
        status: 'ACTIVE'
      },
      include: {
        category: true,
        city: {
          include: {
            state: true // Включаем связь с штатом
          }
        },
        photos: {
          orderBy: { order: 'asc' }
        },
        reviews: {
          include: {
            user: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            reviews: true,
            favorites: true
          }
        }
      }
    });

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

  // Преобразуем данные для компонента
  const business = {
    ...businessData,
    city: {
      name: businessData.city.name,
      state: businessData.city.state?.name || businessData.city.stateId
    }
  };

  return (
    <div className="threegis-app-container">
      <div className="threegis-app-main">
        <BusinessDetail business={business} />
      </div>
    </div>
  );
}