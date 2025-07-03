// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTokenFromHeader, requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 5;

export async function GET(request: NextRequest) {
  console.log('🔍 /api/auth/me: Checking user...');
  
  try {
    // Быстрая проверка БД
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      console.error('❌ DB Error:', dbError);
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }
    
    const payload = requireAuth(token);
    console.log('👤 User ID:', payload.userId);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        telegramId: true,
        firstName: true,
        lastName: true,
        username: true,
        language: true,
        avatar: true,
        role: true,
        isPremium: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        city: {
          select: { id: true, name: true, state: true }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Обновляем lastSeenAt асинхронно
    prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    }).catch(console.error);

    console.log(`✅ User verified: ${user.telegramId}`);
    return NextResponse.json(user);

  } catch (error) {
    console.error('❌ /api/auth/me error:', error);
    
    if (error instanceof Error && error.message.includes('Max client connections')) {
      return NextResponse.json(
        { error: 'Server overloaded' },
        { status: 503, headers: { 'Retry-After': '3' } }
      );
    }
    
    if (error instanceof Error && error.message.includes('Токен')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}