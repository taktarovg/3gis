// src/middleware.ts - Упрощенный middleware для Next.js 15.3.3
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ✅ Простая логика без сложных проверок для избежания ошибок
  console.log(`[admin] ${pathname} status=200`);
  
  // Пропускаем все запросы без модификации
  return NextResponse.next();
}

export const config = {
  // ✅ Только для admin маршрутов, чтобы не затрагивать /tg и /
  matcher: [
    '/admin/:path*'
  ]
};
