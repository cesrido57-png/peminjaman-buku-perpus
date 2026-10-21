import { NextResponse } from 'next/server';
import { listUsers } from '@/lib/server/data';
import { handleApiError } from '@/lib/server/http';

export async function GET() {
  try {
    return NextResponse.json(await listUsers());
  } catch (error) {
    return handleApiError(error);
  }
}
