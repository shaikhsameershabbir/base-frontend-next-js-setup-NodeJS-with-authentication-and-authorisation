import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Create response
    const response = NextResponse.next();

    // Disable all caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Last-Modified', new Date().toUTCString());
    response.headers.set('ETag', `"${Date.now()}"`);

    // Disable browser caching
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('Vary', '*');

    // Disable CDN caching
    response.headers.set('CDN-Cache-Control', 'no-cache');
    response.headers.set('Cloudflare-CDN-Cache-Control', 'no-cache');

    return response;
}

// Apply middleware to all routes
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
