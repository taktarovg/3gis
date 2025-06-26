import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

/**
 * API endpoint для проверки прав владельца заведения
 * GET /api/businesses/[id]/owner-check
 * ✅ ИСПРАВЛЕНО: Добавлен fallback для случаев без авторизации
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = parseInt(id);
    
    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: 'Invalid business ID' },
        { status: 400 }
      );
    }

    // Получаем токен авторизации
    const authHeader = request.headers.get('authorization');
    
    // ✅ ИСПРАВЛЕНО: Если нет токена, возвращаем isOwner: false без ошибки 401
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No authorization token provided for business', businessId);
      return NextResponse.json({
        isOwner: false,
        businessId,
        userId: null,
        message: 'No authorization provided'
      });
    }

    const token = authHeader.substring(7);
    
    try {
      // Проверяем JWT токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const userId = decoded.userId;

      if (!userId) {
        console.log('Invalid token - no userId');
        return NextResponse.json({
          isOwner: false,
          businessId,
          userId: null,
          message: 'Invalid token'
        });
      }

      // Проверяем является ли пользователь владельцем заведения
      const business = await prisma.business.findFirst({
        where: {
          id: businessId,
          ownerId: userId
        }
      });

      return NextResponse.json({
        isOwner: !!business,
        businessId,
        userId,
        message: business ? 'User is owner' : 'User is not owner'
      });

    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      // ✅ ИСПРАВЛЕНО: Возвращаем 200 вместо 401 для лучшего UX
      return NextResponse.json({
        isOwner: false,
        businessId,
        userId: null,
        message: 'Token verification failed'
      });
    }

  } catch (error) {
    console.error('Owner check error:', error);
    return NextResponse.json(
      { 
        isOwner: false, 
        businessId: parseInt((await params).id),
        userId: null,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
