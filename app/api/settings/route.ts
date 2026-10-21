import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/server/data';
import { handleApiError, isActor } from '@/lib/server/http';
import type { SystemSettings, User } from '@/types/library';

export async function GET() {
  try {
    return NextResponse.json(await getSettings());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const settings = body.settings as Partial<SystemSettings>;
    const actor = body.actor as User;
    if (!settings || !isActor(actor)) {
      return NextResponse.json({ success: false, message: 'Data pengaturan atau aktor tidak valid.' }, { status: 400 });
    }
    const updated = await updateSettings(settings, actor);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
