import { NextResponse } from 'next/server';
import { reviewLoanRequest, checkoutLoan, returnLoan, cancelLoan } from '@/lib/server/data';
import { handleApiError, isActor } from '@/lib/server/http';
import type { User } from '@/types/library';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, actor, approve, rejectionReason } = body as {
      action?: 'review' | 'checkout' | 'return' | 'cancel';
      actor?: User;
      approve?: boolean;
      rejectionReason?: string;
    };
    if (!action || !isActor(actor)) {
      return NextResponse.json({ success: false, message: 'Aksi atau aktor tidak valid.' }, { status: 400 });
    }

    let result;
    switch (action) {
      case 'review':
        result = await reviewLoanRequest(id, Boolean(approve), rejectionReason || '', actor!);
        break;
      case 'checkout':
        result = await checkoutLoan(id, actor!);
        break;
      case 'return':
        result = await returnLoan(id, actor!);
        break;
      case 'cancel':
        result = await cancelLoan(id, actor!);
        break;
      default:
        return NextResponse.json({ success: false, message: 'Aksi tidak dikenal.' }, { status: 400 });
    }
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    return handleApiError(error);
  }
}
