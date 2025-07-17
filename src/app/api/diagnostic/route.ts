// src/app/api/diagnostic/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * ✅ API endpoint для получения диагностических данных от клиента
 * Поможет понять реальный User Agent от Telegram Desktop
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Логируем все данные от клиента для анализа
    console.log('🔍 ДИАГНОСТИКА ОТ КЛИЕНТА:', {
      timestamp: new Date().toISOString(),
      clientData: body,
      serverHeaders: {
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
        xForwardedFor: request.headers.get('x-forwarded-for'),
        secFetchSite: request.headers.get('sec-fetch-site'),
        secFetchMode: request.headers.get('sec-fetch-mode'),
        secFetchDest: request.headers.get('sec-fetch-dest'),
      }
    });

    return NextResponse.json({ 
      status: 'success',
      message: 'Диагностические данные получены',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Ошибка API диагностики:', error);
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Ошибка обработки диагностических данных' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Diagnostic API endpoint. Use POST to send diagnostic data.',
    endpoints: {
      POST: '/api/diagnostic - send diagnostic data',
      GET: '/tg/diagnostic - web diagnostic page'
    }
  });
}
