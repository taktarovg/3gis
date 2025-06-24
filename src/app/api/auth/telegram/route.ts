// src/app/api/auth/telegram/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

import { prisma } from '@/lib/prisma';
import { validateTelegramAuth, parseTelegramAuthData, extractInitDataString } from '@/lib/telegram';
import { createToken } from '@/lib/auth';
import { DEFAULT_IMAGES } from '@/lib/aws-s3';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: NextRequest) {
  console.log('🔍 3GIS Auth: Starting...');
  
  try {
    // Быстрая проверка БД
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ DB OK');
    } catch (dbError) {
      console.error('❌ DB Error:', dbError);
      return NextResponse.json(
        { error: 'Database temporarily unavailable' },
        { status: 503, headers: { 'Retry-After': '3' } }
      );
    }

    const { initData } = await request.json();
    
    if (!initData) {
      return NextResponse.json(
        { error: 'Missing Telegram data' },
        { status: 400 }
      );
    }

    const initDataString = extractInitDataString(initData);
    const skipValidation = process.env.SKIP_TELEGRAM_VALIDATION === 'true';
    
    let isValid = skipValidation;
    if (!skipValidation) {
      isValid = await validateTelegramAuth(initDataString);
    }
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid Telegram auth' },
        { status: 403 }
      );
    }

    const userData = parseTelegramAuthData(initDataString);
    
    if (!userData?.telegramId) {
      if (skipValidation) {
        return await createTestUser();
      }
      return NextResponse.json(
        { error: 'No user data' },
        { status: 400 }
      );
    }

    // Быстрая upsert операция
    const user = await prisma.user.upsert({
      where: { telegramId: userData.telegramId },
      update: {
        firstName: userData.firstName || undefined,
        lastName: userData.lastName || undefined,
        username: userData.username || undefined,
        lastSeenAt: new Date(),
      },
      create: {
        telegramId: userData.telegramId,
        firstName: userData.firstName,
        lastName: userData.lastName || '',
        username: userData.username || null,
        avatar: DEFAULT_IMAGES.AVATAR,
        role: 'USER',
        isPremium: false,
      },
      select: {
        id: true,
        telegramId: true,
        firstName: true,
        lastName: true,
        username: true,
        avatar: true,
        role: true,
        isPremium: true,
        createdAt: true,
      }
    });

    const token = createToken({ user });
    
    console.log(`✅ Auth success: ${userData.telegramId}`);

    const response = NextResponse.json({ user, token });
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('❌ Auth error:', error);
    
    if (error instanceof Error && error.message.includes('Max client connections')) {
      return NextResponse.json(
        { error: 'Server overloaded, try again in a few seconds' },
        { status: 503, headers: { 'Retry-After': '5' } }
      );
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

async function createTestUser() {
  const testUser = await prisma.user.upsert({
    where: { telegramId: 'test_user_3gis' },
    update: { lastSeenAt: new Date() },
    create: {
      telegramId: 'test_user_3gis',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser3gis',
      avatar: DEFAULT_IMAGES.AVATAR,
      role: 'USER',
      isPremium: false,
    },
    select: {
      id: true,
      telegramId: true,
      firstName: true,
      lastName: true,
      username: true,
      avatar: true,
      role: true,
      isPremium: true,
      createdAt: true,
    }
  });

  const token = createToken({ user: testUser });
  console.log('🧪 Test user created');

  const response = NextResponse.json({ user: testUser, token });
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return response;
}