import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 8;

export async function GET(request: NextRequest) {
  console.log('📋 Fetching businesses...');
  
  try {
    // Быстрая проверка БД
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    let whereClause: any = { status: 'ACTIVE' };

    if (category) {
      whereClause.category = { slug: category };
    }
    if (city) {
      whereClause.city = { name: city };
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          description: true,
          address: true,
          phone: true,
          rating: true,
          reviewCount: true,
          premiumTier: true,
          isVerified: true,
          languages: true,
          category: {
            select: { id: true, name: true, icon: true, slug: true }
          },
          city: {
            select: { id: true, name: true, state: true }
          },
          photos: {
            select: { url: true },
            take: 1,
            orderBy: { order: 'asc' }
          },
          _count: {
            select: {
              reviews: true,
              favorites: true
            }
          }
        },
        orderBy: [
          { premiumTier: 'desc' },
          { isVerified: 'desc' },
          { rating: 'desc' }
        ],
        take: limit,
        skip: offset
      }),
      prisma.business.count({ where: whereClause })
    ]);

    console.log(`✅ Found ${businesses.length} businesses`);

    // ✅ Добавляем fallback для _count на случай проблем с БД
    const businessesWithSafeCounts = businesses.map(business => ({
      ...business,
      _count: business._count || { reviews: 0, favorites: 0 }
    }));

    return NextResponse.json({
      businesses: businessesWithSafeCounts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });

  } catch (error) {
    console.error('❌ Business fetch error:', error);
    
    if (error instanceof Error && error.message.includes('Max client connections')) {
      return NextResponse.json(
        { error: 'Server overloaded' },
        { status: 503, headers: { 'Retry-After': '3' } }
      );
    }
    
    return NextResponse.json(
      { error: 'Error fetching businesses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('🏢 Creating business...');
  
  try {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      name, categoryId, address, cityId, ownerId,
      phone, website, description, languages = ['ru', 'en']
    } = body;

    if (!name || !categoryId || !address || !cityId || !ownerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Получаем stateId из города
    const city = await prisma.city.findUnique({
      where: { id: parseInt(cityId) },
      select: { stateId: true }
    });

    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 400 }
      );
    }

    const business = await prisma.business.create({
      data: {
        name,
        description: description || null,
        categoryId: parseInt(categoryId),
        address,
        cityId: parseInt(cityId),
        stateId: city.stateId, // ✅ Добавили обязательное поле
        phone: phone || null,
        website: website || null,
        languages,
        ownerId: parseInt(ownerId),
        status: 'PENDING'
      },
      select: {
        id: true,
        name: true,
        status: true,
        category: { select: { name: true, icon: true } },
        city: { select: { name: true } }
      }
    });

    console.log(`✅ Business created: ${business.name}`);

    return NextResponse.json({
      success: true,
      business,
      message: 'Business created successfully'
    });

  } catch (error) {
    console.error('❌ Business creation error:', error);
    
    if (error instanceof Error && error.message.includes('Max client connections')) {
      return NextResponse.json(
        { error: 'Server overloaded' },
        { status: 503, headers: { 'Retry-After': '3' } }
      );
    }
    
    return NextResponse.json(
      { error: 'Error creating business' },
      { status: 500 }
    );
  }
}