// src/app/api/auth/telegram/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { validateTelegramAuth, parseTelegramAuthData, extractInitDataString } from '@/lib/telegram';
import { createToken } from '@/lib/auth';
import { uploadUserAvatar, DEFAULT_IMAGES } from '@/lib/aws-s3'; // ✅ Используем реальную AWS S3 функцию и константы

/**
 * Основной обработчик OPTIONS запроса для CORS preflight
 */
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

/**
 * Основной обработчик POST запроса для аутентификации через Telegram для 3GIS
 */
export async function POST(request: NextRequest) {
  try {
    // Отладка: Логируем заголовки запроса
    console.log('3GIS Auth: Received request headers:', Object.fromEntries(request.headers.entries()));
    
    // Получаем данные запроса
    const body = await request.json();
    const { initData } = body;
    
    // Отладка: Логируем данные initData
    console.log('3GIS Auth: Received initData:', initData ? 
      `${initData.substring(0, 50)}... (Length: ${initData.length})` : 'undefined or null');
    
    if (!initData) {
      return NextResponse.json(
        { error: 'Отсутствуют данные инициализации Telegram' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          } 
        }
      );
    }
    
    // Обрабатываем как объект или строку
    const initDataString = extractInitDataString(initData);
    
    // Отладка: Логируем обработанную строку initData
    console.log('3GIS Auth: Extracted initDataString:', 
      initDataString ? `${initDataString.substring(0, 50)}... (Length: ${initDataString.length})` : 'undefined');
      
    // В режиме разработки можно пропустить валидацию
    const skipValidation = process.env.NODE_ENV === 'development' || process.env.SKIP_TELEGRAM_VALIDATION === 'true';
    
    // Проверяем валидность данных только если не в режиме разработки
    let isValid = true;
    if (!skipValidation) {
      isValid = await validateTelegramAuth(initDataString);
    } else {
      console.log('3GIS AUTH: DEVELOPMENT MODE - Skipping Telegram auth validation');
    }
    
    if (!isValid && !skipValidation) {
      return NextResponse.json(
        { error: 'Неверные данные аутентификации Telegram' },
        { 
          status: 403,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          } 
        }
      );
    }
    
    // Парсим данные пользователя
    const userData = parseTelegramAuthData(initDataString);
    console.log('3GIS Auth: Parsed user data:', userData);
    
    if (!userData || !userData.telegramId) {
      // Если в режиме разработки, создаем тестового пользователя
      if (skipValidation) {
        console.log('3GIS AUTH: DEVELOPMENT MODE - Creating test user data');
        const testUser = {
          telegramId: `test_${Date.now()}`,
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser3gis',
          photoUrl: null,
          isPremium: false,
          language: 'ru'
        };
        
        // Создаем или обновляем тестового пользователя в базе
        let user = await prisma.user.findUnique({
          where: { telegramId: testUser.telegramId },
          include: { 
            city: true,
            businesses: {
              include: { category: true, city: true }
            },
            favorites: {
              include: { business: { include: { category: true } } }
            }
          },
        });
        
        if (!user) {
          user = await prisma.user.create({
            data: {
              telegramId: testUser.telegramId,
              firstName: testUser.firstName,
              lastName: testUser.lastName || '',
              username: testUser.username || null,
              avatar: testUser.photoUrl ? await uploadUserAvatar(testUser.photoUrl, testUser.telegramId) : DEFAULT_IMAGES.AVATAR,
              role: 'USER',
              isPremium: false,
              createdAt: new Date(),
            },
            include: {
              city: true,
              businesses: {
                include: { category: true, city: true }
              },
              favorites: {
                include: { business: { include: { category: true } } }
              }
            }
          });
          
          console.log('3GIS Auth: Created test user for development');
        }
        
        // Создаем токен для тестового пользователя
        const token = createToken({ user });
        console.log('3GIS Auth: Token created successfully for test user');
        
        // Отправляем ответ с данными пользователя и токеном
        const response = NextResponse.json({ user, token }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        });
        
        // Устанавливаем cookie с токеном
        response.cookies.set('auth_token', token, {
          httpOnly: true,
          secure: false, // В режиме разработки используем false
          sameSite: 'lax', // В режиме разработки используем lax
          maxAge: 7 * 24 * 60 * 60, // 7 дней
          path: '/',
        });
        
        return response;
      }
      
      return NextResponse.json(
        { error: 'Не удалось получить данные пользователя' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          } 
        }
      );
    }
    
    // Проверяем существует ли пользователь в 3GIS
    let user = await prisma.user.findUnique({
      where: { telegramId: userData.telegramId },
      include: { 
        city: true,
        businesses: {
          include: { category: true, city: true }
        },
        favorites: {
          include: { business: { include: { category: true } } }
        }
      },
    });
    
    // Загружаем аватар в AWS S3 (ТОЛЬКО если есть реальная аватарка из Telegram)
    let avatarUrl: string | null = null;
    if (userData.photoUrl) {
      try {
        console.log('3GIS Auth: Загружаем реальную аватарку из Telegram:', userData.photoUrl);
        avatarUrl = await uploadUserAvatar(userData.photoUrl, userData.telegramId);
        console.log('3GIS Auth: Аватарка успешно загружена в S3:', avatarUrl);
      } catch (error) {
        console.error('3GIS Auth: Ошибка при загрузке аватара в S3:', error);
        avatarUrl = DEFAULT_IMAGES.AVATAR;
      }
    } else {
      console.log('3GIS Auth: Нет аватарки в Telegram, используем дефолтную');
      avatarUrl = DEFAULT_IMAGES.AVATAR;
    }
    
    // Если пользователя нет, создаем нового
    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId: userData.telegramId,
          firstName: userData.firstName,
          lastName: userData.lastName || '',
          username: userData.username || null,
          avatar: avatarUrl || DEFAULT_IMAGES.AVATAR,
          role: 'USER', // Устанавливаем роль по умолчанию
          isPremium: userData.isPremium || false,
          createdAt: new Date(),
        },
        include: {
          city: true,
          businesses: {
            include: { category: true, city: true }
          },
          favorites: {
            include: { business: { include: { category: true } } }
          }
        }
      });
      
      console.log(`3GIS Auth: Создан новый пользователь с telegramId: ${userData.telegramId}`);
    } else {
      // Обновляем существующие данные пользователя
      const updateData: any = {
        username: userData.username || user.username,
        isPremium: userData.isPremium || user.isPremium,
        lastSeenAt: new Date(), // Обновляем время последней активности
      };
      
      // Обновляем имя и фамилию, только если они не пустые
      if (userData.firstName) {
        updateData.firstName = userData.firstName;
      }
      
      if (userData.lastName) {
        updateData.lastName = userData.lastName;
      }
      
      // Обновляем аватар ВСЕГДА (если есть новая аватарка)
      if (avatarUrl) {
        console.log('3GIS Auth: Обновляем аватарку пользователя на:', avatarUrl);
        updateData.avatar = avatarUrl;
      }
      
      user = await prisma.user.update({
        where: { telegramId: userData.telegramId },
        data: updateData,
        include: {
          city: true,
          businesses: {
            include: { category: true, city: true }
          },
          favorites: {
            include: { business: { include: { category: true } } }
          }
        }
      });
      
      console.log(`3GIS Auth: Обновлен пользователь с telegramId: ${userData.telegramId}`);
    }
    
    // Создаем JWT токен
    const token = createToken({ user });
    
    // Отправляем ответ с данными пользователя и токеном
    const response = NextResponse.json({ user, token }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
    // Устанавливаем cookie с токеном
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 дней
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('3GIS Auth: Ошибка аутентификации через Telegram:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ошибка аутентификации' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        } 
      }
    );
  }
}
