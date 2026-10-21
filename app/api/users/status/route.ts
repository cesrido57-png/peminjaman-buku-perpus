import { NextResponse } from 'next/server';
import { updateUserStatus } from '@/lib/server/data';
import { handleApiError, isActor } from '@/lib/server/http';
import type { User } from '@/types/library';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { uid, status, actor } = body as { uid?: string; status?: 'active' | 'inactive'; actor?: User };
    if (!uid || !['active', 'inactive'].includes(status || '') || !isActor(actor)) {
      return NextResponse.json({ success: false, message: 'Data tidak valid.' }, { status: 400 });
    }
    await updateUserStatus(uid, status!, actor!);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
