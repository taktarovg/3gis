import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Обработка CORS для API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Разрешенные origins
    const allowedOrigins = [
      'https://3gis.biz',
      'https://www.3gis.biz', 
      'http://localhost:3000'
    ];
    
    const origin = request.headers.get('origin');
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
    
    // Обработка preflight запросов
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 200,
        headers: response.headers
      });
    }
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/tg/:path*'
  ]
};
