'use server';

import { backendApi } from '@/lib/backend-api';

export async function createProjectAction(
  projectData: { name: string; description?: string }, 
  orgId?: string
) {
  try {
    const headers: Record<string, string> = {};
    if (orgId) {
      headers['X-Organization-Id'] = orgId;
    }

    const { data } = await backendApi.post('/projects', projectData, { headers });
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create project',
    };
  }
}

export async function updateProjectAction(
  projectId: string,
  projectData: { name?: string; description?: string },
  orgId?: string
) {
  try {
    const headers: Record<string, string> = {};
    if (orgId) {
      headers['X-Organization-Id'] = orgId;
    }

    const { data } = await backendApi.patch(`/projects/${projectId}`, projectData, { headers });
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update project',
    };
  }
}

export async function deleteProjectAction(projectId: string, orgId?: string) {
  try {
    const headers: Record<string, string> = {};
    if (orgId) {
      headers['X-Organization-Id'] = orgId;
    }

    const { data } = await backendApi.delete(`/projects/${projectId}`, { headers });
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete project',
    };
  }
}
