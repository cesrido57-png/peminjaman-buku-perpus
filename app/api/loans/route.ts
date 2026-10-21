import { NextResponse } from 'next/server';
import { listLoans, requestLoan } from '@/lib/server/data';
import { handleApiError, isActor } from '@/lib/server/http';
import type { User } from '@/types/library';

export async function GET() {
  try {
    return NextResponse.json(await listLoans());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookId, member } = body as { bookId?: string; member?: User };
    if (!bookId || !isActor(member)) {
      return NextResponse.json({ success: false, message: 'Data permintaan tidak valid.' }, { status: 400 });
    }
    const result = await requestLoan(bookId, member!);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return handleApiError(error);
  }
}
