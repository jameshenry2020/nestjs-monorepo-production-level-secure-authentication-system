import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/backend-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    
    const headers: Record<string, string> = {};
    if (orgId) {
      headers['X-Organization-Id'] = orgId;
    }

    const { data } = await backendApi.get('/projects', { headers });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to fetch projects' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const body = await request.json();

    const headers: Record<string, string> = {};
    if (orgId) {
      headers['X-Organization-Id'] = orgId;
    }

    const { data } = await backendApi.post('/projects', body, { headers });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to create project' },
      { status: error.response?.status || 500 }
    );
  }
}
