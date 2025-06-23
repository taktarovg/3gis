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

    // Парсим данные Telegram (упрощенная версия для демо)
    let userData;
    try {
      // В реальном проекте здесь должна быть полная верификация подписи
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

    // Проверяем владельца заведения
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId: user.id
      }
    });

    // Получаем активную подписку
    const currentSubscription = business ? await prisma.businessSubscription.findFirst({
      where: {
        businessId: businessId,
        status: 'ACTIVE'
      },
      orderBy: {
        endDate: 'desc'
      }
    }) : null;

    const isOwner = !!business;

    return NextResponse.json({
      isOwner,
      currentSubscription: currentSubscription ? {
        tier: currentSubscription.tier,
        endDate: currentSubscription.endDate.toISOString(),
        status: currentSubscription.status
      } : null,
      user: {
        id: user.id,
        firstName: user.firstName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Owner check error:', error);
    return NextResponse.json(
      { error: 'Ошибка проверки владельца' },
      { status: 500 }
    );
  }
}
