'use server';

import { backendApi } from '@/lib/backend-api';

export async function createOrganizationAction(orgData: { name: string }) {
  try {
    const { data } = await backendApi.post('/organizations', orgData);
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create organization',
    };
  }
}

export async function inviteMemberAction(orgId: string, email: string) {
  try {
    const { data } = await backendApi.post(`/organizations/${orgId}/invitations`, { email });
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to send invitation',
    };
  }
}

export async function updateMemberRoleAction(orgId: string, memberUserId: string, roleName: string) {
  try {
    const { data } = await backendApi.put(`/organizations/${orgId}/members/${memberUserId}/role`, { roleName });
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update member role',
    };
  }
}

export async function removeMemberAction(orgId: string, memberUserId: string) {
  try {
    const { data } = await backendApi.delete(`/organizations/${orgId}/members/${memberUserId}`);
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to remove member',
    };
  }
}
