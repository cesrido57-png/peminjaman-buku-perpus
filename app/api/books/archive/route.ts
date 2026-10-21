import { NextResponse } from 'next/server';
import { toggleArchiveBook } from '@/lib/server/data';
import { handleApiError, isActor } from '@/lib/server/http';
import type { User } from '@/types/library';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { bookId, actor } = body as { bookId?: string; actor?: User };
    if (!bookId || !isActor(actor)) {
      return NextResponse.json({ success: false, message: 'Data tidak valid.' }, { status: 400 });
    }
    await toggleArchiveBook(bookId, actor!);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
