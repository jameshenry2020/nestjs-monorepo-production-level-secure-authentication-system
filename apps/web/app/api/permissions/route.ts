import { NextResponse } from 'next/server';
import { backendApi } from '@/lib/backend-api';

export async function GET() {
  try {
    const { data } = await backendApi.get('/permissions');
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.response?.data?.message || 'Failed to fetch permissions' },
      { status: error.response?.status || 500 }
    );
  }
}
