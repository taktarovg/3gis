import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/blog/categories - получение всех категорий блога
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Форматируем данные для фронтенда
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      postCount: category._count.posts,
      createdAt: category.createdAt
    }));

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error('Ошибка получения категорий блога:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить категории' },
      { status: 500 }
    );
  }
}

// POST /api/admin/blog/categories - создание новой категории
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, color } = body;

    // Валидация обязательных полей
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Название и slug обязательны' },
        { status: 400 }
      );
    }

    // Проверяем уникальность названия и slug
    const existingCategory = await prisma.blogCategory.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Категория с таким названием или slug уже существует' },
        { status: 400 }
      );
    }

    // Создаем категорию
    const category = await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description: description || '',
        color: color || '#3B82F6'
      }
    });

    return NextResponse.json({ 
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      postCount: 0,
      createdAt: category.createdAt
    }, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания категории блога:', error);
    return NextResponse.json(
      { error: 'Не удалось создать категорию' },
      { status: 500 }
    );
  }
}
