import { NextResponse } from 'next/server';
import { getSellerOrders } from '@/lib/server/orders';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';

export const dynamic = 'force-dynamic';

/**
 * Orders RECEIVED by the authenticated seller's shop (sales),
 * as opposed to /orders which returns the user's own purchases.
 */
export async function GET(req: Request) {
  try {
    const context = await requireSellerContext(req);
    const orders = await getSellerOrders(context.shop.id);
    return NextResponse.json({
      shopId: context.shop.id,
      shopName: context.shop.name,
      orders,
      totalCount: orders.length,
    });
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: err.message || 'Erreur commandes vendeur' }, { status: 500 });
  }
}
