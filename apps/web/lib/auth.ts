'use server';

import { backendApi } from './backend-api';

export interface User {
  id: string;
  name: string;
  email: string;
  isTwoFactorEnabled?: boolean;
  role?: {
    id: string;
    name: string;
  } | null;
  permissions: string[];
  userPermissions: string[];
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await backendApi.get('/auth/profile');
    return data.user;
  } catch (error) {
    // Return null if request fails (e.g. unauthenticated, network error)
    return null;
  }
}
