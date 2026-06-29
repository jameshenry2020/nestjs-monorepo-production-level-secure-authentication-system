import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isTokenExpired(token: string): boolean {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return true;
    const decoded = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decoded);
    // Expiration buffer: 30 seconds
    return payload.exp * 1000 < Date.now() + 30000;
  } catch (e) {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Read cookies directly in Edge Middleware
  let accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/settings') || 
    pathname.startsWith('/organizations');

  const isAuthRoute = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/signup') || 
    pathname.startsWith('/forgot-password') || 
    pathname.startsWith('/reset-password') || 
    pathname.startsWith('/verify-email');

  let response = NextResponse.next();
  let isAuthenticated = false;

  // 1. Handle token refresh if access token is missing or expired, and refresh token is available
  if ((!accessToken || isTokenExpired(accessToken)) && refreshToken) {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const refreshRes = await fetch(`${backendUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        accessToken = data.access_token;
        const newRefreshToken = data.refresh_token;

        // Set the new access token on request cookies so Server Components get it
        request.cookies.set('access_token', accessToken!);
        request.cookies.set('refresh_token', newRefreshToken);

        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });

        // Set the new cookies on response so the browser saves them
        response.cookies.set('access_token', accessToken!, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 10 * 60,
        });
        response.cookies.set('refresh_token', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 24 * 60 * 65, // 24 hours + extra buffer
        });

        isAuthenticated = true;
      } else {
        // Clear cookies if refresh fails
        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');
      }
    } catch (e) {
      console.error('Middleware token refresh error:', e);
    }
  } else if (accessToken && !isTokenExpired(accessToken)) {
    isAuthenticated = true;
  }

  // 2. Perform route protection redirections
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.search = request.nextUrl.search;
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    const token = request.nextUrl.searchParams.get('token');
    if (token) {
      const acceptUrl = new URL('/organizations/invitations/accept', request.url);
      acceptUrl.searchParams.set('token', token);
      return NextResponse.redirect(acceptUrl);
    }
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
