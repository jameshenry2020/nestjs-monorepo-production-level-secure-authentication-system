import { NextResponse } from 'next/server';
import { backendApi } from '@/lib/backend-api';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { data } = await backendApi.get(`/organizations/${orgId}/members`);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to fetch organization members' },
      { status: error.response?.status || 500 }
    );
  }
}
