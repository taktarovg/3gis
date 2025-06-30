// src/app/api/admin/update-slugs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateExistingSlugs } from '@/lib/slug-generator';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting slug generation for existing records...');
    
    await updateExistingSlugs();
    
    console.log('✅ Slug generation completed successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Slug generation completed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Slug generation failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate slugs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Тот же функционал через POST для безопасности
  return GET(request);
}
