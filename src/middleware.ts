// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

// Массив путей API, которые нужно оптимизировать
const API_PATHS_TO_OPTIMIZE = [
  '/api/auth/telegram',
  '/api/auth/me',
  '/api/businesses',
  '/api/categories',
  '/api/cities',
  '/api/favorites'
];

// Middleware для оптимизации API запросов и обработки коротких ссылок
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // ✅ Обработка коротких ссылок /b/slug и /c/slug
  if (pathname.startsWith('/b/') || pathname.startsWith('/c/')) {
    const [, type, slug] = pathname.split('/');
    const shareType = type === 'b' ? 'business' : 'chat';
    
    // Сохраняем все query параметры (UTM метки и т.д.)
    const queryString = searchParams.toString();
    const newUrl = new URL(`/share/${shareType}/${slug}`, request.url);
    
    if (queryString) {
      newUrl.search = queryString;
    }
    
    return NextResponse.rewrite(newUrl);
  }
  
  // ✅ Обработка legacy редиректов
  if (pathname === '/redirect') {
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    
    if (id && type && ['business', 'chat'].includes(type)) {
      return NextResponse.redirect(
        new URL(`/share/${type}/${id}`, request.url)
      );
    }
  }
  
  // Применяем оптимизации только к API маршрутам
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Добавляем заголовки для оптимизации
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Добавляем CORS заголовки для всех API запросов
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Специальная обработка для критичных API
    if (API_PATHS_TO_OPTIMIZE.some(path => pathname.startsWith(path))) {
      // Добавляем заголовок для мониторинга производительности
      response.headers.set('X-API-Optimized', 'true');
      
      // Добавляем лимит времени выполнения
      response.headers.set('X-Max-Duration', '10000'); // 10 секунд
    }
    
    return response;
  }
  
  // Для остальных запросов возвращаем как есть
  return NextResponse.next();
}

// Конфигурация middleware
export const config = {
  matcher: [
    /*
     * Применяем middleware к:
     * - Коротким ссылкам /b/ и /c/
     * - Legacy редиректам /redirect
     * - API маршрутам /api/
     * Исключаем:
     * - _next/static (статические файлы)
     * - _next/image (оптимизация изображений)
     * - favicon.ico (иконка)
     */
    '/b/:path*',
    '/c/:path*', 
    '/redirect',
    '/api/:path*'
  ],
}