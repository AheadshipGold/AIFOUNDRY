import { NextResponse } from 'next/server';
import { getOrderById } from '@/lib/server/orders';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const order = await getOrderById(params.id);
    return NextResponse.json(order);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Commande introuvable' }, { status: 404 });
  }
}
