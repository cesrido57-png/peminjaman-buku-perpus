import { NextResponse } from 'next/server';
import { listCategories, saveCategory } from '@/lib/server/data';
import { handleApiError, isActor } from '@/lib/server/http';
import type { Category, User } from '@/types/library';

export async function GET() {
  try {
    return NextResponse.json(await listCategories());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category = body.category as Partial<Category>;
    const actor = body.actor as User;
    if (!category || !isActor(actor)) {
      return NextResponse.json({ success: false, message: 'Data kategori atau aktor tidak valid.' }, { status: 400 });
    }
    const saved = await saveCategory(category, actor);
    return NextResponse.json({ success: true, category: saved });
  } catch (error) {
    return handleApiError(error);
  }
}
