import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - получение всех категорий блога
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includePostCount = searchParams.get('includePostCount') === 'true';

    // Получение категорий
    const categories = await prisma.blogCategory.findMany({
      orderBy: {
        id: 'asc'
      },
      include: includePostCount ? {
        _count: {
          select: {
            posts: {
              where: {
                status: 'PUBLISHED'
              }
            }
          }
        }
      } : undefined
    });

    // Форматирование данных
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      ...(includePostCount && {
        postCount: category._count?.posts || 0
      })
    }));

    return NextResponse.json({
      categories: formattedCategories
    });

  } catch (error) {
    console.error('Blog categories API error:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при получении категорий',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// POST - создание новой категории (только для админов)
export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Валидация обязательных полей
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Название и slug обязательны' },
        { status: 400 }
      );
    }

    // Проверка уникальности slug
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { slug: body.slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Категория с таким slug уже существует' },
        { status: 400 }
      );
    }

    // Создание категории
    const newCategory = await prisma.blogCategory.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || '',
        color: body.color || '#3B82F6'
      }
    });

    return NextResponse.json({
      success: true,
      category: {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description,
        color: newCategory.color
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create blog category error:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка при создании категории',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}