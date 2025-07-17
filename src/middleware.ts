import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: ВРЕМЕННО ОТКЛЮЧАЕМ MIDDLEWARE ДЛЯ ДИАГНОСТИКИ
 * Источник проблемы: middleware редиректит Telegram Desktop на /tg-redirect
 * 
 * ПЛАН:
 * 1. Временно отключить middleware 
 * 2. Протестировать прямой доступ к /tg в Telegram Desktop
 * 3. Получить реальный User Agent от Telegram Desktop
 * 4. Исправить логику определения Telegram клиентов
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  
  // ✅ ДИАГНОСТИКА: Логируем все запросы к /tg для анализа
  if (pathname === '/tg') {
    console.log(`[middleware] ДИАГНОСТИКА - РАЗРЕШАЕМ ВСЕ ЗАПРОСЫ К /tg:`, {
      userAgent: userAgent.substring(0, 100),
      pathname,
      timestamp: new Date().toISOString()
    });
  }
  
  // ✅ ВРЕМЕННОЕ ИСПРАВЛЕНИЕ: Пропускаем ВСЕ запросы без редиректов
  return NextResponse.next();
}

export const config = {
  // ✅ Применяем middleware ТОЛЬКО к /tg пути
  matcher: ['/tg']
};
