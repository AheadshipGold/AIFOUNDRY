import { NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/server/orders';
import { extractUserIdFromRequest } from '@/lib/server/auth';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shopId = searchParams.get('shopId') || undefined;

  try {
    // Shop-scoped listing: only owners / members / platform admins
    if (shopId) {
      const context = await requireSellerContext(req, shopId);
      const orders = await getOrders(context.shop.id);
      return NextResponse.json(orders);
    }

    // Buyer listing: strictly the authenticated user's own purchases
    const userId = await extractUserIdFromRequest(req);
    if (!userId) return NextResponse.json([]);
    const orders = await getOrders(undefined, userId);
    return NextResponse.json(orders);
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json({ message: err.message || 'Erreur commandes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await extractUserIdFromRequest(req);
    const body = await req.json();
    // Prioritize authenticated user ID, do not allow arbitrary buyerId spoofing
    const effectiveBuyerId = userId || undefined;
    const order = await createOrder({ ...body, buyerId: effectiveBuyerId });
    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur création commande' }, { status: 400 });
  }
}
