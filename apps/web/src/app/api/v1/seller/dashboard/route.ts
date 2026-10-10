import { NextResponse } from 'next/server';
import { getDashboardMetrics } from '@/lib/server/finops';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';

export async function GET(req: Request) {
  try {
    const context = await requireSellerContext(req);
    const metrics = await getDashboardMetrics(context.shop.id, context.user.id);
    return NextResponse.json(metrics);
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: err.message || 'Erreur tableau de bord' }, { status: 500 });
  }
}
