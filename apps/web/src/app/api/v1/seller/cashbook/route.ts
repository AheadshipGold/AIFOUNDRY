import { NextRequest, NextResponse } from 'next/server';
import { extractUserIdFromRequest } from '@/lib/server/auth';
import { getCashbook } from '@/lib/server/finops';

export async function GET(req: NextRequest) {
  try {
    const userId = await extractUserIdFromRequest(req);
    const shopId = req.nextUrl.searchParams.get('shopId') || undefined;
    const data = await getCashbook(shopId, userId || undefined);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
