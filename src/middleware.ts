// src/middleware.ts - ИСПРАВЛЕННЫЙ редирект для Next.js 15.3.3
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  
  // ✅ ИСПРАВЛЕНО: Более точное определение Telegram WebApp
  const isTelegramWebApp = 
    userAgent.includes('TelegramBot') || 
    userAgent.includes('Telegram/') ||
    userAgent.includes('tgWebApp') ||
    searchParams.has('tgWebAppData') ||
    searchParams.has('tgWebAppVersion') ||
    searchParams.has('tgWebAppPlatform') ||
    request.headers.get('sec-fetch-site') === 'cross-site';
  
  // ✅ ИСПРАВЛЕНО: ПРОСТОЙ редирект без зацикливания
  if (pathname === '/tg' && !isTelegramWebApp) {
    // Проверяем флаги чтобы избежать зацикливания
    const hasSpecialFlag = searchParams.has('_forceBrowser') || 
                          searchParams.has('_fromTelegram') ||
                          searchParams.has('_browser') ||
                          searchParams.has('_redirected');
    
    // Если есть специальные флаги - НЕ редиректим
    if (hasSpecialFlag) {
      console.log(`[middleware] ${pathname} - ПОЗВОЛЯЕМ доступ из-за флага`);
      return NextResponse.next();
    }
    
    // Делаем редирект только если НЕТ специальных флагов
    const redirectUrl = new URL('/tg-redirect', request.url);
    
    // Копируем ТОЛЬКО нужные параметры
    const startParam = searchParams.get('startapp') || searchParams.get('start');
    if (startParam) {
      redirectUrl.searchParams.set('startapp', startParam);
    }
    
    console.log(`[middleware] РЕДИРЕКТ ${pathname} -> /tg-redirect`);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Пропускаем все остальные запросы
  return NextResponse.next();
}

export const config = {
  // ТОЛЬКО /tg - НЕ трогаем /tg-redirect
  matcher: ['/tg']
};
