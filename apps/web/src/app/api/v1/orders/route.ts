import { NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/server/orders';
import { extractUserIdFromRequest } from '@/lib/server/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shopId = searchParams.get('shopId') || undefined;
  const userId = await extractUserIdFromRequest(req);

  try {
    const orders = await getOrders(shopId, userId || undefined);
    return NextResponse.json(orders);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur commandes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await extractUserIdFromRequest(req);
    const body = await req.json();
    const order = await createOrder({ ...body, buyerId: userId || body.buyerId });
    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Erreur création commande' }, { status: 400 });
  }
}
