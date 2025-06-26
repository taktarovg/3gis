import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

/**
 * API endpoint для проверки прав владельца заведения
 * GET /api/businesses/[id]/owner-check
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = parseInt(params.id);
    
    if (isNaN(businessId)) {
      return NextResponse.json(
        { error: 'Invalid business ID' },
        { status: 400 }
      );
    }

    // Получаем токен авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { isOwner: false, error: 'No authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      // Проверяем JWT токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const userId = decoded.userId;

      if (!userId) {
        return NextResponse.json(
          { isOwner: false, error: 'Invalid token' },
          { status: 401 }
        );
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
        userId
      });

    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return NextResponse.json(
        { isOwner: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Owner check error:', error);
    return NextResponse.json(
      { isOwner: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
