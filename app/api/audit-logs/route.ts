import { NextResponse } from 'next/server';
import { listAuditLogs, createAuditLog } from '@/lib/server/data';
import { handleApiError, isActor } from '@/lib/server/http';
import type { AuditLog, User } from '@/types/library';

export async function GET() {
  try {
    return NextResponse.json(await listAuditLogs());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const log = body.log as Omit<AuditLog, 'id' | 'timestamp'>;
    const actor = body.actor as User;
    if (!log || !log.action || !isActor(actor)) {
      return NextResponse.json({ success: false, message: 'Data log atau aktor tidak valid.' }, { status: 400 });
    }
    await createAuditLog(log);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
