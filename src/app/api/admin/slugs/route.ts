import { NextRequest, NextResponse } from 'next/server';
import { updateExistingSlugs } from '@/lib/slug-generator';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting slug update process...');
    
    // Запускаем обновление slug'ов
    await updateExistingSlugs();
    
    console.log('✅ Slug update completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Все slug\'ы обновлены успешно'
    });
    
  } catch (error) {
    console.error('❌ Error updating slugs:', error);
    
    return NextResponse.json(
      { 
        error: 'Ошибка при обновлении slug\'ов',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma');
    
    // Проверяем сколько записей нуждается в обновлении
    const businessesWithoutSlugs = await prisma.business.count({
      where: { slug: null }
    });
    
    const chatsWithoutSlugs = await prisma.telegramChat.count({
      where: { slug: null }
    });
    
    return NextResponse.json({
      businessesNeedingUpdate: businessesWithoutSlugs,
      chatsNeedingUpdate: chatsWithoutSlugs,
      totalNeedingUpdate: businessesWithoutSlugs + chatsWithoutSlugs
    });
    
  } catch (error) {
    console.error('Error checking slug status:', error);
    
    return NextResponse.json(
      { error: 'Ошибка при проверке статуса slug\'ов' },
      { status: 500 }
    );
  }
}