import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = parseInt(params.id);
    
    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: 'Неверный ID заведения' },
        { status: 400 }
      );
    }
    
    // Получаем текущую активную подписку
    const subscription = await prisma.businessSubscription.findFirst({
      where: {
        businessId: businessId,
        status: 'ACTIVE',
        endDate: {
          gte: new Date() // Еще не истекла
        }
      },
      orderBy: {
        endDate: 'desc' // Последняя по времени
      }
    });
    
    // Если нет активной подписки, проверяем заведение
    if (!subscription) {
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: { 
          id: true, 
          premiumTier: true, 
          premiumUntil: true 
        }
      });
      
      if (!business) {
        return NextResponse.json(
          { error: 'Заведение не найдено' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        subscription: null,
        business: {
          id: business.id,
          premiumTier: business.premiumTier,
          premiumUntil: business.premiumUntil
        }
      });
    }
    
    return NextResponse.json({
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        startDate: subscription.startDate.toISOString(),
        endDate: subscription.endDate.toISOString(),
        status: subscription.status,
        starsAmount: subscription.starsAmount,
        dollarPrice: subscription.dollarPrice
      }
    });
    
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении статуса подписки' },
      { status: 500 }
    );
  }
}
