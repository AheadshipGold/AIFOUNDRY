import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/server/orders';
import { requireSellerContext, SellerAuthError } from '@/lib/server/seller-access';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const context = await requireSellerContext(req);
    const body = await req.json();

    const updated = await updateOrderStatus(params.id, body, context.shop.id, context.user.id);
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err instanceof SellerAuthError) {
      return NextResponse.json({ message: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { message: err.message || 'Erreur lors de la mise à jour du statut de la commande' },
      { status: 400 }
    );
  }
}
