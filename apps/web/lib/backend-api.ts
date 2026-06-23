import axios from 'axios';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, setAuthCookies, clearAuthCookies } from './cookies';

export const backendApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach access token dynamically on the server
backendApi.interceptors.request.use(async (config) => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle token refresh automatically on 401 response
backendApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const cookieStore = await cookies();
      const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

      if (refreshToken) {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const { data } = await axios.post(`${backendUrl}/auth/refresh-token`, { refreshToken });
          
          const newAccessToken = data.access_token;
          const newRefreshToken = data.refresh_token;

          // Attempt to update the cookies (works in actions and route handlers, fails silently in Server Components during render)
          try {
            await setAuthCookies(newAccessToken, newRefreshToken);
          } catch (cookieError) {
            // Silently ignore during Server Component rendering phase
          }

          // Retry the original request with the new access token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return backendApi(originalRequest);
        } catch (refreshError) {
          // Refresh token is invalid/expired. Log out the user by clearing cookies.
          try {
            await clearAuthCookies();
          } catch (cookieError) {
            // Silently ignore
          }
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);
