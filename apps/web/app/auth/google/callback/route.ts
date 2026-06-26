import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/backend-api';
import { setAuthCookies } from '@/lib/cookies';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (code) {
    try {
      // Forward the OAuth code and state to the NestJS backend callback endpoint
      const { data } = await backendApi.get('/auth/google/callback', {
        params: { code, state },
      });

      const { access_token, refresh_token } = data;

      if (access_token && refresh_token) {
        // Set the secure HttpOnly cookies on the Next.js server side
        await setAuthCookies(access_token, refresh_token);
        
        // Redirect to the dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error: any) {
      console.error(
        'Failed to authenticate Google callback with NestJS backend:', 
        error.response?.data || error.message
      );
    }
  }

  // Redirect back to login with error parameter in case of failure
  return NextResponse.redirect(new URL('/login?error=GoogleOAuthFailed', request.url));
}
