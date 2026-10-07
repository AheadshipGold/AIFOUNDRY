import { NextRequest, NextResponse } from 'next/server';
import { extractUserIdFromRequest } from '@/lib/server/auth';
import { exportCsv } from '@/lib/server/finops';

export async function GET(req: NextRequest) {
  try {
    const userId = await extractUserIdFromRequest(req);
    const shopId = req.nextUrl.searchParams.get('shopId') || undefined;
    const result = await exportCsv(shopId, userId || undefined);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
