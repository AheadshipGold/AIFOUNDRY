import { NextRequest, NextResponse } from 'next/server';
import { exportFec } from '@/lib/server/finops';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';

export async function GET(req: NextRequest) {
  try {
    const context = await requireSellerContext(req);
    const result = await exportFec(context.shop.id, context.user.id);
    return NextResponse.json(result);
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
