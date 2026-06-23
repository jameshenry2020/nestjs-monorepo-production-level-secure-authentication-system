'use server';

import { backendApi } from '@/lib/backend-api';

export async function createPermissionAction(permData: { name: string; module: string; description?: string }) {
  try {
    const { data } = await backendApi.post('/permissions', permData);
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create permission',
    };
  }
}

export async function assignRolePermissionsAction(roleId: string, permissions: string[]) {
  try {
    const { data } = await backendApi.post(`/permissions/roles/${roleId}`, { permissions });
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to assign permissions to role',
    };
  }
}

export async function assignUserPermissionsAction(userId: string, permissions: string[]) {
  try {
    const { data } = await backendApi.post(`/permissions/users/${userId}`, { permissions });
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to assign permissions to user',
    };
  }
}
