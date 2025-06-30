// src/app/api/share/business/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateUniqueSlug } from '@/lib/slug-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const businessId = parseInt(id);
    
    if (isNaN(businessId)) {
      return NextResponse.json({ error: 'Invalid business ID' }, { status: 400 });
    }
    
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        category: true,
        city: true,
        photos: { take: 1, orderBy: { order: 'asc' } }
      }
    });
    
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    
    // Автоматически генерируем slug если его нет
    if (!business.slug) {
      const newSlug = await generateUniqueSlug(business.name, 'business', business.id);
      await prisma.business.update({
        where: { id: businessId },
        data: { slug: newSlug }
      });
      business.slug = newSlug;
    }
    
    // Автоматически генерируем OG данные если их нет
    const ogTitle = business.ogTitle || `${business.name} | ${business.category.name} | 3GIS`;
    const ogDescription = business.ogDescription || 
      `${business.name} - ${business.category.name} в ${business.city.name}. Найдите контакты, отзывы и часы работы в справочнике 3GIS.`;
    const ogImage = business.ogImage || business.photos[0]?.url;
    
    if (!business.ogTitle || !business.ogDescription) {
      await prisma.business.update({
        where: { id: businessId },
        data: {
          ogTitle,
          ogDescription,
          ...(ogImage && !business.ogImage && { ogImage })
        }
      });
    }
    
    const shareUrl = `https://3gis.biz/b/${business.slug}`;
    
    // Записываем аналитику создания ссылки
    await prisma.shareAnalytics.create({
      data: {
        entityType: 'BUSINESS',
        entityId: businessId,
        businessId,
        action: 'LINK_CREATED',
        referrer: request.headers.get('referer'),
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('remote-addr')
      }
    });
    
    return NextResponse.json({
      success: true,
      shareUrl,
      slug: business.slug,
      ogTitle,
      ogDescription,
      ogImage
    });
    
  } catch (error) {
    console.error('Share link generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 }
    );
  }
}