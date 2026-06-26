import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/backend-api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const body = await request.json();

    const headers: Record<string, string> = {};
    if (orgId) {
      headers['X-Organization-Id'] = orgId;
    }

    const { data } = await backendApi.patch(`/projects/${id}`, body, { headers });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to update project' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');

    const headers: Record<string, string> = {};
    if (orgId) {
      headers['X-Organization-Id'] = orgId;
    }

    const { data } = await backendApi.delete(`/projects/${id}`, { headers });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to delete project' },
      { status: error.response?.status || 500 }
    );
  }
}
