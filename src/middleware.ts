// src/middleware.ts - Обработка редиректов для Next.js 15.3.3
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  
  // Определяем, является ли запрос из Telegram WebApp
  const isTelegramWebApp = userAgent.includes('TelegramBot') || 
                          userAgent.includes('Telegram');
  
  // Обработка редиректа для /tg когда открыто в браузере
  if (pathname === '/tg' && !isTelegramWebApp) {
    // Если есть query параметры, сохраняем их
    const redirectUrl = new URL('/tg-redirect', request.url);
    
    // Передаем исходные параметры в redirect страницу
    searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });
    
    console.log(`[redirect] ${pathname} -> /tg-redirect (browser detected)`);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Логирование для admin панели
  if (pathname.startsWith('/admin')) {
    console.log(`[admin] ${pathname} status=200`);
  }
  
  // Пропускаем все остальные запросы без модификации
  return NextResponse.next();
}

export const config = {
  // Обрабатываем /tg для редиректа и admin для логирования
  matcher: [
    '/tg',
    '/admin/:path*'
  ]
};
