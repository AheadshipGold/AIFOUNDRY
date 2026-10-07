import { NextRequest, NextResponse } from 'next/server';
import { extractUserIdFromRequest } from '@/lib/server/auth';
import { closeDay } from '@/lib/server/finops';

export async function POST(req: NextRequest) {
  try {
    const userId = await extractUserIdFromRequest(req);
    const body = await req.json();
    const result = await closeDay(body, userId || undefined);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
