import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  
  // Agar koi vercel.app wale link se ata hai, toh hum usko block kar denge
  if (host && host.includes('vercel.app')) {
    // Usse 404 (Not Found) ka error dena 
    return new NextResponse('Website is only available on portal.codeopspro.com', { status: 404 });
  }

  return NextResponse.next();
}

// Ensure middleware only runs on actual page visits and API requests
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
