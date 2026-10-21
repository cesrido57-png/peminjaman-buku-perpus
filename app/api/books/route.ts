import { NextResponse } from 'next/server';
import { listBooks, saveBook } from '@/lib/server/data';
import { handleApiError, isActor } from '@/lib/server/http';
import type { Book, User } from '@/types/library';

export async function GET() {
  try {
    return NextResponse.json(await listBooks());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const book = body.book as Partial<Book>;
    const actor = body.actor as User;
    if (!book || !isActor(actor)) {
      return NextResponse.json({ success: false, message: 'Data buku atau aktor tidak valid.' }, { status: 400 });
    }
    const saved = await saveBook(book, actor);
    return NextResponse.json({ success: true, book: saved });
  } catch (error) {
    return handleApiError(error);
  }
}
