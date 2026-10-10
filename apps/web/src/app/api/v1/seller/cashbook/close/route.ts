import { NextRequest, NextResponse } from 'next/server';
import { closeDay } from '@/lib/server/finops';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';

export async function POST(req: NextRequest) {
  try {
    const context = await requireSellerContext(req);
    const body = await req.json();
    const result = await closeDay({ ...body, shopId: context.shop.id }, context.user.id);
    return NextResponse.json(result);
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
