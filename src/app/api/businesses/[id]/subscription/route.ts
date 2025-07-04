import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const businessId = parseInt(id);
    
    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: 'Неверный ID заведения' },
        { status: 400 }
      );
    }

    // Получаем данные авторизации из заголовков
    const authHeader = request.headers.get('Authorization');
    const telegramInitData = authHeader?.replace('tma ', '');
    
    if (!telegramInitData) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    // Простая проверка авторизации (в реальном проекте нужна полная верификация подписи)
    let userData;
    try {
      // Пример парсинга - в реальном проекте должна быть полная верификация
      const initDataObj = JSON.parse(telegramInitData);
      userData = {
        telegramId: initDataObj.user?.id?.toString() || ''
      };
    } catch (error) {
      return NextResponse.json(
        { error: 'Неверные данные авторизации' },
        { status: 401 }
      );
    }

    if (!userData.telegramId) {
      return NextResponse.json(
        { error: 'Не удалось получить ID пользователя' },
        { status: 401 }
      );
    }

    // Находим пользователя в базе данных
    const user = await prisma.user.findUnique({
      where: {
        telegramId: userData.telegramId
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверяем права владельца заведения
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: user.id
      }
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Заведение не найдено или у вас нет доступа' },
        { status: 404 }
      );
    }

    // Получаем активную подписку
    const currentSubscription = await prisma.businessSubscription.findFirst({
      where: {
        businessId: businessId,
        status: 'ACTIVE'
      },
      orderBy: {
        endDate: 'desc'
      }
    });

    return NextResponse.json({
      subscription: currentSubscription ? {
        tier: currentSubscription.tier,
        endDate: currentSubscription.endDate.toISOString(),
        status: currentSubscription.status,
        starsAmount: currentSubscription.starsAmount,
        dollarPrice: currentSubscription.dollarPrice,
        startDate: currentSubscription.startDate.toISOString()
      } : null,
      business: {
        id: business.id,
        name: business.name,
        premiumTier: business.premiumTier,
        premiumUntil: business.premiumUntil?.toISOString()
      }
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения статуса подписки' },
      { status: 500 }
    );
  }
}
